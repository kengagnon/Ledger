const VARIANTS = {
  capex: 'bg-blue-50 text-blue-700 border-blue-200',
  opex: 'bg-slate-50 text-slate-600 border-slate-300',
  confirmed: 'bg-green-50 text-green-700 border-green-200',
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  exception: 'bg-orange-50 text-orange-700 border-orange-300',
}

const LABELS = {
  capex: 'CapEx',
  opex: 'OpEx',
  confirmed: 'Confirmed',
  pending: 'Pending',
  exception: 'Exception',
}

export default function Badge({ variant, children }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded border px-2 py-[2px] text-[11px] font-semibold uppercase tracking-[0.03em] ${VARIANTS[variant] || VARIANTS.opex}`}
    >
      {children || LABELS[variant]}
    </span>
  )
}
