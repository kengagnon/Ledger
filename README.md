# Ledger

A lightweight IT labor cost allocation tool for CapEx/OpEx accounting compliance.

Managers set intent allocations for their team, employees confirm (or adjust) a
weekly split derived from Jira story points, and the Monthly Report view produces
an audit-ready summary with manager attestation, CSV export, and print/PDF output.

All data is mocked in-memory (`src/data/mockData.js`) — no backend, no external
APIs, no authentication.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
```

## Stack

- React 18 + Vite 5
- Tailwind CSS 3
- Tab-based navigation (no router)
- Shared state via React Context (`src/context/AppContext.jsx`)

## Views

| View | Purpose |
| --- | --- |
| Manager Dashboard | Team allocation splits, push a default split to the team, weekly confirmation status |
| Employee View | Weekly confirmation prompt — Jira-derived estimate, adjustable split, confirm flow |
| Monthly Report | Audit-ready summary by employee and project, attestation + sign-and-lock, CSV export, print/PDF |
| Admin | Project registry (CapEx/OpEx, active), story-point conversion rate, loaded labor rates |

Derived hours are computed as `storyPoints × spConversionRate` (default 4 hrs/SP).
Admin changes to rates and the conversion factor flow through to Report totals
immediately via shared context.
