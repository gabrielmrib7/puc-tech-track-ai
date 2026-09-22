# Customer Tracking Portal Specification

## Purpose
Provide authenticated customers a mobile-first view of only their own service orders.

## ADDED Requirements
### Requirement: Customer-owned order access
The system SHALL include the authenticated customer's user_id in every customer-order query and detail lookup.

#### Scenario: Own order
- **WHEN** a CUSTOMER requests one of their orders
- **THEN** the system SHALL return the order summary and permitted details

#### Scenario: Cross-customer order
- **WHEN** a CUSTOMER requests another customer's order
- **THEN** the system SHALL return 403 or 404 without leaking data
