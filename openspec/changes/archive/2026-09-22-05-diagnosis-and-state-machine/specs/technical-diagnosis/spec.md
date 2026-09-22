# Technical Diagnosis Specification

## Purpose
Allow authorized technicians to record technical diagnosis and repair estimates.

## ADDED Requirements
### Requirement: Technician diagnosis
The system SHALL allow TECHNICIAN or ADMIN users to start diagnosis and record the technical report, cause, and estimate.

#### Scenario: Unauthorized diagnosis
- **WHEN** a non-technician/non-admin attempts to start diagnosis
- **THEN** the system SHALL reject the request with 403

#### Scenario: Diagnosis report
- **WHEN** an authorized technician submits a valid report
- **THEN** the system SHALL persist the report and corresponding lifecycle history
