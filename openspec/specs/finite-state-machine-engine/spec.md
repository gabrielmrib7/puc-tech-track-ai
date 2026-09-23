# Finite State Machine Specification

## Purpose
Enforce the service-order lifecycle as a pure, auditable state machine.

## Requirements
### Requirement: Valid order transitions
The system SHALL reject arbitrary CRUD status writes, allow only documented transitions or pre-diagnosis field edits, and persist an immutable history event for every accepted order mutation.

#### Scenario: Valid diagnosis start
- **WHEN** a RECEIVED order advances through the diagnosis path
- **THEN** the system SHALL permit only the next allowed state

#### Scenario: Terminal state
- **WHEN** an order is DELIVERED or CANCELLED
- **THEN** every further status mutation SHALL be rejected

#### Scenario: Edit crosses a state boundary
- **WHEN** a PATCH request attempts to change status or edit protected diagnosis/budget/delivery fields
- **THEN** the system SHALL reject the request and require the dedicated domain operation

#### Scenario: Cancellation history is atomic
- **WHEN** an allowed cancellation updates an order to `CANCELLED`
- **THEN** the order update and history event SHALL commit in one transaction, or both SHALL roll back

#### Scenario: History deletion is attempted
- **WHEN** any client attempts to update or delete a `ServiceOrderHistory` record
- **THEN** the backend SHALL reject the operation and preserve the audit record

### Requirement: Atomic history
The system SHALL persist every accepted transition and its operator in ServiceOrderHistory in the same transaction as the order update.

#### Scenario: History rollback
- **WHEN** persisting the history event fails during a transition
- **THEN** the order status update SHALL be rolled back