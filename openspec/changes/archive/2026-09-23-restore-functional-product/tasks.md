## 1. Baseline and contracts

- [x] 1.1 Run the current typecheck, lint, unit tests, and available Playwright smoke flow; record failures and confirm the baseline is reproducible before implementation
- [x] 1.2 Map the existing auth, customer, equipment, service-order, dashboard, and history response contracts into shared TypeScript types; verify the types compile without changing runtime behavior
- [x] 1.3 Define the supported route map for login, post-login, dashboard, customers, equipment, service orders, customer portal, and API endpoints; verify no required navigation destination remains a dead `#` link

## 2. Authentication and local provisioning

- [x] 2.1 Make the Clerk sign-in/sign-up screen expose functional account creation, sign-in, sign-out, validation, loading, and recovery states; verify with focused auth component or Playwright tests
- [x] 2.2 Harden Clerk webhook verification and idempotent user synchronization, including required environment documentation and event error responses; verify duplicate delivery tests do not create duplicate local users
- [x] 2.3 Add authenticated post-login provisioning recovery for sessions whose local User record is missing; verify the flow no longer redirects indefinitely to `/login`
- [x] 2.4 Implement the server-authoritative first-ADMIN bootstrap with one-time enforcement and no client-controlled role assignment; verify first bootstrap succeeds, repeat bootstrap is rejected, and non-admin escalation is blocked
- [x] 2.5 Verify role-aware redirects and protected-route behavior for ADMIN, ATTENDANT, TECHNICIAN, CUSTOMER, unauthenticated users, and unknown local users with unit/integration tests

## 3. Shared frontend data and feedback

- [x] 3.1 Add a small typed request/error boundary for API calls that preserves status, validation details, conflicts, and authorization failures; verify parsing tests cover success, JSON errors, and non-JSON failures
- [x] 3.2 Add reusable loading, empty, error, retry, success, and disabled-submit states for data-backed forms and pages; verify duplicate submission is prevented during an active mutation
- [x] 3.3 Update the administrative shell with real route links, authenticated identity information, and responsive navigation; verify every visible navigation item resolves to a supported page

## 4. Real dashboard and service-order listing

- [x] 4.1 Replace dashboard constants with the authorized dashboard API query and typed metric rendering; verify the page shows database values and never presents mock values after a failed request
- [x] 4.2 Add dashboard loading, error, empty-attention, and retry states; verify ADMIN/ATTENDANT access and CUSTOMER rejection are reflected in UI and API tests
- [x] 4.3 Replace the service-order list fixture with the real listing endpoint, including status, text, date, sorting, pagination, and URL/query state; verify filters return only matching persisted orders
- [x] 4.4 Add order-list empty, loading, authorization, network-error, and pagination states; verify a newly created order appears through refresh or returned list state

## 5. Customer and equipment operations

- [x] 5.1 Implement the staff customer page and form using the customer API with normalized validation, search, pagination, duplicate conflict, and success feedback; verify valid creation and duplicate rejection
- [x] 5.2 Implement the staff equipment page and customer-scoped form using the equipment API; verify invalid customer references, duplicate serial conflicts, and successful creation
- [x] 5.3 Wire customer selection to customer-scoped equipment loading and preserve selected values across validation errors; verify only equipment belonging to the selected customer is offered
- [x] 5.4 Add authorization and empty states for customer/equipment screens; verify CUSTOMER cannot access staff management and no fake rows appear on empty databases

## 6. Service-order intake and detail operations

- [x] 6.1 Connect the new-order form to customer search, equipment selection, validated intake fields, and the service-order creation endpoint; verify successful creation produces a unique order and initial history
- [x] 6.2 Handle intake validation, relation errors, duplicate submissions, and server failures without partial client state; verify failed intake does not create an order
- [x] 6.3 Connect order detail to persisted customer, equipment, status, diagnosis, budget, delivery, and immutable timeline data; verify loading, missing-order, forbidden, and empty-history states
- [x] 6.4 Expose only role-appropriate diagnosis, budget, transition, and delivery actions and refresh detail/list state after success; verify valid transitions update history and invalid transitions preserve the prior state
- [x] 6.5 Verify terminal DELIVERED and CANCELLED behavior in the UI and API; mutation attempts after terminal state must be rejected and visibly explained

## 7. Verification and release readiness

- [x] 7.1 Add or update unit and integration coverage for provisioning, bootstrap, request errors, customer/equipment workflows, dashboard authorization, order filters, and state-machine actions; verify the targeted Vitest suite passes
- [x] 7.2 Add authenticated Playwright coverage for sign-up/sign-in or test-user provisioning, staff dashboard, customer/equipment creation, order intake, order detail, and customer isolation; verify the configured test environment completes the critical journeys
- [x] 7.3 Run `npx tsc --noEmit`, `npm run lint`, `npm run test`, and `npm run test:e2e`; record any pre-existing environmental failures separately and do not mark affected tasks complete without evidence
- [x] 7.4 Review the final diff and configuration for hard-coded business data, dead links, leaked secrets, destructive migration commands, and regressions to RBAC/ACID invariants; verify the change is ready for archive only after all required checks pass