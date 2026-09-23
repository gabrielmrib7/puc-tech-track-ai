# ACID Approval Transaction Specification

## Purpose
Make budget approval and rejection atomic, authorized, idempotent, and auditable.

## Requirements

### Requirement: Atomic budget decision
The system SHALL update a pending Budget, its ServiceOrder, and one immutable ServiceOrderHistory event within one Prisma transaction, and SHALL make the resulting budget decision immutable.

#### Scenario: Approval
- **WHEN** the owner CUSTOMER approves a pending budget for a WAITING_APPROVAL order
- **THEN** budget becomes APPROVED, order becomes IN_REPAIR, and one history event is committed

#### Scenario: Rollback
- **WHEN** any history or related write fails
- **THEN** all decision changes SHALL roll back

#### Scenario: Duplicate decision
- **WHEN** a decided budget is submitted again
- **THEN** the system SHALL return 409 and preserve the original decision

#### Scenario: Approval or rejection races with an edit
- **WHEN** a customer decision and staff update/delete target the same pending budget concurrently
- **THEN** exactly one valid operation SHALL commit and the losing operation SHALL receive a conflict without partial changes

#### Scenario: Decided budget is submitted again
- **WHEN** a client repeats an approve or reject request after a decision is committed
- **THEN** the system SHALL return `409`, preserve the original decision, and create no extra history event

#### Scenario: Decision rollback
- **WHEN** updating the order or creating history fails during approval/rejection
- **THEN** the budget decision, order transition, and history write SHALL all roll back
