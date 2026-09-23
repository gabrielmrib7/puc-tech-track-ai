## Context

See `proposal.md`. `ServiceOrder` has restrictive customer/equipment relations and a separate immutable `ServiceOrderHistory` table. Existing status, diagnosis, delivery, and budget routes already enforce portions of the lifecycle but lack one coherent detail mutation contract.

## Goals / Non-Goals

**Goals:**

- Complete service-order read/update/cancel behavior without breaking the existing state machine.
- Make list/detail screens reflect persisted data after every successful mutation.
- Keep history append-only and transactionally coupled to every accepted order mutation.

**Non-Goals:**

- Hard deletion of service orders or history rows.
- Reopening `DELIVERED` or `CANCELLED` orders.
- Replacing existing diagnosis, budget, delivery, or customer decision workflows.

## Decisions

- **Use PATCH for editable intake fields.** Customer, equipment, reported problem, accessories, and estimated completion may be changed only before diagnosis has started and only by authorized staff. Status changes continue through the state-machine command, not arbitrary PATCH fields.
- **Represent delete as cancellation.** For pre-terminal orders, an authorized cancellation command transitions to `CANCELLED` and records history. For `DELIVERED` or already `CANCELLED`, return `409/422`. This preserves operational and audit records.
- **Keep history read-only.** Detail and API responses may list history in chronological order, but no UI or generic CRUD route may update/delete it.
- **Use one transaction per accepted mutation.** The order update and history append must commit or roll back together, with optimistic predicates on the current status where needed.
- **Enforce customer isolation at query construction.** CUSTOMER requests are scoped by their linked `customer_id`; staff permissions remain role-based.

## Risks / Trade-offs

- [Users expect a literal trash action] -> Label it as cancel/archive and explain that audit records are retained.
- [Editing an order can conflict with diagnosis starting concurrently] -> Recheck status inside the transaction and reject if it has advanced.
- [Existing routes may duplicate transition logic] -> Consolidate through the existing domain state-machine service before adding new handlers.

## Migration Plan

1. Add domain commands and detail handlers while keeping existing endpoints backward compatible.
2. Add focused state/history tests, then wire staff and portal UI states.
3. Roll back by hiding new controls and reverting handlers; retain all existing orders and histories.
