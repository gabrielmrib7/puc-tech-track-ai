# Design

Keep transition rules in a framework-independent domain module with an explicit adjacency map and terminal-state checks. Application services authorize operators, load the order, validate the transition, and use Prisma transactions for status plus history. Diagnosis data should be validated at the boundary and exposed through detail/status endpoints. Cover the transition matrix with table-driven tests.
