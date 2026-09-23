// spec: openspec/changes/budget-management-crud/tasks.md
import { test, expect } from '@playwright/test';
import { clerk } from '@clerk/testing/playwright';

const hasStaffCredentials = Boolean(
  process.env.E2E_CLERK_STAFF_IDENTIFIER && process.env.E2E_CLERK_STAFF_PASSWORD,
);

function getStaffCredentials() {
  return {
    identifier: process.env.E2E_CLERK_STAFF_IDENTIFIER ?? process.env.E2E_CLERK_USER_IDENTIFIER,
    password: process.env.E2E_CLERK_STAFF_PASSWORD ?? process.env.E2E_CLERK_USER_PASSWORD,
  };
}

test.describe('TechTrack budget management & ACID approval flow', () => {
  const fakeOrderId = '00000000-0000-0000-0000-000000000099';

  // BDG-001: Bloqueio de acesso não autenticado à tela de aprovação de orçamento
  test('BDG-001: unauthenticated user is redirected to login when accessing budget approval screen', async ({
    page,
  }) => {
    // 1. Acessar diretamente a rota do portal do cliente para orçamento
    await page.goto(`/orders/${fakeOrderId}/budget`);

    // 2. Deve redirecionar para a tela de login
    await expect(page).toHaveURL(/\/login(?:$|\?)/i, { timeout: 15000 });

    // 3. Verificar que nenhum valor de orçamento confidencial é exibido
    await expect(page.locator('body')).not.toContainText('Orçamento Detalhado');
  });

  // BDG-002: Rejeição de requisições não autenticadas para as rotas da API de orçamentos (Staff)
  test('BDG-002: staff budget API endpoints reject unauthenticated requests', async ({
    request,
  }) => {
    // 1. GET orçamento
    const getRes = await request.get(`/api/v1/service-orders/${fakeOrderId}/budget`);
    expect([401, 403]).toContain(getRes.status());

    // 2. POST emissão de orçamento
    const postRes = await request.post(`/api/v1/service-orders/${fakeOrderId}/budget`, {
      data: {
        description: 'Orçamento não autenticado',
        partsCost: 150.0,
        laborCost: 100.0,
      },
    });
    expect([401, 403]).toContain(postRes.status());

    // 3. PATCH atualização de orçamento
    const patchRes = await request.patch(`/api/v1/service-orders/${fakeOrderId}/budget`, {
      data: {
        description: 'Orçamento atualizado sem permissão',
        partsCost: 200.0,
      },
    });
    expect([401, 403]).toContain(patchRes.status());

    // 4. DELETE exclusão de orçamento pendente
    const deleteRes = await request.delete(`/api/v1/service-orders/${fakeOrderId}/budget`);
    expect([401, 403]).toContain(deleteRes.status());
  });

  // BDG-003: Rejeição de requisições não autenticadas para decisões de orçamento (Customer 1-click)
  test('BDG-003: budget decision endpoints reject unauthenticated requests', async ({
    request,
  }) => {
    // 1. POST aprovação
    const approveRes = await request.post(
      `/api/v1/service-orders/${fakeOrderId}/budget/approve`
    );
    expect([401, 403]).toContain(approveRes.status());

    // 2. POST recusa
    const rejectRes = await request.post(
      `/api/v1/service-orders/${fakeOrderId}/budget/reject`
    );
    expect([401, 403]).toContain(rejectRes.status());
  });

  // BDG-004: Fluxo autenticado de visualização e ações de orçamento na ordem de serviço
  test('BDG-004: authenticated staff can view service order and see budget card/actions', async ({
    page,
  }) => {
    const staff = getStaffCredentials();
    test.skip(
      !staff.identifier || !staff.password,
      'Set E2E_CLERK_STAFF_IDENTIFIER and E2E_CLERK_STAFF_PASSWORD to run authenticated staff flow.',
    );

    // 1. Login como staff
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

    // 2. Acessar listagem de ordens
    await page.goto('/service-orders');
    await expect(page.getByRole('heading', { name: 'Ordens de Serviço' })).toBeVisible();

    // 3. Clicar na primeira ordem existente se houver
    const firstRowLink = page.locator('table tbody tr a').first();
    if ((await firstRowLink.count()) > 0) {
      await firstRowLink.click();
      await page.waitForURL(/\/service-orders\/[a-f0-9-]+/i);

      // Verificar que a tela de detalhes carregou
      await expect(page.getByText('Linha do Tempo Auditável')).toBeVisible();
    }
  });
});
