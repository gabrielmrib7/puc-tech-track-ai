## MODIFIED Requirements

### Requirement: Customer equipment
The system SHALL create, read, update, search by customer, and dependency-safely delete equipment linked to an existing customer, while normalizing serial numbers.

#### Scenario: Equipment creation
- **WHEN** an authorized attendant submits valid equipment for an existing customer
- **THEN** the system SHALL persist the relation and return the equipment identifier

#### Scenario: Duplicate serial
- **WHEN** a normalized serial number conflicts with an existing equipment record
- **THEN** the system SHALL reject the request with a conflict response

#### Scenario: Staff updates equipment
- **WHEN** an authorized ADMIN or ATTENDANT submits valid changes for equipment
- **THEN** the system SHALL persist the update only if the target customer exists and the serial number is not owned by another equipment record

#### Scenario: Staff deletes unused equipment
- **WHEN** authorized staff deletes equipment with no service-order references
- **THEN** the system SHALL remove the equipment and return a successful deletion response

#### Scenario: Equipment deletion has dependencies
- **WHEN** equipment is referenced by a service order
- **THEN** the system SHALL reject deletion with `409` and preserve the equipment and order history

#### Scenario: Equipment remains customer-scoped
- **WHEN** a staff user requests equipment by customer or detail identifier
- **THEN** the backend SHALL return only records authorized for the operation and SHALL reject invalid customer relationships
