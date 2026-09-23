## Context

See `proposal.md`. The current API exposes collection-level customer and equipment reads/creates, while Prisma relations make unrestricted deletion unsafe. `User` is referenced by Clerk synchronization and `ServiceOrderHistory`, so physical user deletion would damage identity and auditability.

## Goals / Non-Goals

**Goals:**

- Provide consistent REST collection and detail operations for customers, equipment, and staff-managed local users.
- Keep authorization in route/application layers and enforce relation checks in the database operation boundary.
- Give staff usable desktop CRUD screens with typed feedback and refresh after mutations.

**Non-Goals:**

- Self-service customer editing of staff master data.
- Hard deletion of users or records with dependent service orders/history.
- Changing Clerk as the identity provider or redesigning customer portal ownership.

## Decisions

- **Use collection plus `[id]` handlers.** Keep `GET/POST` on collections and add `GET/PATCH/DELETE` on resource details so route ownership matches existing Next.js conventions. Alternatives such as one generic CRUD handler were rejected because they obscure resource-specific authorization and validation.
- **Use safe deletion, not cascading deletion.** Customer or equipment deletion is allowed only when no service order references the record; otherwise return `409`. This prevents accidental loss of operational history. Alternatives using Prisma cascade were rejected.
- **Deactivate users instead of deleting them.** `PATCH` may change role/name/active state under ADMIN authorization; `DELETE` maps to `active = false`, preserving Clerk linkage and history foreign keys. Re-enabling is an explicit ADMIN update.
- **Keep role authority server-side.** The UI may display roles but cannot assign ADMIN through an unauthorised payload. Only ADMIN may manage roles; ATTENDANT may manage customer/equipment records according to existing permissions.
- **Reuse existing Zod/domain schemas and typed request feedback.** Add only missing schemas and shared response types; avoid a new data library.

## Risks / Trade-offs

- [Existing duplicate records may prevent updates] -> Normalize identity and serial values before conflict queries and return field-level `409` details.
- [A record may gain a service order during deletion] -> Recheck dependencies in the same transaction as the delete.
- [Deactivated users may still have active Clerk sessions] -> Protected requests must re-read local `active` status and reject inactive users.

## Migration Plan

1. Add detail routes and application use cases without changing existing collection contracts.
2. Add focused API tests, then staff screens and Playwright flows.
3. Roll back by disabling the new UI/routes; do not delete existing rows or run destructive migrations.
