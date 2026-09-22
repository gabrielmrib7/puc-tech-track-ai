# Design

Implement Clerk integration at the presentation boundary, a small auth module for claims and role guards, and a Next.js middleware for route protection. Keep Prisma synchronization idempotent and isolate authorization from UI decisions. Use existing env validation and Lucide/Tailwind conventions for the login screen. Add tests around claims, role checks, webhook synchronization, and protected route behavior.
