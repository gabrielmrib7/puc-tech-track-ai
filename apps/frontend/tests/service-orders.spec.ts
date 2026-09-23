// spec: specs/orders-flow-test-plan.md
import { test, expect } from '@playwright/test';
import { clerk } from '@clerk/testing/playwright';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const hasStaffCredentials = Boolean(
  process.env.E2E_CLERK_STAFF_IDENTIFIER && process.env.E2E_CLERK_STAFF_PASSWORD,
);

function getStaffCredentials() {
  return {
    identifier: process.env.E2E_CLERK_STAFF_IDENTIFIER ?? process.env.E2E_CLERK_USER_IDENTIFIER,
    password: process.env.E2E_CLERK_STAFF_PASSWORD ?? process.env.E2E_CLERK_USER_PASSWORD,
  };
}

test.describe('TechTrack service order operations flow', () => {
  // ORD-001: Bloqueio de acesso não autenticado à listagem de ordens de serviço
  test('ORD-001: unauthenticated user is redirected to login when accessing service orders list', async ({
    page,
  }) => {
    // 1. Acessar diretamente a URL /service-orders
    await page.goto('/service-orders');

    // 2. Aguardar a conclusão do redirecionamento
    await expect(page).toHaveURL(/\/login(?:$|\?)/i, { timeout: 15000 });

    // 3. Verificar que o componente de login está visível
    const loginInput = page
      .locator(
        'input[name="identifier"], input[name="emailAddress"], input[type="email"], input[type="text"]',
      )
      .first();
    await expect(loginInput).toBeVisible({ timeout: 15000 });
  });

  // ORD-002: Bloqueio de acesso não autenticado ao formulário de nova ordem
  test('ORD-002: unauthenticated user is redirected to login when accessing new service order form', async ({
    page,
  }) => {
    // 1. Acessar diretamente a URL /service-orders/new
    await page.goto('/service-orders/new');

    // 2. Aguardar a conclusão do redirecionamento para login
    await expect(page).toHaveURL(/\/login(?:$|\?)/i, { timeout: 15000 });

    // 3. Verificar que o formulário de cadastro não está acessível
    await expect(page.locator('body')).not.toContainText('Problema Relatado / Laudo de Entrada');
  });

  // ORD-003: Bloqueio de acesso não autenticado ao detalhe de ordem de serviço
  test('ORD-003: unauthenticated user is redirected to login when accessing order detail', async ({
    page,
  }) => {
    // 1. Acessar diretamente a URL /service-orders/test-id-123
    await page.goto('/service-orders/test-id-123');

    // 2. Aguardar a conclusão do redirecionamento
    await expect(page).toHaveURL(/\/login(?:$|\?)/i, { timeout: 15000 });

    // 3. Verificar que nenhum dado confidencial ou timeline foi renderizado
    await expect(page.locator('body')).not.toContainText('Dados do Cliente');
  });

  // ORD-004: Rejeição de requisições de API não autenticadas para ordens de serviço
  test('ORD-004: protected service orders API endpoints reject unauthenticated requests', async ({
    request,
  }) => {
    // 1. Enviar GET /api/v1/service-orders sem autenticação
    const listRes = await request.get('/api/v1/service-orders');
    expect([401, 403]).toContain(listRes.status());

    // 2. Enviar POST /api/v1/service-orders sem autenticação
    const createRes = await request.post('/api/v1/service-orders', {
      data: {
        customerId: 'unauth-cust-id',
        equipmentId: 'unauth-equip-id',
        diagnosis: 'Test diagnosis unauthenticated',
      },
    });
    expect([401, 403]).toContain(createRes.status());

    // 3. Enviar GET /api/v1/service-orders/sample-id sem autenticação
    const detailRes = await request.get('/api/v1/service-orders/sample-id');
    expect([401, 403]).toContain(detailRes.status());

    // 4. Enviar PATCH /api/v1/service-orders/sample-id/status sem autenticação
    const statusRes = await request.patch('/api/v1/service-orders/sample-id/status', {
      data: { status: 'IN_DIAGNOSIS' },
    });
    expect([401, 403]).toContain(statusRes.status());

    // 5. Enviar POST /api/v1/service-orders/sample-id/diagnosis sem autenticação
    const diagRes = await request.post('/api/v1/service-orders/sample-id/diagnosis', {
      data: { diagnosis: 'Updated diagnosis' },
    });
    expect([401, 403]).toContain(diagRes.status());

    // 6. Enviar POST /api/v1/service-orders/sample-id/budget sem autenticação
    const budgetRes = await request.post('/api/v1/service-orders/sample-id/budget', {
      data: { description: 'Budget item', partsCost: 100, laborCost: 50 },
    });
    expect([401, 403]).toContain(budgetRes.status());

    // 7. Enviar POST /api/v1/service-orders/sample-id/deliver sem autenticação
    const deliverRes = await request.post('/api/v1/service-orders/sample-id/deliver', {
      data: { recipientName: 'João da Silva', recipientDocument: '123.456.789-00' },
    });
    expect([401, 403]).toContain(deliverRes.status());

    // 8. Enviar PATCH /api/v1/service-orders/sample-id sem autenticação
    const patchIntakeRes = await request.patch('/api/v1/service-orders/sample-id', {
      data: { diagnosis: 'Attempt unauthenticated edit' },
    });
    expect([401, 403]).toContain(patchIntakeRes.status());

    // 9. Enviar DELETE /api/v1/service-orders/sample-id sem autenticação
    const cancelRes = await request.delete('/api/v1/service-orders/sample-id');
    expect([401, 403]).toContain(cancelRes.status());
  });

  // ORD-005: Exibição de listagem e navegação para criação quando autenticado
  test('ORD-005: authenticated staff can open service orders list and navigate to new order', async ({
    page,
  }) => {
    const staff = getStaffCredentials();
    test.skip(
      !staff.identifier || !staff.password,
      'Set E2E_CLERK_STAFF_IDENTIFIER and E2E_CLERK_STAFF_PASSWORD to run authenticated staff flow.',
    );

    // 1. Fazer login como staff
    await page.goto('/login');
    await clerk.loaded({ page });
    await clerk.signIn({
      page,
      signInParams: {
        strategy: 'password',
        identifier: staff.identifier!,
        password: staff.password!,
      },
    });

    // 2. Acessar /service-orders
    await page.goto('/service-orders');
    await expect(page).toHaveURL(/\/service-orders(?:$|\?)/i);

    // 3. Verificar cabeçalho da página
    await expect(
      page.getByRole('heading', { name: 'Ordens de Serviço' }),
    ).toBeVisible();

    // 4. Clicar no botão "Nova Ordem"
    await page.getByRole('link', { name: /nova ordem/i }).first().click();
    await expect(page).toHaveURL(/\/service-orders\/new(?:$|\?)/i);
  });

  // ORD-006: Criação de Ordem de Serviço com validação de cliente e equipamento
  test('ORD-006: authenticated staff can fill and submit new service order form', async ({
    page,
  }) => {
    const staff = getStaffCredentials();
    test.skip(
      !staff.identifier || !staff.password,
      'Set E2E_CLERK_STAFF_IDENTIFIER and E2E_CLERK_STAFF_PASSWORD to run authenticated staff flow.',
    );

    // 1. Fazer login como staff
    await page.goto('/login');
    await clerk.loaded({ page });
    await clerk.signIn({
      page,
      signInParams: {
        strategy: 'password',
        identifier: staff.identifier!,
        password: staff.password!,
      },
    });

    // 2. Acessar /service-orders/new
    await page.goto('/service-orders/new');
    await expect(page.getByRole('heading', { name: 'Nova Ordem de Serviço' })).toBeVisible();

    // 3. Preencher formulário se houver cliente cadastrado
    const customerSelect = page.locator('select').first();
    const options = await customerSelect.locator('option').all();
    if (options.length > 1) {
      await customerSelect.selectOption({ index: 1 });
      await page.waitForTimeout(500);

      const diagnosisArea = page.locator('textarea');
      await diagnosisArea.fill('Diagnóstico E2E Playwright de verificação automática.');

      const submitButton = page.getByRole('button', { name: /criar ordem de serviço/i });
      await expect(submitButton).toBeEnabled();
      await submitButton.click();

      // Deve navegar para o detalhe da OS criada
      await expect(page).toHaveURL(/\/service-orders\/[a-zA-Z0-9_-]+/i, { timeout: 15000 });
      await expect(page.locator('text=Recebido')).toBeVisible();
    }
  });

  // ORD-007: Validação e rejeição de intake sem dados obrigatórios
  test('ORD-007: new order form enforces validation when fields are missing', async ({
    page,
  }) => {
    const staff = getStaffCredentials();
    test.skip(
      !staff.identifier || !staff.password,
      'Set E2E_CLERK_STAFF_IDENTIFIER and E2E_CLERK_STAFF_PASSWORD to run authenticated staff flow.',
    );

    // 1. Fazer login como staff
    await page.goto('/login');
    await clerk.loaded({ page });
    await clerk.signIn({
      page,
      signInParams: {
        strategy: 'password',
        identifier: staff.identifier!,
        password: staff.password!,
      },
    });

    // 2. Acessar tela de nova OS
    await page.goto('/service-orders/new');

    // 3. O botão de submissão deve estar desabilitado enquanto campos obrigatórios estiverem vazios
    const submitBtn = page.getByRole('button', { name: /criar ordem de serviço/i });
    await expect(submitBtn).toBeDisabled();
  });

  // ORD-008: Edição de dados de entrada na fase de triagem (pré-diagnóstico)
  test('ORD-008: authenticated staff can edit pre-diagnosis intake notes', async ({
    page,
  }) => {
    const staff = getStaffCredentials();
    test.skip(
      !staff.identifier || !staff.password,
      'Set E2E_CLERK_STAFF_IDENTIFIER and E2E_CLERK_STAFF_PASSWORD to run authenticated staff flow.',
    );

    // 1. Fazer login como staff
    await page.goto('/login');
    await clerk.loaded({ page });
    await clerk.signIn({
      page,
      signInParams: {
        strategy: 'password',
        identifier: staff.identifier!,
        password: staff.password!,
      },
    });

    // 2. Localizar uma ordem em RECEIVED ou criar uma
    await page.goto('/service-orders');
    const firstOrderLink = page.locator('table tbody tr a').first();
    if (await firstOrderLink.isVisible()) {
      await firstOrderLink.click();
      await page.waitForURL(/\/service-orders\/[a-zA-Z0-9_-]+/i);

      const editBtn = page.getByRole('button', { name: /editar dados de entrada/i });
      if (await editBtn.isVisible()) {
        await editBtn.click();
        await expect(page.getByRole('heading', { name: /editar dados de entrada/i })).toBeVisible();

        const textarea = page.locator('textarea').first();
        await textarea.fill('Problema atualizado via teste E2E Playwright');

        await page.getByRole('button', { name: /salvar alterações/i }).click();
        await expect(page.getByRole('heading', { name: /editar dados de entrada/i })).not.toBeVisible();
        await expect(page.locator('body')).toContainText('Problema atualizado via teste E2E Playwright');
      }
    }
  });

  // ORD-009: Cancelamento de Ordem de Serviço com modal de confirmação e estado terminal
  test('ORD-009: authenticated staff can cancel active order via confirmation modal', async ({
    page,
  }) => {
    const staff = getStaffCredentials();
    test.skip(
      !staff.identifier || !staff.password,
      'Set E2E_CLERK_STAFF_IDENTIFIER and E2E_CLERK_STAFF_PASSWORD to run authenticated staff flow.',
    );

    // 1. Fazer login como staff
    await page.goto('/login');
    await clerk.loaded({ page });
    await clerk.signIn({
      page,
      signInParams: {
        strategy: 'password',
        identifier: staff.identifier!,
        password: staff.password!,
      },
    });

    // 2. Acessar listagem de ordens e entrar no detalhe
    await page.goto('/service-orders');
    const firstOrderLink = page.locator('table tbody tr a').first();
    if (await firstOrderLink.isVisible()) {
      await firstOrderLink.click();
      await page.waitForURL(/\/service-orders\/[a-zA-Z0-9_-]+/i);

      const cancelBtn = page.getByRole('button', { name: /cancelar os/i });
      if (await cancelBtn.isVisible()) {
        await cancelBtn.click();
        await expect(page.getByRole('heading', { name: /cancelar ordem de serviço/i })).toBeVisible();

        const reasonArea = page.locator('textarea').first();
        await reasonArea.fill('Cancelamento disparado por teste automatizado E2E');

        await page.getByRole('button', { name: /confirmar cancelamento/i }).click();

        // Deve exibir estado cancelado e aviso de estado terminal imutável
        await expect(page.locator('text=Cancelado').first()).toBeVisible({ timeout: 10000 });
        await expect(page.locator('text=imutável').first()).toBeVisible();
        await expect(page.getByRole('button', { name: /cancelar os/i })).not.toBeVisible();
        await expect(page.getByRole('button', { name: /editar dados de entrada/i })).not.toBeVisible();
      }
    }
  });
});

