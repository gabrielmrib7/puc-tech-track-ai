# Humanized Status Timeline Specification

## Purpose
Render auditable service-order history with clear Portuguese customer-facing labels.

## ADDED Requirements
### Requirement: Humanized timeline
The system SHALL map technical statuses to localized labels, dates, icons, completed stages, and current stage.

#### Scenario: Repair status
- **WHEN** an order has status IN_REPAIR
- **THEN** the portal SHALL show a clear repair-in-progress label and the ordered history

#### Scenario: Ready for pickup
- **WHEN** an order reaches READY_FOR_PICKUP
- **THEN** the portal SHALL prominently show that it is ready for collection
