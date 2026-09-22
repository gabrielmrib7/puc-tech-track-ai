# Finite State Machine Specification

## Purpose
Enforce the service-order lifecycle as a pure, auditable state machine.

## ADDED Requirements
### Requirement: Valid order transitions
The system SHALL allow only the documented order transitions and SHALL reject invalid transitions with 400 or 422.

#### Scenario: Valid diagnosis start
- **WHEN** a RECEIVED order advances through the diagnosis path
- **THEN** the system SHALL permit only the next allowed state

#### Scenario: Terminal state
- **WHEN** an order is DELIVERED or CANCELLED
- **THEN** every further status mutation SHALL be rejected

### Requirement: Atomic history
The system SHALL persist every accepted transition and its operator in ServiceOrderHistory in the same transaction as the order update.

#### Scenario: History rollback
- **WHEN** persisting the history event fails during a transition
- **THEN** the order status update SHALL be rolled back
