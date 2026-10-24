---
name: css-component-guidelines
description: Core UI CSS class guidelines derived from `index.css`. Follow this to maintain global styling consistency without reinventing Tailwind combinations.
license: MIT
metadata:
  author: system
  version: "1.0.0"
---

# UI CSS Standards & Component Classes

This project relies on predefined Tailwind `@layer components` defined in `apps/web/src/index.css`. When building new features, **always use the predefined component classes** rather than raw Tailwind utilities if a component class exists.

## 1. Cards & Stats

- **`stat-card`**: Base styling for cards holding metrics/statistics. Applies hover scales, borders, shadows, and responsiveness.
- **`stat-card-icon`**: Container for an icon inside a `stat-card`. Adjusts size for mobile/desktop.

## 2. Buttons & Actions

- **`action-btn`**: Base styling for Call-to-Action buttons. Includes transition, disabled states, and active scales.
- **`action-btn-primary`**: Brand-colored (primary) action button styling.
- **`action-btn-secondary`**: Surface-level button for secondary actions (export, outline styles).
- **`table-action-btn`**: Transparent 8x8 icon-only button inside table rows.

## 3. Tables & Data Display

- **`table-row-interactive`**: Adds subtle primary colored animated left-border and row background on hover for table data rows.
- **`table-header-cell`**: Muted, uppercase, smaller font for `TableHead` cells.

## 4. Status & Priority Badges

Always compose these logic-based classes.

- **`status-badge`**: Base pill shape.
- Color variations: **`status-active`**, **`status-maintenance`**, **`status-inactive`**.
- Priority text color classes: **`priority-high`**, **`priority-medium`**, **`priority-low`**.

## 5. Layout & Typography

- **`page-header`**: Standardized flex container for title + actions.
- **`page-title`**: Responsive H1/H2 styling.
- **`page-subtitle`**: Uppercase eyebrow text for page headers.
- **`filter-panel`**: Sidebar or Drawer container for filters.

## Vercel UI Consistency Principles

As aligned with `web-design-guidelines`:

1. Use exact class match. Do not inject hardcoded `padding`, `margin`, or `colors` inline via Tailwind if a standard class wraps it.
2. Keep component UI DRY.
