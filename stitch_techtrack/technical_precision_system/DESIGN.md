---
name: Technical Precision System
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#434655'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#515f74'
  on-secondary: '#ffffff'
  secondary-container: '#d5e3fc'
  on-secondary-container: '#57657a'
  tertiary: '#005a89'
  on-tertiary: '#ffffff'
  tertiary-container: '#0073ae'
  on-tertiary-container: '#e7f2ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d5e3fc'
  secondary-fixed-dim: '#b9c7df'
  on-secondary-fixed: '#0d1c2e'
  on-secondary-fixed-variant: '#3a485b'
  tertiary-fixed: '#cce5ff'
  tertiary-fixed-dim: '#93ccff'
  on-tertiary-fixed: '#001d31'
  on-tertiary-fixed-variant: '#004b73'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.25'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1440px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  stack-xs: 4px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
  stack-xl: 48px
---

## Brand & Style

This design system is built for high-utility technical environments where reliability and clarity are paramount. The aesthetic follows a **Corporate / Modern** philosophy, emphasizing a "Data-First" approach. The interface relies on structural integrity, generous whitespace, and a disciplined functional hierarchy to reduce cognitive load during complex task management.

The visual language is defined by:
- **Clarity over Decoration:** Every element serves a functional purpose; decorative flourishes are replaced by intentional spacing.
- **Systematic Order:** High alignment to a rigid grid to convey stability.
- **Trust-Driven Palette:** A foundation of cool grays and deep blues to evoke professional competence.

## Colors

The palette is optimized for long-session legibility and immediate status recognition. 

- **Primary & Action:** Use `#2563EB` for primary actions and `#1D4ED8` for hover/active states.
- **Surface Strategy:** Backgrounds utilize a subtle off-white (`#F8FAFC`) to allow pure white (`#FFFFFF`) cards and modals to "pop" with distinct elevation.
- **Typography:** The primary text color (`#0F172A`) provides high contrast against white surfaces, while the secondary text (`#475569`) is reserved for metadata and supporting labels.
- **Functional Colors:** Status indicators for success, warning, error, and info are used exclusively for system feedback and badges to ensure they maintain their semantic weight.

## Typography

The typography system uses **Inter** exclusively to leverage its exceptional legibility in UI environments. 

- **Weight Usage:** Use `Bold (700)` for page headers, `SemiBold (600)` for section headers and primary buttons, and `Medium (500)` for labels and secondary navigation. 
- **Scale Strategy:** Headlines use slightly tighter letter-spacing to maintain a modern, "compact" feel. 
- **Accessibility:** Minimum body text size for mobile is 14px, though 16px is preferred for descriptive content. Labels below 12px should be avoided.

## Layout & Spacing

This design system employs a **4px base grid** and a **12-column fluid grid** for desktop environments.

- **Grid:** Use a 12-column grid for desktop (1024px+) with 24px gutters. For tablets (768px-1023px), switch to an 8-column grid. Mobile views (<768px) use a 4-column grid with 16px side margins.
- **Sidebar:** The admin navigation sidebar is fixed at 280px on desktop and collapses to a 64px icon-only rail or hidden drawer on mobile.
- **Vertical Rhythm:** Spacing between related elements (labels and inputs) should use `stack-sm` (8px). Spacing between sections should use `stack-xl` (48px).

## Elevation & Depth

Visual hierarchy is established through a combination of **Tonal Layers** and **Ambient Shadows**.

- **Level 0 (Background):** `#F8FAFC`. No shadow.
- **Level 1 (Cards/Surface):** White background with a subtle, diffused shadow.
  - *Shadow Token:* `0px 1px 3px rgba(15, 23, 42, 0.08), 0px 4px 6px rgba(15, 23, 42, 0.05)`
- **Level 2 (Dropdowns/Popovers):** White background with a medium shadow.
  - *Shadow Token:* `0px 10px 15px -3px rgba(15, 23, 42, 0.1)`
- **Level 3 (Modals):** High-contrast shadow to separate the element from the backdrop blur.
  - *Backdrop:* `#0F172A` at 40% opacity.

## Shapes

The design system uses a consistent **8px (rounded)** corner radius for standard UI components to soften the professional tone without feeling overly "playful."

- **Base Radius:** 8px (`0.5rem`) for buttons, input fields, and cards.
- **Large Radius:** 16px (`1rem`) for modals and large surface containers.
- **Full Radius:** Reserved specifically for status badges, tags, and avatars to create a clear visual distinction from interactive buttons.

## Components

### Navigation Sidebar
A persistent vertical bar on the left. Active states use a `primary-light` background tint with a 4px `primary-color` vertical border-left to denote the current selection. Use icons from a consistent line-art set.

### Modern Tables
- **Header:** Light gray background (`#F1F5F9`) with `label-sm` uppercase text.
- **Rows:** Minimum height of 56px. Hover states should apply a subtle `#F8FAFC` background color.
- **Status Badges:** Use "Pill" shapes with low-opacity background tints of the status color (e.g., Success badge has a 10% green background with 100% green text).

### Timeline (Repair Progress)
A vertical line connecting circular nodes. 
- **Completed steps:** Solid primary color with a checkmark icon.
- **Current step:** Primary color outline with a pulsing center.
- **Future steps:** Light gray outlines.

### Forms & Inputs
- **Inputs:** 8px radius, 1px border (`#CBD5E1`).
- **Focus State:** 1px `primary-color` border with a 3px `primary-color` outer glow at 10% opacity.
- **Labels:** Positioned above the input using `label-md` in `text-primary`.

### Confirmation Modals
Center-aligned on desktop, bottom-sheet style on mobile. Primary action buttons should be placed on the right, with "Cancel" or "Destructive" actions clearly differentiated by color or ghost-button styling.

### Cards
Cards are the primary container for content blocks. They must always include the `Level 1` shadow and an 8px radius. Use a consistent padding of 24px (`stack-lg`) for internal content.