## Purpose

Define o modelo relacional persistido no PostgreSQL/Supabase via Prisma ORM com integridade referencial estrita, enums de status e auditoria imutável.

## ADDED Requirements

### Requirement: Relational Data Model Definition
The database schema SHALL define Prisma models for `User`, `Customer`, `Equipment`, `ServiceOrder`, `Budget`, and `ServiceOrderHistory` with explicit primary keys, foreign key constraints, and performance indexes.

#### Scenario: Referential integrity enforcement
- **WHEN** an operation attempts to create an equipment or order referencing a non-existent customer ID
- **THEN** the database rejects the insertion and throws a foreign key constraint violation error

### Requirement: Enumerated Domain Types and Role Safety
The database schema SHALL define native enums for `UserRole` (`ADMIN`, `ATTENDANT`, `TECHNICIAN`, `CUSTOMER`), `OrderStatus` (`RECEIVED`, `WAITING_DIAGNOSIS`, `IN_DIAGNOSIS`, `WAITING_APPROVAL`, `APPROVED`, `REJECTED`, `IN_REPAIR`, `COMPLETED`, `READY_FOR_PICKUP`, `DELIVERED`, `CANCELLED`), and `BudgetStatus` (`PENDING`, `APPROVED`, `REJECTED`, `EXPIRED`).

#### Scenario: Rejection of invalid status or role assignments
- **WHEN** an application layer queries or attempts to persist an unmapped status string
- **THEN** Prisma Client validation prevents query execution and raises a type safety error

### Requirement: Immutable Service Order Audit History Model
The schema SHALL include a `ServiceOrderHistory` table linked to `ServiceOrder` and `User` that records `old_status`, `new_status`, `action`, `user_id`, and UTC timestamp `created_at`.

#### Scenario: Audit trail record structure
- **WHEN** an event is logged in `ServiceOrderHistory`
- **THEN** the record contains non-nullable references to the order ID, transition timestamps, and the user responsible for the action

