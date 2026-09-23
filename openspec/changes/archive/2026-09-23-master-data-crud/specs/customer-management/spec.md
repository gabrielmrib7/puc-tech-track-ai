## MODIFIED Requirements

### Requirement: Customer CRUD and lookup
The system SHALL validate customer name, email, phone, and document and support authorized create, read, update, search, and dependency-safe delete operations.

#### Scenario: Valid customer
- **WHEN** an authorized attendant submits valid customer data
- **THEN** the system SHALL persist the customer and return 201 with its identifier

#### Scenario: Duplicate identity
- **WHEN** a normalized document or email already exists
- **THEN** the system SHALL reject the request with a conflict response

#### Scenario: Staff updates a customer
- **WHEN** an authorized ADMIN or ATTENDANT submits valid changes for an existing customer
- **THEN** the system SHALL persist the normalized values and return the updated record

#### Scenario: Staff deletes an unused customer
- **WHEN** an authorized staff user deletes a customer with no service-order references
- **THEN** the system SHALL remove the customer and return a successful deletion response

#### Scenario: Customer deletion has dependencies
- **WHEN** a customer is referenced by one or more service orders
- **THEN** the system SHALL reject deletion with `409` and preserve the customer, equipment, orders, and history

#### Scenario: Customer cannot manage staff records
- **WHEN** a CUSTOMER attempts any staff customer CRUD operation
- **THEN** the backend SHALL return `403` or `404` and SHALL NOT disclose or mutate staff data
