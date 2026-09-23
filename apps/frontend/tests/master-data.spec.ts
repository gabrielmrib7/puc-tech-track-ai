// spec: openspec/changes/master-data-crud/tasks.md
import { test, expect } from '@playwright/test';

test.describe('TechTrack master data operations flow (Customers, Equipment, Users)', () => {
  // MD-001: Bloqueio de acesso não autenticado às telas administrativas de master data
  test('MD-001: unauthenticated user is redirected to login when accessing master data screens', async ({
    page,
  }) => {
    // 1. Acessar /admin/customers
    await page.goto('/admin/customers');
    await expect(page).toHaveURL(/\/login(?:$|\?)/i, { timeout: 15000 });

    // 2. Acessar /admin/equipment
    await page.goto('/admin/equipment');
    await expect(page).toHaveURL(/\/login(?:$|\?)/i, { timeout: 15000 });

    // 3. Acessar /admin/users
    await page.goto('/admin/users');
    await expect(page).toHaveURL(/\/login(?:$|\?)/i, { timeout: 15000 });
  });

  // MD-002: Rejeição de requisições não autenticadas para as novas rotas de API de Customers
  test('MD-002: customer detail API endpoints reject unauthenticated requests', async ({
    request,
  }) => {
    const fakeId = '00000000-0000-0000-0000-000000000001';

    const getRes = await request.get(`/api/v1/customers/${fakeId}`);
    expect([401, 403]).toContain(getRes.status());

    const patchRes = await request.patch(`/api/v1/customers/${fakeId}`, {
      data: { name: 'Attempted Hack' },
    });
    expect([401, 403]).toContain(patchRes.status());

    const deleteRes = await request.delete(`/api/v1/customers/${fakeId}`);
    expect([401, 403]).toContain(deleteRes.status());
  });

  // MD-003: Rejeição de requisições não autenticadas para as rotas de API de Equipment
  test('MD-003: equipment detail API endpoints reject unauthenticated requests', async ({
    request,
  }) => {
    const fakeId = '00000000-0000-0000-0000-000000000002';

    const getRes = await request.get(`/api/v1/equipment/${fakeId}`);
    expect([401, 403]).toContain(getRes.status());

    const patchRes = await request.patch(`/api/v1/equipment/${fakeId}`, {
      data: { brand: 'Attempted Hack' },
    });
    expect([401, 403]).toContain(patchRes.status());

    const deleteRes = await request.delete(`/api/v1/equipment/${fakeId}`);
    expect([401, 403]).toContain(deleteRes.status());
  });

  // MD-004: Rejeição de requisições não autenticadas para as rotas de API de Users
  test('MD-004: user administration API endpoints reject unauthenticated requests', async ({
    request,
  }) => {
    const fakeId = '00000000-0000-0000-0000-000000000003';

    const listRes = await request.get('/api/v1/users');
    expect([401, 403]).toContain(listRes.status());

    const getRes = await request.get(`/api/v1/users/${fakeId}`);
    expect([401, 403]).toContain(getRes.status());

    const patchRes = await request.patch(`/api/v1/users/${fakeId}`, {
      data: { role: 'ADMIN', active: true },
    });
    expect([401, 403]).toContain(patchRes.status());

    const deleteRes = await request.delete(`/api/v1/users/${fakeId}`);
    expect([401, 403]).toContain(deleteRes.status());
  });
});
