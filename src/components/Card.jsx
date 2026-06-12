// Document-like plate: white sheet, hairline border, sharp 4px corners.
export default function Card({ title, subtitle, actions, children, className = '' }) {
  return (
    <section className={`rounded border border-hairline bg-white p-6 ${className}`}>
      {(title || actions) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="section-title">{title}</h2>}
            {subtitle && <p className="mt-1 text-xs text-txt-secondary">{subtitle}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  )
}
