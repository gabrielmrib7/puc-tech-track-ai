## MODIFIED Requirements

### Requirement: Clerk session authentication
The system SHALL validate authenticated Clerk sessions on protected requests, expose only the authenticated user identity to application services, and reject inactive local users.

#### Scenario: Missing session
- **WHEN** an unauthenticated request reaches a protected route
- **THEN** the system SHALL return 401 or redirect browser navigation to login

#### Scenario: User synchronization
- **WHEN** a valid Clerk user is received through the synchronization endpoint
- **THEN** the system SHALL idempotently create or update the matching local User by clerk_id

#### Scenario: Inactive local user
- **WHEN** a valid Clerk session maps to a local user with `active = false`
- **THEN** the backend SHALL reject protected application operations without deleting the identity link

## ADDED Requirements

### Requirement: Local user administration
The system SHALL allow only ADMIN users to list, read, update, role-manage, activate, and deactivate local users, while preserving Clerk identity and audit ownership.

#### Scenario: Admin updates a local user
- **WHEN** an ADMIN submits valid name, email, role, or active-state changes
- **THEN** the system SHALL persist the change and return the updated user without exposing password hashes or provider secrets

#### Scenario: Non-admin manages users
- **WHEN** an ATTENDANT, TECHNICIAN, CUSTOMER, or unauthenticated client attempts user administration
- **THEN** the backend SHALL reject the request with `403` or `401` and SHALL NOT mutate a user

#### Scenario: Admin deactivates a user
- **WHEN** an ADMIN deletes or deactivates a local user
- **THEN** the system SHALL set `active = false`, preserve the row and Clerk identifier, and reject later protected operations for that inactive user

#### Scenario: User role escalation is attempted
- **WHEN** a non-admin submits a role change requesting ADMIN
- **THEN** the backend SHALL reject the request and preserve the current role
