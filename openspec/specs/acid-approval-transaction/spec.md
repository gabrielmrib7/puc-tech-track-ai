# ACID Approval Transaction Specification

## Purpose
Make budget approval and rejection atomic, authorized, idempotent, and auditable.

## Requirements
### Requirement: Atomic budget decision
The system SHALL update Budget, ServiceOrder, and ServiceOrderHistory within one Prisma transaction.

#### Scenario: Approval
- **WHEN** the owner CUSTOMER approves a pending budget for a WAITING_APPROVAL order
- **THEN** budget becomes APPROVED, order becomes IN_REPAIR, and one history event is committed

#### Scenario: Rollback
- **WHEN** any history or related write fails
- **THEN** all decision changes SHALL roll back

#### Scenario: Duplicate decision
- **WHEN** a decided budget is submitted again
- **THEN** the system SHALL return 409 and preserve the original decision