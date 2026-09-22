---
description: Implement TechTrack authentication, Clerk session handling, and backend-enforced RBAC for ADMIN, ATTENDANT, TECHNICIAN, and CUSTOMER.
---

Implement change 02-auth-and-rbac in the TechTrack repository.

Follow AGENTS.md and the change proposal. Preserve backend authority, Clerk claim validation, route protection, customer isolation, and the four-layer architecture. Keep authentication secrets out of source and logs. Add focused unit, integration, and E2E coverage. Validate with `npx tsc --noEmit`, `npm run lint`, and relevant tests before completion.
