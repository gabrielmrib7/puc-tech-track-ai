# Service Order Intake Specification

## Purpose
Create service orders with atomic human-readable numbering and immutable intake history.

## Requirements
### Requirement: Atomic order intake
The system SHALL provide authorized detail read and controlled update operations for service orders and SHALL represent deletion as a validated cancellation/archive command.

#### Scenario: Valid intake
- **WHEN** an authorized attendant submits customer, equipment, defect, and accessories
- **THEN** the system SHALL create the order and its RECEIVED history event atomically

#### Scenario: Invalid relation
- **WHEN** the equipment does not belong to the selected customer
- **THEN** the system SHALL reject the request without creating an order

#### Scenario: Staff edits pre-diagnosis intake
- **WHEN** authorized staff edits customer/equipment association or intake fields while the order is before diagnosis
- **THEN** the system SHALL validate relations, persist the change atomically, and append an immutable history event

#### Scenario: Staff cancels an active order
- **WHEN** an authorized ADMIN or permitted staff user cancels an order in an allowed pre-terminal state
- **THEN** the system SHALL transition it to `CANCELLED`, append history atomically, and expose the cancelled state in list/detail views

#### Scenario: Terminal order is mutated
- **WHEN** any client attempts to edit, delete, reopen, or transition a `DELIVERED` or `CANCELLED` order
- **THEN** the system SHALL reject the request with `409` or `422` and preserve the order and history

#### Scenario: Customer reads an order
- **WHEN** a CUSTOMER requests an order detail or history
- **THEN** the backend SHALL return only an order linked to that customer's local record and reject cross-customer identifiers with `403` or `404`