import { expect, test as setup } from '@playwright/test';
import { clerk } from '@clerk/testing/playwright';

setup('authenticate with Clerk', async ({ page }) => {
  const identifier = process.env.E2E_CLERK_USER_IDENTIFIER;
  const password = process.env.E2E_CLERK_USER_PASSWORD;

  if (!identifier || !password) {
    throw new Error(
      'E2E_CLERK_USER_IDENTIFIER and E2E_CLERK_USER_PASSWORD must be set to run Clerk-authenticated Playwright tests.',
    );
  }

  await page.goto('/login');
  await clerk.loaded({ page });

  await clerk.signIn({
    page,
    signInParams: {
      strategy: 'password',
      identifier,
      password,
    },
  });

  await page.goto('/');
  await expect(page).not.toHaveURL(/\/login(?:$|\?)/i);

  await page.context().storageState({ path: 'playwright/.auth/user.json' });
});
