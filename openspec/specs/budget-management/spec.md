# Budget Management Specification

## Purpose
Create detailed budgets with validated items, totals, dates, and customer presentation.

## Requirements
### Requirement: Budget creation
The system SHALL allow TECHNICIAN or ADMIN users to create a pending budget with parts, labor, total, notes, and validity.

#### Scenario: Total calculation
- **WHEN** budget items and labor are submitted
- **THEN** the system SHALL calculate and persist the exact total using decimal-safe values

#### Scenario: Invalid budget
- **WHEN** the total or expiration is invalid
- **THEN** the system SHALL reject the request with a validation error