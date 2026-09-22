# Design

Implement an order-number generator backed by a PostgreSQL sequence or equivalent transaction-safe allocation. Create the intake use case with customer/equipment ownership checks and a transaction that writes ServiceOrder and ServiceOrderHistory. Expose REST handlers for create/list and use server-side filtering with existing indexes. Add admin pages after the API contract is tested.
