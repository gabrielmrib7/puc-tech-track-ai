# Budget Management Specification

## Purpose
Create detailed budgets with validated items, totals, dates, and customer presentation.

## Requirements

### Requirement: Budget creation
The system SHALL allow authorized TECHNICIAN or ADMIN users to create, read, update, and delete only pending budgets, while calculating totals server-side and preserving decided budgets.

#### Scenario: Total calculation
- **WHEN** budget items and labor are submitted
- **THEN** the system SHALL calculate and persist the exact total using decimal-safe values

#### Scenario: Invalid budget
- **WHEN** the total or expiration is invalid
- **THEN** the system SHALL reject the request with a validation error

#### Scenario: Staff updates a pending budget
- **WHEN** an authorized TECHNICIAN or ADMIN updates a `PENDING` budget with valid parts, labor, description, or notes
- **THEN** the system SHALL recalculate the decimal-safe total, persist the update, and return the updated budget

#### Scenario: Staff deletes a pending budget
- **WHEN** an authorized staff user deletes a `PENDING` budget before decision
- **THEN** the system SHALL remove that draft and leave the service order otherwise unchanged

#### Scenario: Decided budget is edited or deleted
- **WHEN** any client attempts to update or delete an `APPROVED`, `REJECTED`, or `EXPIRED` budget
- **THEN** the system SHALL return `409` or `422` and preserve the budget and associated order state

#### Scenario: Customer accesses a budget
- **WHEN** a CUSTOMER requests a budget through an order they do not own
- **THEN** the backend SHALL return `403` or `404` without disclosing budget data
