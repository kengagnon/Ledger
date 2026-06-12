import { useApp } from '../context/AppContext'

export const TABS = [
  { id: 'manager', label: 'Manager Dashboard' },
  { id: 'employee', label: 'Employee View' },
  { id: 'report', label: 'Monthly Report' },
  { id: 'admin', label: 'Admin' },
]

const ICONS = {
  manager: (
    <>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </>
  ),
  employee: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-1a8 8 0 0 1 16 0v1" />
    </>
  ),
  report: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8M8 17h8" />
    </>
  ),
  admin: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" />
    </>
  ),
}

function formatWeekLong(week) {
  const [y, m, d] = week.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function Nav({ tab, onChange }) {
  const { week } = useApp()
  return (
    <nav className="sticky top-0 z-10 flex shrink-0 flex-row items-center gap-2 bg-ink px-4 py-2 min-[900px]:h-screen min-[900px]:w-[232px] min-[900px]:flex-col min-[900px]:items-stretch min-[900px]:gap-0 min-[900px]:px-0 min-[900px]:py-0">
      <div className="px-2 py-2 min-[900px]:px-6 min-[900px]:pb-6 min-[900px]:pt-8">
        <span className="font-display text-[22px] font-medium leading-none text-paper">
          Ledger
        </span>
        <div className="mt-2.5 hidden h-[3px] w-8 bg-brand-lime min-[900px]:block" />
        <p className="mt-4 hidden text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(252,252,250,0.45)] min-[900px]:block">
          IT Labor Cost Allocation
        </p>
      </div>

      <div className="flex min-w-0 flex-1 flex-row overflow-x-auto min-[900px]:mt-2 min-[900px]:flex-col min-[900px]:overflow-visible">
        {TABS.map((t) => {
          const active = t.id === tab
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              aria-current={active ? 'page' : undefined}
              className={`flex shrink-0 items-center gap-3 whitespace-nowrap border-l-2 px-3 py-2.5 text-sm font-medium transition-colors duration-100 min-[900px]:px-6 ${
                active
                  ? 'border-brand-lime bg-white/5 text-paper'
                  : 'border-transparent text-[rgba(252,252,250,0.65)] hover:text-paper'
              }`}
            >
              <svg
                className="h-4 w-4 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {ICONS[t.id]}
              </svg>
              {t.label}
            </button>
          )
        })}
      </div>

      <div className="hidden border-t border-[rgba(255,255,255,0.12)] px-6 py-5 min-[900px]:block">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(252,252,250,0.45)]">
          Week of
        </p>
        <p className="mt-1.5 font-mono text-[13px] text-paper">{formatWeekLong(week)}</p>
      </div>
    </nav>
  )
}
