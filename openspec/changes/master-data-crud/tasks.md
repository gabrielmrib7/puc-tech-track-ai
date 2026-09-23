## 1. Contracts and authorization

- [ ] 1.1 Map existing customer, equipment, and user schemas into shared DTOs and verify typecheck passes without changing current collection behavior
- [ ] 1.2 Add resource-specific authorization guards and verify ADMIN/ATTENDANT/CUSTOMER allowlists with integration tests
- [ ] 1.3 Add detail route contracts and verify validation, not-found, conflict, and authorization response shapes

## 2. Customer and equipment CRUD

- [ ] 2.1 Implement customer `GET/PATCH/DELETE` detail use cases and verify normalization, duplicate conflicts, and dependency-safe deletion tests
- [ ] 2.2 Implement equipment `GET/PATCH/DELETE` detail use cases and verify customer relation, serial conflicts, and dependency-safe deletion tests
- [ ] 2.3 Wrap deletion dependency checks and deletes in transactions and verify concurrent/dependent deletion preserves service orders

## 3. User administration

- [ ] 3.1 Implement ADMIN-only user list/detail/update/deactivation routes and verify secrets are excluded from responses
- [ ] 3.2 Enforce inactive-user rejection and server-authoritative role changes and verify escalation and reactivation tests

## 4. Administrative frontend

- [ ] 4.1 Add customer and equipment list/detail forms with edit/delete confirmation and verify loading, empty, conflict, and success states
- [ ] 4.2 Add ADMIN user management screen with edit, role, activate, and deactivate controls and verify non-admin routes are unavailable
- [ ] 4.3 Add Playwright coverage for customer, equipment, and user CRUD journeys and verify list/detail refresh after mutations

## 5. Quality gates

- [ ] 5.1 Run focused Vitest/integration tests for all three resources and verify RBAC and dependency invariants
- [ ] 5.2 Run `npx tsc --noEmit` and `npm run lint` and record any unrelated pre-existing failures
