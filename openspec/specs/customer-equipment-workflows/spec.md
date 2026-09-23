# customer-equipment-workflows Specification

## Purpose
Give authorized staff complete operational screens for registering customers and equipment, finding existing records, handling duplicates, and selecting valid equipment during service-order intake.

## Requirements

### Requirement: Customer registration and lookup UI
The system SHALL provide an authorized staff workflow to create, search, and select customers using the validated customer API.

#### Scenario: Staff creates a customer
- **WHEN** an authorized user submits valid name, contact, and identity data
- **THEN** the system SHALL persist the customer, show the generated identifier, and make the customer selectable in related workflows

#### Scenario: Staff searches customers
- **WHEN** a staff user enters a name, email, phone, or document query
- **THEN** the system SHALL return matching persisted customers with pagination or bounded results

#### Scenario: Duplicate customer is submitted
- **WHEN** normalized email or document conflicts with an existing customer
- **THEN** the system SHALL show a conflict message and SHALL NOT create a second customer

### Requirement: Equipment registration and customer scoping
The system SHALL provide a workflow to create equipment only for an existing customer and list equipment scoped to that customer.

#### Scenario: Staff creates equipment
- **WHEN** an authorized user submits valid equipment data for an existing customer
- **THEN** the system SHALL persist the relation and show the equipment as available for that customer

#### Scenario: Equipment references an invalid customer
- **WHEN** a staff user submits equipment with a non-existent customer identifier
- **THEN** the system SHALL show a meaningful relation error and SHALL NOT create the equipment

#### Scenario: Duplicate serial number is submitted
- **WHEN** a normalized serial number already belongs to another equipment record
- **THEN** the system SHALL show a conflict and SHALL NOT create a duplicate serial record

### Requirement: Customer and equipment data isolation
The system SHALL enforce backend authorization and customer ownership for every customer and equipment operation exposed by the interface.

#### Scenario: Customer requests staff data
- **WHEN** a CUSTOMER attempts to use staff-only customer or equipment management operations
- **THEN** the backend SHALL reject the request and the interface SHALL show an authorization state

#### Scenario: Staff selects a customer
- **WHEN** a staff user selects a customer for a new order
- **THEN** the interface SHALL load only equipment linked to that selected customer
