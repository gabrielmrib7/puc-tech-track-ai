# User Authentication Specification

## Purpose
Provide secure Clerk-backed authentication and synchronize authenticated users with the local User model.

## ADDED Requirements
### Requirement: Clerk session authentication
The system SHALL validate authenticated Clerk sessions on protected requests and expose only the authenticated user identity to application services.

#### Scenario: Missing session
- **WHEN** an unauthenticated request reaches a protected route
- **THEN** the system SHALL return 401 or redirect browser navigation to login

#### Scenario: User synchronization
- **WHEN** a valid Clerk user is received through the synchronization endpoint
- **THEN** the system SHALL idempotently create or update the matching local User by clerk_id

### Requirement: Role-aware redirect
The system SHALL redirect authenticated users to an administrative area for staff roles and to the customer portal for CUSTOMER.

#### Scenario: Customer login
- **WHEN** a CUSTOMER completes login
- **THEN** the system SHALL redirect to the customer portal
