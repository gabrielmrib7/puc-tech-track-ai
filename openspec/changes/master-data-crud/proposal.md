## Why

The current recovery plan restores customer and equipment creation and lookup, but it does not provide the complete administrative lifecycle needed to correct records, retire unused records, or manage local users. The database already contains `customers`, `equipment`, and `users`, so these operations should be planned as one bounded master-data change with backend-enforced authorization.

## What Changes

- Add authorized list, detail, create, update, and safe removal/deactivation workflows for customers, equipment, and users.
- Add route-level validation, conflict handling, pagination, and typed error contracts for each resource.
- Add desktop staff screens for registration, editing, viewing, and deletion/deactivation with loading, empty, success, and authorization states.
- Prevent deletion that would orphan service orders or audit references; return a conflict instead of cascading silently.
- Treat user deletion as deactivation (`active = false`) so Clerk identity links and audit ownership remain intact.
- Preserve CUSTOMER ownership isolation and prevent browser-controlled role escalation.

## Capabilities

### New Capabilities

None. This change extends the existing customer, equipment, and authentication capabilities.

### Modified Capabilities

- `customer-management`: Extend existing customer registration and lookup with detail, update, and dependency-safe removal.
- `equipment-management`: Extend existing equipment registration and listing with detail, update, and dependency-safe removal.
- `user-authentication`: Extend local user synchronization rules with authorized staff user administration and deactivation.

## Impact

- API route handlers under `src/app/api/v1/customers`, `src/app/api/v1/equipment`, and a new authorized users route.
- Customer, equipment, and auth application/domain modules and Prisma repositories.
- Administrative pages and shared form/table feedback components.
- Vitest integration coverage for RBAC, conflicts, ownership, and dependency checks; Playwright coverage for staff CRUD journeys.
- No destructive migration is expected. Existing relations and audit ownership remain intact.
