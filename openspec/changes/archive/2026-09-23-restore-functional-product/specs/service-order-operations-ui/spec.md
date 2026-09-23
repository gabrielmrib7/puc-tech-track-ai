## Purpose

Restore the end-to-end staff workflow for creating and operating service orders, from selecting a customer and equipment through listing, detail, diagnosis, budget, status transitions, delivery, and visible history.

## ADDED Requirements

### Requirement: Service-order intake workflow
The system SHALL allow authorized staff to create a service order from persisted customer and equipment selections with validated intake data.

#### Scenario: Valid order intake
- **WHEN** an authorized staff user submits a valid customer, equipment, reported problem, and intake payload
- **THEN** the system SHALL create the order with a unique order number, initial status, and initial history entry

#### Scenario: Invalid intake submission
- **WHEN** required intake data is missing, malformed, or references unrelated records
- **THEN** the system SHALL reject the request, identify the validation problem, and SHALL NOT create a partial order

### Requirement: Real service-order listing and detail
The staff interface SHALL display persisted service orders with searchable filters, pagination, status labels, detail navigation, and current timeline data.

#### Scenario: Staff opens order list
- **WHEN** an authorized staff user opens the order list
- **THEN** the interface SHALL load current records from the service-order API and show an explicit empty state when none exist

#### Scenario: Staff opens order detail
- **WHEN** a staff user selects a listed order
- **THEN** the interface SHALL show the persisted customer, equipment, status, diagnosis, budget, delivery data, and immutable timeline available to that role

### Requirement: State-machine actions are reflected in UI
The interface SHALL expose only role-appropriate actions and SHALL update the order view after successful diagnosis, budget, status, or delivery operations.

#### Scenario: Valid status transition
- **WHEN** an authorized user performs a transition allowed by the domain state machine
- **THEN** the backend SHALL persist the transition and history atomically and the interface SHALL show the new status and timeline event

#### Scenario: Invalid status transition
- **WHEN** a user attempts a transition disallowed by the state machine
- **THEN** the backend SHALL reject it and the interface SHALL preserve the prior state while showing the domain error

#### Scenario: Delivered order is reopened
- **WHEN** any client attempts to mutate an order already marked DELIVERED
- **THEN** the backend SHALL reject the mutation and the interface SHALL show that the order is terminal

### Requirement: Operational refresh after mutation
The system SHALL keep list and detail views consistent after a successful mutation without requiring the user to infer that a stale page must be reloaded manually.

#### Scenario: Order creation completes
- **WHEN** a new order is created successfully
- **THEN** the interface SHALL navigate to or expose the new order and update the list query state

#### Scenario: Detail mutation completes
- **WHEN** diagnosis, budget, status, or delivery succeeds
- **THEN** the interface SHALL refresh the affected order and its history before enabling a subsequent action