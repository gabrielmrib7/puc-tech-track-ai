# Service Order Intake Specification

## Purpose
Create service orders with atomic human-readable numbering and immutable intake history.

## ADDED Requirements
### Requirement: Atomic order intake
The system SHALL create an order for a valid customer and equipment with a unique `OS-YYYY-XXXXXX` number and initial RECEIVED status.

#### Scenario: Valid intake
- **WHEN** an authorized attendant submits customer, equipment, defect, and accessories
- **THEN** the system SHALL create the order and its RECEIVED history event atomically

#### Scenario: Invalid relation
- **WHEN** the equipment does not belong to the selected customer
- **THEN** the system SHALL reject the request without creating an order
