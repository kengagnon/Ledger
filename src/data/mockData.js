// Seed data for Ledger. All data is in-memory; nothing here talks to a backend.

// Monday of the current week, formatted YYYY-MM-DD — used as the week key everywhere.
export function currentWeekOf() {
  const d = new Date()
  const daysSinceMonday = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - daysSinceMonday)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const week = currentWeekOf()

export const projects = [
  { id: 'p-alpha', name: 'Project Alpha', type: 'capex', epic: 'ALPHA-100 Payments Modernization', active: true },
  { id: 'p-beta', name: 'Project Beta', type: 'capex', epic: 'BETA-200 Member Portal Re-platform', active: true },
  { id: 'p-bau', name: 'BAU Operations', type: 'opex', epic: 'OPS-1 Run-the-Bank', active: true },
]

export const employees = [
  { id: 'e1', name: 'Sarah Chen', loadedRate: 132, teamId: 't1' },
  { id: 'e2', name: 'Marcus Webb', loadedRate: 118, teamId: 't1' },
  { id: 'e3', name: 'Priya Raman', loadedRate: 145, teamId: 't1' },
  { id: 'e4', name: 'Daniel Ortiz', loadedRate: 96, teamId: 't1' },
  { id: 'e5', name: 'Emily Nakamura', loadedRate: 124, teamId: 't1' },
  { id: 'e6', name: 'Tom Becker', loadedRate: 85, teamId: 't1' },
]

// Manager-set intent percentages. Roughly 50/30/20 with per-person variation.
export const managerAllocations = [
  { employeeId: 'e1', projectId: 'p-alpha', percentage: 50 },
  { employeeId: 'e1', projectId: 'p-beta', percentage: 30 },
  { employeeId: 'e1', projectId: 'p-bau', percentage: 20 },

  { employeeId: 'e2', projectId: 'p-alpha', percentage: 55 },
  { employeeId: 'e2', projectId: 'p-beta', percentage: 30 },
  { employeeId: 'e2', projectId: 'p-bau', percentage: 15 },

  { employeeId: 'e3', projectId: 'p-alpha', percentage: 50 },
  { employeeId: 'e3', projectId: 'p-beta', percentage: 30 },
  { employeeId: 'e3', projectId: 'p-bau', percentage: 20 },

  { employeeId: 'e4', projectId: 'p-alpha', percentage: 40 },
  { employeeId: 'e4', projectId: 'p-beta', percentage: 20 },
  { employeeId: 'e4', projectId: 'p-bau', percentage: 40 },

  { employeeId: 'e5', projectId: 'p-alpha', percentage: 60 },
  { employeeId: 'e5', projectId: 'p-beta', percentage: 30 },
  { employeeId: 'e5', projectId: 'p-bau', percentage: 10 },

  { employeeId: 'e6', projectId: 'p-alpha', percentage: 25 },
  { employeeId: 'e6', projectId: 'p-beta', percentage: 35 },
  { employeeId: 'e6', projectId: 'p-bau', percentage: 40 },
]

// Current-week Jira activity. Hours are derived elsewhere as storyPoints × spConversionRate.
export const weeklyActivity = [
  {
    employeeId: 'e1',
    week,
    tickets: [
      { key: 'ALPHA-142', title: 'Build ACH file ingestion adapter', storyPoints: 5, projectId: 'p-alpha' },
      { key: 'ALPHA-147', title: 'Schema migration for settlement ledger entries', storyPoints: 3, projectId: 'p-alpha' },
      { key: 'BETA-218', title: 'Card tokenization API contract review', storyPoints: 5, projectId: 'p-beta' },
      { key: 'OPS-1093', title: 'Incident follow-up: batch queue backlog', storyPoints: 3, projectId: 'p-bau' },
    ],
  },
  {
    employeeId: 'e2',
    week,
    tickets: [
      { key: 'ALPHA-151', title: 'Real-time posting engine spike', storyPoints: 8, projectId: 'p-alpha' },
      { key: 'BETA-204', title: 'Member login session hardening', storyPoints: 2, projectId: 'p-beta' },
      { key: 'BETA-211', title: 'Account summary widget rebuild', storyPoints: 3, projectId: 'p-beta' },
      { key: 'OPS-1101', title: 'Patch Tuesday remediation — app servers', storyPoints: 2, projectId: 'p-bau' },
    ],
  },
  {
    employeeId: 'e3',
    week,
    tickets: [
      { key: 'ALPHA-138', title: 'Wire transfer validation rules engine', storyPoints: 3, projectId: 'p-alpha' },
      { key: 'ALPHA-156', title: 'Dual-write cutover plan for GL feed', storyPoints: 5, projectId: 'p-alpha' },
      { key: 'BETA-209', title: 'Statement download service migration', storyPoints: 3, projectId: 'p-beta' },
      { key: 'BETA-220', title: 'Accessibility audit fixes — transfers flow', storyPoints: 2, projectId: 'p-beta' },
      { key: 'OPS-1088', title: 'Quarterly access review automation', storyPoints: 3, projectId: 'p-bau' },
    ],
  },
  {
    employeeId: 'e4',
    week,
    tickets: [
      { key: 'ALPHA-149', title: 'Payment status webhook consumer', storyPoints: 5, projectId: 'p-alpha' },
      { key: 'BETA-216', title: 'Push notification preference center', storyPoints: 3, projectId: 'p-beta' },
      { key: 'OPS-1095', title: 'On-call triage and alert tuning', storyPoints: 5, projectId: 'p-bau' },
    ],
  },
  {
    employeeId: 'e5',
    week,
    tickets: [
      { key: 'ALPHA-144', title: 'Ledger balancing reconciliation service', storyPoints: 8, projectId: 'p-alpha' },
      { key: 'ALPHA-153', title: 'Add idempotency keys to posting API', storyPoints: 2, projectId: 'p-alpha' },
      { key: 'BETA-207', title: 'Bill pay vendor SDK integration', storyPoints: 5, projectId: 'p-beta' },
      { key: 'OPS-1090', title: 'Certificate rotation — internal services', storyPoints: 1, projectId: 'p-bau' },
    ],
  },
  {
    employeeId: 'e6',
    week,
    tickets: [
      { key: 'ALPHA-158', title: 'Test data factory for posting scenarios', storyPoints: 3, projectId: 'p-alpha' },
      { key: 'BETA-213', title: 'Document upload virus-scan pipeline', storyPoints: 5, projectId: 'p-beta' },
      { key: 'OPS-1097', title: 'Backup verification job repair', storyPoints: 2, projectId: 'p-bau' },
      { key: 'OPS-1099', title: 'ServiceNow request queue grooming', storyPoints: 3, projectId: 'p-bau' },
    ],
  },
]

// Two employees have already confirmed this week: Sarah as-estimated,
// Daniel with manual adjustments (surfaces as an Exception on the dashboard).
export const confirmations = [
  {
    employeeId: 'e1',
    week,
    confirmed: true,
    adjusted: false,
    adjustedAllocations: [
      { projectId: 'p-alpha', percentage: 50 },
      { projectId: 'p-beta', percentage: 31 },
      { projectId: 'p-bau', percentage: 19 },
    ],
    timestamp: `${week}T09:14:00`,
  },
  {
    employeeId: 'e4',
    week,
    confirmed: true,
    adjusted: true,
    adjustedAllocations: [
      { projectId: 'p-alpha', percentage: 30 },
      { projectId: 'p-beta', percentage: 20 },
      { projectId: 'p-bau', percentage: 50 },
    ],
    timestamp: `${week}T11:42:00`,
  },
]

export const spConversionRate = 4
