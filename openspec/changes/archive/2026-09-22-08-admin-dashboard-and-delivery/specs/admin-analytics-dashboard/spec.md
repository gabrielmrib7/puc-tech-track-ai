# Admin Analytics Dashboard Specification

## Purpose
Provide authorized staff with operational KPIs and actionable order summaries.

## ADDED Requirements
### Requirement: Operational metrics
The system SHALL return counts by status, new orders, pending budgets, ready-for-pickup orders, and repair timing metrics for authorized staff.

#### Scenario: Dashboard request
- **WHEN** ADMIN or ATTENDANT requests dashboard metrics
- **THEN** the system SHALL return typed aggregate data from the database

#### Scenario: Unauthorized metrics
- **WHEN** CUSTOMER requests admin metrics
- **THEN** the system SHALL return 403
