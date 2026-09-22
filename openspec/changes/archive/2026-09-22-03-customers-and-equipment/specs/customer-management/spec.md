# Customer Management Specification

## Purpose
Provide validated customer registration, update, lookup, and duplicate prevention.

## ADDED Requirements
### Requirement: Customer CRUD and lookup
The system SHALL validate customer name, email, phone, and document and support authorized create, update, and search operations.

#### Scenario: Valid customer
- **WHEN** an authorized attendant submits valid customer data
- **THEN** the system SHALL persist the customer and return 201 with its identifier

#### Scenario: Duplicate identity
- **WHEN** a normalized document or email already exists
- **THEN** the system SHALL reject the request with a conflict response
