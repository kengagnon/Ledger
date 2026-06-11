import { useApp } from '../context/AppContext'

export const TABS = [
  { id: 'manager', label: 'Manager Dashboard' },
  { id: 'employee', label: 'Employee View' },
  { id: 'report', label: 'Monthly Report' },
  { id: 'admin', label: 'Admin' },
]

function formatWeekShort(week) {
  const [y, m, d] = week.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function Nav({ tab, onChange }) {
  const { week } = useApp()
  return (
    <nav className="sticky top-0 z-10 border-b border-slate-200 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between gap-4 px-6">
        <div className="flex items-baseline gap-2.5">
          <span className="text-lg font-bold tracking-[-0.02em] text-brand-teal">Ledger</span>
          <span className="hidden text-[11px] font-normal uppercase tracking-[0.04em] text-slate-400 sm:inline">
            IT Labor Cost Allocation
          </span>
        </div>
        <div className="flex h-full items-stretch gap-1">
          {TABS.map((t) => {
            const active = t.id === tab
            return (
              <button
                key={t.id}
                onClick={() => onChange(t.id)}
                aria-current={active ? 'page' : undefined}
                className={`relative flex items-center bg-transparent px-3 text-sm font-medium transition-colors duration-150 ${
                  active ? 'text-brand-teal' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t.label}
                {active && <span className="absolute inset-x-3 bottom-0 h-0.5 bg-brand-teal" />}
              </button>
            )
          })}
        </div>
        <span className="hidden whitespace-nowrap rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700 lg:inline">
          Week of {formatWeekShort(week)}
        </span>
      </div>
    </nav>
  )
}
