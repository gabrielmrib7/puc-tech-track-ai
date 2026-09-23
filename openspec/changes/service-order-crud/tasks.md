## 1. Domain and API contracts

- [ ] 1.1 Define service-order detail/update/cancel DTOs and verify protected fields cannot be changed through generic PATCH
- [ ] 1.2 Consolidate cancellation and editable-field rules in the domain/application layer and verify the full state matrix with unit tests
- [ ] 1.3 Add staff and CUSTOMER detail authorization queries and verify cross-customer access returns `403` or `404`

## 2. Transactional service-order operations

- [ ] 2.1 Implement pre-diagnosis PATCH with relation validation and verify accepted changes append one history event atomically
- [ ] 2.2 Implement cancellation/archive command and verify terminal states, concurrent updates, and rollback on history failure
- [ ] 2.3 Add read-only history response mapping and verify no update/delete route is exposed for audit records

## 3. Frontend lifecycle

- [ ] 3.1 Add staff edit and cancel controls with state-aware confirmation and verify controls disappear or disable for terminal orders
- [ ] 3.2 Refresh order list/detail and customer portal timeline after mutation and verify cancelled orders are humanized correctly
- [ ] 3.3 Add Playwright coverage for edit, cancel, terminal rejection, and customer isolation journeys

## 4. Quality gates

- [ ] 4.1 Run focused state-machine and integration tests and verify order/history atomicity
- [ ] 4.2 Run `npx tsc --noEmit` and `npm run lint` and record unrelated pre-existing failures
