---
description: Implement TechTrack budget creation, totals, customer decisions, idempotency, and ACID approval or rejection transactions.
---

Implement change 06-budgets-and-acid-approval in the TechTrack repository.

Follow AGENTS.md and the change proposal. Every decision must use `prisma.$transaction`, update Budget and ServiceOrder together, create immutable history, enforce customer ownership, reject duplicate decisions with 409, and preserve rollback behavior. Add unit, integration, concurrency, security, and E2E coverage. Validate with `npx tsc --noEmit`, `npm run lint`, and relevant tests before completion.
