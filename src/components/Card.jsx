export default function Card({ title, subtitle, actions, children, className = '' }) {
  return (
    <section
      className={`rounded-lg border border-slate-200 bg-white p-5 shadow-card ${className}`}
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
