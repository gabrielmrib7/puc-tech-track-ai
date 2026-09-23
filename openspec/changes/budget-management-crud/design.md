## Context

See `proposal.md`. `Budget` belongs to a service order and currently has `PENDING`, `APPROVED`, `REJECTED`, and `EXPIRED` states. Customer approval/rejection already requires a transaction that updates the budget, order, and history together.

## Goals / Non-Goals

**Goals:**

- Give technicians/admins a complete pending-budget editing workflow and give customers a clear decision view.
- Make budget mutability and decision conflicts explicit in both API and UI.
- Reuse the existing budget total calculator and transaction boundary.

**Non-Goals:**

- Editing or deleting approved, rejected, or expired budgets.
- Replacing the existing customer one-click decision flow.
- Introducing invoices, payment capture, or accounting integration.

## Decisions

- **Treat `PENDING` as the draft/editable state.** `PATCH` and `DELETE` are allowed only while pending and before a decision. This supplies CRUD without violating financial immutability.
- **Keep decisions on the dedicated transaction endpoint.** Approve/reject remains the only operation that can change a budget to a decided state and must update `ServiceOrder` and `ServiceOrderHistory` atomically.
- **Use decimal-safe server totals.** The server recalculates amount from parts/labor and ignores client-supplied totals; response types serialize decimal values consistently for the UI.
- **Scope every budget through its service order.** Staff access follows order permissions; CUSTOMER access is limited to their own order and pending budget. No standalone public budget identifier should bypass ownership checks.
- **Refresh dependent views after mutation.** Service-order detail, dashboard pending counts, and customer portal data are refreshed after create/update/delete/decision success.

## Risks / Trade-offs

- [A budget may be edited while a customer decides it] -> Use a transaction predicate requiring `PENDING` and return `409` when no row is changed.
- [The current schema lacks an explicit presentation/expiration timestamp] -> Do not invent lifecycle fields in this change; model only the states supported by the existing schema and document any additive schema need separately.
- [Hard deletion could remove financial context] -> Restrict deletion to pending drafts and preserve all decided records.

## Migration Plan

1. Add state-aware application commands and route contracts without changing decision behavior.
2. Add staff/customer screens and focused tests.
3. Roll back by disabling new CRUD controls; preserve all budget and history rows.
