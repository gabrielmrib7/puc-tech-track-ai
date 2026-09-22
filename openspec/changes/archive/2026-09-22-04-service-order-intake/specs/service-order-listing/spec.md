# Service Order Listing Specification

## Purpose
Provide searchable, filterable, paginated service-order operations for authorized staff.

## ADDED Requirements
### Requirement: Filtered order listing
The system SHALL support status, free-text, date, sorting, and pagination filters on service orders.

#### Scenario: Status filter
- **WHEN** staff requests `status=RECEIVED` with a page limit
- **THEN** the system SHALL return only matching orders and pagination metadata
