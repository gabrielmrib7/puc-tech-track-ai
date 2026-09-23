import { PrismaClient } from '@prisma/client';
import { test, expect } from '@playwright/test';
import { clerk } from '@clerk/testing/playwright';
import { Webhook } from 'svix';

const prisma = new PrismaClient();

const hasClerkCredentials = Boolean(
  process.env.E2E_CLERK_USER_IDENTIFIER && process.env.E2E_CLERK_USER_PASSWORD,
);
const hasCustomerCredentials = Boolean(
  process.env.E2E_CLERK_CUSTOMER_IDENTIFIER && process.env.E2E_CLERK_CUSTOMER_PASSWORD,
);
const hasStaffCredentials = Boolean(
  process.env.E2E_CLERK_STAFF_IDENTIFIER && process.env.E2E_CLERK_STAFF_PASSWORD,
);
const hasWebhookSecret = Boolean(process.env.CLERK_WEBHOOK_SECRET);

function getClerkCredentials(role: 'customer' | 'staff') {
  const envMap = {
    customer: {
      identifier:
        process.env.E2E_CLERK_CUSTOMER_IDENTIFIER ?? process.env.E2E_CLERK_USER_IDENTIFIER,
      password: process.env.E2E_CLERK_CUSTOMER_PASSWORD ?? process.env.E2E_CLERK_USER_PASSWORD,
    },
    staff: {
      identifier: process.env.E2E_CLERK_STAFF_IDENTIFIER ?? process.env.E2E_CLERK_USER_IDENTIFIER,
      password: process.env.E2E_CLERK_STAFF_PASSWORD ?? process.env.E2E_CLERK_USER_PASSWORD,
    },
  } as const;

  return envMap[role];
}

function makeSvixHeaders(secret: string, payload: string, msgId: string) {
  const timestamp = new Date();
  const webhook = new Webhook(secret);

  return {
    'svix-id': msgId,
    'svix-timestamp': String(Math.floor(timestamp.getTime() / 1000)),
    'svix-signature': webhook.sign(msgId, timestamp, payload),
  };
}

async function postWebhook(request: Parameters<typeof test>[0]['request'], payload: Record<string, unknown>) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('CLERK_WEBHOOK_SECRET must be configured to run webhook tests.');
  }

  const json = JSON.stringify(payload);
  const headers = makeSvixHeaders(secret, json, payload.data?.id ? String(payload.data.id) : `msg_${Date.now()}`);

  return request.post('/api/webhooks/clerk', {
    headers,
    data: payload,
  });
}

test.describe('TechTrack auth flow', () => {
  test('AUTH-001: unauthenticated user is redirected to the login page from the root URL', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/login(?:$|\?)/i);

    const loginInput = page
      .locator(
        'input[name="identifier"], input[name="emailAddress"], input[type="email"], input[type="text"]',
      )
      .first();

    await expect(loginInput).toBeVisible({ timeout: 15000 });
  });

  test('AUTH-002: unauthenticated access to /portal is blocked', async ({ page }) => {
    await page.goto('/portal');

    await expect(page).toHaveURL(/\/login(?:$|\?)/i, { timeout: 15000 });
    await expect(page).not.toContainText('Acompanhe seus reparos');
  });

  test('AUTH-003: protected API endpoints reject requests without a Clerk session', async ({ request }) => {
    const customerOrders = await request.get('/api/v1/customer/orders');
    const adminDashboard = await request.get('/api/v1/admin/dashboard');

    expect([401, 403]).toContain(customerOrders.status());
    expect([401, 403]).toContain(adminDashboard.status());
  });

  test('AUTH-006: invalid credentials do not create a session', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login(?:$|\?)/i);

    await page.locator('input[name="identifier"], input[name="emailAddress"]').fill('invalid-user@example.com');
    await page.locator('input[name="password"]').fill('WrongPassword123!');
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/\/login(?:$|\?)/i, { timeout: 20000 });
    await expect(page.locator('text=/invalid|incorrect|not found|error/i')).toBeVisible({ timeout: 15000 });
  });

  test('AUTH-004: customer login redirects to the portal', async ({ page }) => {
    const customer = getClerkCredentials('customer');
    test.skip(
      !customer.identifier || !customer.password,
      'Set E2E_CLERK_CUSTOMER_IDENTIFIER and E2E_CLERK_CUSTOMER_PASSWORD (or E2E_CLERK_USER_IDENTIFIER and E2E_CLERK_USER_PASSWORD) to run the customer login flow.',
    );

    await page.goto('/login');
    await clerk.loaded({ page });

    await clerk.signIn({
      page,
      signInParams: {
        strategy: 'password',
        identifier: customer.identifier,
        password: customer.password,
      },
    });

    await expect(page).toHaveURL(/\/portal(?:$|\?)/i, { timeout: 20000 });
    await expect(page.getByRole('heading', { name: /acompanhe seus reparos/i })).toBeVisible();

    await page.reload();
    await expect(page).toHaveURL(/\/portal(?:$|\?)/i, { timeout: 20000 });
  });

  test('AUTH-005: staff login redirects to the admin dashboard', async ({ page }) => {
    const staff = getClerkCredentials('staff');
    test.skip(
      !staff.identifier || !staff.password,
      'Set E2E_CLERK_STAFF_IDENTIFIER and E2E_CLERK_STAFF_PASSWORD (or E2E_CLERK_USER_IDENTIFIER and E2E_CLERK_USER_PASSWORD) to run the staff login flow.',
    );

    await page.goto('/login');
    await clerk.loaded({ page });

    await clerk.signIn({
      page,
      signInParams: {
        strategy: 'password',
        identifier: staff.identifier,
        password: staff.password,
      },
    });

    await expect(page).toHaveURL(/\/admin\/dashboard(?:$|\?)/i, { timeout: 20000 });
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();

    await page.goto('/portal');
    await expect(page).toHaveURL(/\/login(?:$|\?)/i, { timeout: 20000 });
  });

  test('AUTH-007: user.created webhook syncs a local user record', async ({ request }) => {
    test.skip(!hasWebhookSecret, 'CLERK_WEBHOOK_SECRET must be configured to run webhook sync tests.');

    const clerkId = `clerk-created-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const email = `created-${Date.now()}@example.com`;
    const payload = {
      type: 'user.created',
      data: {
        id: clerkId,
        email_addresses: [{ email_address: email }],
        first_name: 'Login',
        last_name: 'Created',
      },
    };

    const response = await postWebhook(request, payload);

    expect(response.status()).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ received: true });

    const user = await prisma.user.findUnique({ where: { clerk_id: clerkId } });
    expect(user).not.toBeNull();
    expect(user?.email).toBe(email);
    expect(user?.name).toBe('Login Created');
    expect(user?.role).toBe('ATTENDANT');
  });

  test('AUTH-008: user.updated reprocessing is idempotent and preserves role', async ({ request }) => {
    test.skip(!hasWebhookSecret, 'CLERK_WEBHOOK_SECRET must be configured to run webhook sync tests.');

    const clerkId = `clerk-updated-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const initialEmail = `updated-${Date.now()}@example.com`;
    const updatedEmail = `updated-renamed-${Date.now()}@example.com`;

    const createPayload = {
      type: 'user.created',
      data: {
        id: clerkId,
        email_addresses: [{ email_address: initialEmail }],
        first_name: 'Original',
        last_name: 'Name',
      },
    };

    const firstResponse = await postWebhook(request, createPayload);
    expect(firstResponse.status()).toBe(200);

    const updatePayload = {
      type: 'user.updated',
      data: {
        id: clerkId,
        email_addresses: [{ email_address: updatedEmail }],
        first_name: 'Updated',
        last_name: 'Name',
      },
    };

    const secondResponse = await postWebhook(request, updatePayload);
    expect(secondResponse.status()).toBe(200);

    const thirdResponse = await postWebhook(request, updatePayload);
    expect(thirdResponse.status()).toBe(200);

    const users = await prisma.user.findMany({ where: { clerk_id: clerkId } });
    expect(users).toHaveLength(1);
    expect(users[0].email).toBe(updatedEmail);
    expect(users[0].name).toBe('Updated Name');
    expect(users[0].role).toBe('ATTENDANT');
  });

  test('AUTH-009: invalid webhook signature is rejected without writing user data', async ({ request }) => {
    test.skip(!hasWebhookSecret, 'CLERK_WEBHOOK_SECRET must be configured to run webhook sync tests.');

    const clerkId = `clerk-invalid-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const payload = {
      type: 'user.created',
      data: {
        id: clerkId,
        email_addresses: [{ email_address: `invalid-${Date.now()}@example.com` }],
        first_name: 'Bad',
        last_name: 'Signature',
      },
    };

    const response = await request.post('/api/webhooks/clerk', {
      headers: {
        'svix-id': 'msg_invalid',
        'svix-timestamp': String(Math.floor(Date.now() / 1000)),
        'svix-signature': 'v1,invalid-signature',
      },
      data: payload,
    });

    expect(response.status()).toBe(400);
    const storedUser = await prisma.user.findUnique({ where: { clerk_id: clerkId } });
    expect(storedUser).toBeNull();
  });

  test('AUTH-010: webhook without email is rejected and does not create a local user', async ({ request }) => {
    test.skip(!hasWebhookSecret, 'CLERK_WEBHOOK_SECRET must be configured to run webhook sync tests.');

    const clerkId = `clerk-no-email-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const payload = {
      type: 'user.created',
      data: {
        id: clerkId,
        email_addresses: [],
        first_name: 'Missing',
        last_name: 'Email',
      },
    };

    const response = await postWebhook(request, payload);

    expect(response.status()).toBe(422);
    const storedUser = await prisma.user.findUnique({ where: { clerk_id: clerkId } });
    expect(storedUser).toBeNull();
  });

  test('AUTH-011: unsupported Clerk events are accepted without creating or mutating a user', async ({ request }) => {
    test.skip(!hasWebhookSecret, 'CLERK_WEBHOOK_SECRET must be configured to run webhook sync tests.');

    const clerkId = `clerk-session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const payload = {
      type: 'session.created',
      data: {
        id: clerkId,
        user_id: clerkId,
      },
    };

    const response = await postWebhook(request, payload);

    expect(response.status()).toBe(200);
    const storedUser = await prisma.user.findUnique({ where: { clerk_id: clerkId } });
    expect(storedUser).toBeNull();
  });

  test.afterEach(async () => {
    if (hasClerkCredentials) {
      await prisma.user.deleteMany({
        where: {
          email: {
            contains: '@example.com',
          },
        },
      });
    }
  });
});
