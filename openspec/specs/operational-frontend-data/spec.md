# operational-frontend-data Specification

## Purpose
Replace disconnected and static administrative screens with a usable interface backed by persisted data, consistent navigation, and explicit feedback for loading, empty, successful, and failed operations.

## Requirements

### Requirement: Real dashboard data
The administrative dashboard SHALL display metrics and actionable order summaries returned by authorized backend queries rather than hard-coded values.

#### Scenario: Dashboard loads with data
- **WHEN** an authorized staff user opens the dashboard
- **THEN** the interface SHALL request current metrics and render values derived from the database

#### Scenario: Dashboard request fails
- **WHEN** the metrics request fails or returns an authorization error
- **THEN** the interface SHALL display a recoverable error state and SHALL NOT present stale mock metrics as current data

#### Scenario: Dashboard has no pending actions
- **WHEN** the database contains no attention items
- **THEN** the interface SHALL display an explicit empty state instead of fabricated alerts

### Requirement: Functional order search and navigation
The staff interface SHALL provide working navigation to orders, customers, equipment, dashboard, and supported settings or help destinations.

#### Scenario: User filters orders
- **WHEN** a staff user submits status, text, date, sorting, or pagination criteria
- **THEN** the interface SHALL request the corresponding backend query and render only the returned page with pagination metadata

#### Scenario: User follows a navigation item
- **WHEN** a user selects a visible navigation item
- **THEN** the application SHALL navigate to a real supported route or clearly mark the capability unavailable without using a dead `#` link

### Requirement: Consistent asynchronous feedback
All data-backed screens SHALL expose loading, empty, validation, authorization, network, and success states appropriate to the operation.

#### Scenario: Data is loading
- **WHEN** a screen is waiting for a backend response
- **THEN** the interface SHALL show a stable loading state and SHALL prevent duplicate submissions for the active mutation

#### Scenario: Mutation succeeds
- **WHEN** a create or update request succeeds
- **THEN** the interface SHALL show confirmation and refresh or update the affected data without requiring a full manual reload

#### Scenario: Validation or conflict occurs
- **WHEN** the backend returns invalid input or a duplicate conflict
- **THEN** the interface SHALL associate the message with the relevant form or field and preserve safe user-entered values
