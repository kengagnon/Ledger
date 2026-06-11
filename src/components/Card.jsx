// Top accent stripe colors keyed by project classification; "teal" for neutral cards.
const ACCENTS = {
  capex: 'border-t-[3px] border-t-brand-blue',
  opex: 'border-t-[3px] border-t-slate-400',
  teal: 'border-t-[3px] border-t-brand-teal',
}

export default function Card({ title, subtitle, actions, accent, children, className = '' }) {
  return (
    <section
      className={`rounded-xl border border-slate-200 bg-white p-5 shadow-card ${
        accent ? ACCENTS[accent] || ACCENTS.teal : ''
      } ${className}`}
    >
      {(title || actions) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title && (
              <h2 className="text-base font-semibold text-slate-800">{title}</h2>
            )}
            {subtitle && <p className="mt-0.5 text-xs font-medium text-gray-500">{subtitle}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  )
}
