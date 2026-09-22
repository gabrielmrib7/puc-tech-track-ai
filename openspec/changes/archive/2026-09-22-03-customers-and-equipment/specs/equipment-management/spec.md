# Equipment Management Specification

## Purpose
Register equipment under a customer and expose validated customer-scoped listings.

## ADDED Requirements
### Requirement: Customer equipment
The system SHALL create equipment linked to an existing customer, normalize serial numbers, and list that customer's equipment.

#### Scenario: Equipment creation
- **WHEN** an authorized attendant submits valid equipment for an existing customer
- **THEN** the system SHALL persist the relation and return the equipment identifier

#### Scenario: Duplicate serial
- **WHEN** a normalized serial number conflicts with an existing equipment record
- **THEN** the system SHALL reject the request with a conflict response
