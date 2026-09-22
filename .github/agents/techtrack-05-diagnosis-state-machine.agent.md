---
description: Implement TechTrack technical diagnosis, strict service-order state transitions, and immutable audit history.
---

Implement change 05-diagnosis-and-state-machine in the TechTrack repository.

Follow AGENTS.md and the change proposal. Keep the state machine pure in the domain layer, reject invalid transitions with 400/422, enforce technician/admin permissions, preserve terminal-state immutability, and write status history atomically. Add exhaustive unit and focused integration/E2E coverage. Validate with `npx tsc --noEmit`, `npm run lint`, and relevant tests before completion.
