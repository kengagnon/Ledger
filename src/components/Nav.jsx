export const TABS = [
  { id: 'manager', label: 'Manager Dashboard' },
  { id: 'employee', label: 'Employee View' },
  { id: 'report', label: 'Monthly Report' },
  { id: 'admin', label: 'Admin' },
]

export default function Nav({ tab, onChange }) {
  return (
    <nav className="sticky top-0 z-10 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-14 max-w-[1100px] items-center justify-between px-6">
        <div className="flex items-baseline gap-2.5">
          <span className="text-lg font-bold tracking-tight text-brand-teal">Ledger</span>
          <span className="hidden text-xs font-medium text-gray-500 sm:inline">
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
                className={`relative flex items-center px-3 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-teal ${
                  active
                    ? 'font-semibold text-brand-teal'
                    : 'font-medium text-gray-500 hover:text-slate-800'
                }`}
              >
                {t.label}
                {active && (
                  <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-t bg-brand-teal" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
