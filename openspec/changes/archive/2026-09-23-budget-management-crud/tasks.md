## 1. Contracts and domain rules

- [x] 1.1 Define budget list/detail/create/update/delete DTOs and verify server totals ignore client-supplied amount
- [x] 1.2 Centralize pending-only mutability and role/ownership guards and verify all status/role combinations with unit tests
- [x] 1.3 Document the existing schema limitation around expiration/presentation fields and verify no unapproved migration is introduced

## 2. Budget API and transactions

- [x] 2.1 Implement pending budget update and delete commands scoped through the service order and verify conflict behavior for decided budgets
- [x] 2.2 Harden approval/rejection predicates for concurrent edits and verify exactly-once budget/order/history commits
- [x] 2.3 Add rollback integration tests for failures in budget, order, and history writes

## 3. Frontend budget workflows

- [x] 3.1 Add staff budget list/form/detail controls with edit/delete confirmation and verify pending-only controls
- [x] 3.2 Add customer budget decision view using the existing one-click endpoint and verify ownership, loading, conflict, and success states
- [x] 3.3 Refresh service-order detail, dashboard counts, and portal timeline after budget mutations and verify no stale decision is shown
- [x] 3.4 Add Playwright coverage for create, edit, delete-pending, approve, reject, repeat-decision, and forbidden access

## 4. Quality gates

- [x] 4.1 Run focused budget/domain/integration tests and verify decimal totals, RBAC, idempotency, and rollback
- [x] 4.2 Run `npx tsc --noEmit` and `npm run lint` and record unrelated pre-existing failures
