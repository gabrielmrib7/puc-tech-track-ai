# Order Delivery and Closure Specification

## Purpose
Close a service order only after confirmed pickup and preserve its terminal immutability.

## ADDED Requirements
### Requirement: Delivery closure
The system SHALL allow ADMIN or ATTENDANT to transition only READY_FOR_PICKUP orders to DELIVERED while recording pickup identity and immutable history.

#### Scenario: Confirmed delivery
- **WHEN** authorized staff confirms a READY_FOR_PICKUP order with pickup details
- **THEN** the system SHALL set DELIVERED, delivered_at, and create an audit event atomically

#### Scenario: Invalid delivery
- **WHEN** delivery is attempted from another status
- **THEN** the system SHALL reject the request with 400/422

#### Scenario: Delivered immutability
- **WHEN** any later mutation targets a DELIVERED order
- **THEN** the backend SHALL reject it
