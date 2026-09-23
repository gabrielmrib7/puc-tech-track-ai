# functional-auth-bootstrap Specification

## Purpose
Provide a complete and recoverable identity flow so a new user can authenticate, become known to the application, and reach the correct area without manual database intervention or accidental privilege escalation.

## Requirements

### Requirement: Functional sign-up and sign-in
The system SHALL expose a user-facing authentication flow that supports account creation, sign-in, sign-out, validation errors, loading states, and recovery from failed requests.

#### Scenario: New user creates an account
- **WHEN** a visitor submits valid sign-up credentials through the configured identity provider
- **THEN** the system SHALL complete account creation, establish a session when the provider permits it, and continue to local user provisioning

#### Scenario: Invalid authentication input
- **WHEN** a visitor submits invalid or incomplete credentials
- **THEN** the system SHALL keep the authentication view usable, display an actionable error, and SHALL NOT create a local application user

### Requirement: Idempotent local provisioning
The system SHALL ensure that every authenticated provider user is represented by exactly one local User record before protected application pages are served.

#### Scenario: Provider webhook creates a user
- **WHEN** a valid user-created event is received with a provider identifier and verified email
- **THEN** the system SHALL create the local user with the default non-privileged role and return a successful acknowledgement

#### Scenario: Provisioning event is retried
- **WHEN** the same valid user-created or user-updated event is received more than once
- **THEN** the system SHALL update or reuse the existing local record without creating a duplicate

#### Scenario: Authenticated user is not provisioned
- **WHEN** a valid session reaches post-login and no local User exists
- **THEN** the system SHALL show a recoverable provisioning state or execute the authorized synchronization path, rather than redirecting indefinitely to login

### Requirement: Safe first administrator bootstrap
The system SHALL provide a documented, server-authoritative bootstrap mechanism for designating the first ADMIN without accepting a role from an untrusted browser payload.

#### Scenario: Bootstrap is enabled for an approved identity
- **WHEN** the configured bootstrap mechanism is invoked by the approved identity and no ADMIN exists
- **THEN** the system SHALL assign ADMIN exactly once and record the resulting local user

#### Scenario: Bootstrap is attempted after initialization
- **WHEN** a bootstrap request is made after an ADMIN already exists
- **THEN** the system SHALL reject the request without changing any role

#### Scenario: Customer attempts privilege escalation
- **WHEN** a non-admin client submits a role value requesting ADMIN or another staff role
- **THEN** the system SHALL ignore or reject the requested role and preserve backend role authority

### Requirement: Role-aware post-login routing
The system SHALL route provisioned users to an area authorized for their local role and provide an explicit response for unsupported or missing role state.

#### Scenario: Staff user signs in
- **WHEN** an ADMIN, ATTENDANT, or TECHNICIAN completes authentication and provisioning
- **THEN** the system SHALL route the user to the staff application area

#### Scenario: Customer signs in
- **WHEN** a CUSTOMER completes authentication and provisioning
- **THEN** the system SHALL route the user to the customer portal
