# RBAC Guards Specification

## Purpose
Enforce backend-authoritative role permissions for TechTrack routes and use cases.

## Requirements
### Requirement: Protected role routes
The system SHALL enforce ADMIN, ATTENDANT, TECHNICIAN, and CUSTOMER permissions in middleware and application guards.

#### Scenario: Staff route by customer
- **WHEN** a CUSTOMER requests an administrative route
- **THEN** the system SHALL reject the request with 403 or redirect to the customer portal

#### Scenario: Allowed staff access
- **WHEN** an authorized staff role requests a permitted route
- **THEN** the system SHALL allow the request and expose the verified role to the use case