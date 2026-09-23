## Context

The current Next.js application already has Clerk, Prisma, route handlers, domain schemas, and several use cases, but the presentation layer is inconsistent with them. The dashboard and order list contain hard-coded data, the shared shell has dead navigation targets, and post-login depends on a local User record that is only created through a configured Clerk webhook. Existing backend authorization, service-order transitions, and budget transaction boundaries are the constraints for this recovery.

See `proposal.md` for motivation and the capability specs for externally observable behavior.

## Goals / Non-Goals

**Goals:**

- Establish one reliable identity lifecycle from provider sign-up through local provisioning and role-aware routing.
- Use the existing API and application modules as the source of truth for staff screens.
- Provide reusable client-side request and feedback patterns for loading, errors, empty results, conflicts, and successful mutations.
- Complete the operational path from customer/equipment selection to service-order creation, listing, detail, and domain-controlled actions.
- Make the recovery verifiable with focused unit/integration tests and Playwright flows.

**Non-Goals:**

- Replacing Clerk, Prisma, Next.js, or the existing styling stack.
- Creating a second authentication system or allowing public role selection.
- Redesigning the service-order state machine, budget transaction semantics, or database model unless implementation exposes a concrete contract defect.
- Adding real production secrets, external seed data, or destructive migrations.
- Building unrelated analytics, notifications, or settings features beyond navigation and honest empty/unavailable states.

## Decisions

### Use provider identity plus local User as a two-step lifecycle

Clerk remains the identity authority and the local `User` remains the application authorization authority. The webhook handler will be made verifiable and idempotent, while post-login will have a bounded recovery path for a session whose webhook has not yet arrived. This is preferred over authorizing directly from provider metadata because the application already scopes roles and ownership through Prisma.

Alternative considered: authorize all screens from Clerk claims only. Rejected because it bypasses the existing local role model and makes customer ownership and operational audit records harder to enforce consistently.

### Bootstrap the first ADMIN on the server

The first administrator will be established through a server-authoritative, one-time mechanism documented in environment/setup instructions. The browser may initiate the flow only for the authenticated identity; it cannot submit an arbitrary role. Once an ADMIN exists, the bootstrap path becomes unavailable.

Alternative considered: default the first registered user to ADMIN. Rejected because a public sign-up race could grant privileges unintentionally.

### Keep data fetching close to route ownership

Server pages will use authenticated server-side reads where practical; interactive filters and forms will use focused client components calling the existing `/api/v1` handlers. Shared request/error helpers will normalize response handling without hiding role checks or domain errors.

Alternative considered: introduce a full client data library. Rejected because the current scope does not require cache orchestration and adding a dependency would increase migration and debugging cost.

### Treat API responses as typed contracts

Each restored screen will define or reuse TypeScript types for response data and map backend errors into field-level or page-level feedback. The UI will never fabricate fallback records when a request fails. Empty data is represented separately from failure.

Alternative considered: keep static placeholders during loading. Rejected because placeholders were the source of false operational confidence and conceal backend failures.

### Prefer incremental route-backed workflows

Customer and equipment management will use the existing endpoints first. Service-order intake will compose customer search, customer-scoped equipment lookup, and order creation, then redirect to the persisted detail. New endpoints are added only where a required observable behavior cannot be implemented with the current contracts.

Alternative considered: rebuild all modules behind a new frontend API. Rejected because it would duplicate domain logic and expand the recovery blast radius.

### Validate in layers

The implementation sequence is authentication and provisioning, shared request/feedback primitives, real dashboard/list data, customer/equipment workflows, then order intake/detail actions. Each layer gets focused tests before the next layer depends on it; final validation includes typecheck, lint, unit/integration tests, and authenticated Playwright flows.

## Risks / Trade-offs

- [Webhook delivery can be delayed or unavailable] -> Add an authenticated, idempotent local provisioning fallback and show a bounded recovery state instead of redirect loops; keep role assignment server-controlled.
- [Existing API contracts may not expose every field needed by the UI] -> Reuse current use cases first, document contract gaps, and add the smallest typed endpoint extension with integration coverage.
- [Clerk credentials may be absent in local development] -> Keep unauthenticated route behavior explicit, document required variables, and make tests mock or use the configured Clerk test setup rather than embedding secrets.
- [Replacing mocks can reveal empty database states] -> Implement honest empty states and a deterministic test fixture/setup path; never reintroduce fake production data.
- [Concurrent mutations can leave stale list views] -> Refresh affected queries after success and rely on existing transactional/domain checks for state transitions.
- [The outer OpenSpec root and nested project OpenSpec history differ] -> Keep this change self-contained at the authoritative root and reference current source paths explicitly; do not rewrite archived change history.

## Migration Plan

1. Add the change implementation behind the existing routes and environment conventions; do not run destructive database commands.
2. Configure Clerk webhook signing and the one-time admin bootstrap value in the local/deployment environment, keeping values out of version control.
3. Run Prisma client generation if schema types are required, then run focused tests and the full static/test checks.
4. Verify the first-admin flow, staff CRUD/intake flow, and customer portal access in a configured test environment.
5. Deploy the application and webhook configuration together so provisioning is available before requiring protected screens.
6. Roll back by reverting application changes and disabling the new bootstrap path; preserve existing database records and audit history.

## Open Questions

None that change the specified behavior or implementation sequence. The concrete Clerk environment variable names and test fixture values should follow the existing deployment configuration during implementation.