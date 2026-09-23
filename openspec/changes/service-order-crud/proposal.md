## Why

The recovery change restores service-order intake, listing, detail, and state actions, but it does not define a complete administrative lifecycle for correcting intake data or retiring an order safely. Service orders are operational records with immutable history, so their CRUD must use controlled edits and cancellation rather than unrestricted hard deletion.

## What Changes

- Add authorized service-order detail reads and controlled updates for editable intake fields before diagnosis begins.
- Add a safe delete command represented by administrative cancellation/archival, never physical deletion of an order with history.
- Add list/detail UI controls for edit, cancel, restore only where the state machine permits them, and explicit terminal-state messaging.
- Preserve atomic order numbering, transition validation, budget ACID decisions, customer isolation, and immutable history.
- Ensure every accepted mutation creates the appropriate history event in the same transaction.

## Capabilities

### New Capabilities

None. This change extends the existing service-order intake and state-machine capabilities.

### Modified Capabilities

- `service-order-intake`: Extend intake records with authorized detail, controlled edit, and safe cancellation behavior.
- `finite-state-machine-engine`: Define the mutation boundary for editable and terminal service-order records.

## Impact

- Service-order collection/detail route handlers and application/domain services.
- Prisma queries for dependency-safe updates and cancellation; no hard-delete migration.
- Staff order list/detail screens and customer portal handling of cancelled orders.
- Integration tests for state matrix, authorization, history atomicity, and isolation; Playwright coverage for edit/cancel flows.
