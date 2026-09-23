## Why

The database has a first-class `budgets` table and existing create/list/approve/reject routes, but the recovery plan does not define a usable budget management screen or update/delete semantics. Budget CRUD must be state-aware because approval and rejection are financial decisions coupled atomically to the service order and immutable history.

## What Changes

- Add authorized budget list/detail/create/update operations for pending budgets.
- Add a safe delete operation only for pending budgets that have not been presented or decided; decided budgets remain immutable.
- Add staff budget management UI linked to service-order detail and a customer decision view using the existing transaction endpoint.
- Preserve decimal-safe total calculation, idempotent approve/reject decisions, order-state transitions, and rollback guarantees.
- Return explicit conflicts when a budget is already decided, expired, or no longer editable.

## Capabilities

### New Capabilities

None. This change extends the existing budget and ACID approval capabilities.

### Modified Capabilities

- `budget-management`: Extend budget creation with list, detail, pending update, and safe removal semantics.
- `acid-approval-transaction`: Preserve and expose atomic decision behavior while making decided budgets immutable.

## Impact

- Budget module schemas/use cases and route handlers under `src/app/api/v1/service-orders/[id]/budget` plus any administrative budget index route.
- Service-order detail, dashboard pending-budget action, and customer approval UI.
- Vitest integration tests for totals, authorization, idempotency, and rollback; Playwright coverage for staff edit/delete and customer decision.
- No schema migration is expected unless implementation identifies a concrete missing field; any such change must be additive and reviewed separately.
