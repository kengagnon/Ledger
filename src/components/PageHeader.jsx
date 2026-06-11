// Standard page title block: teal left accent, 28px title, muted subtext.
export default function PageHeader({ title, subtext, actions }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="border-l-[3px] border-brand-teal pl-3">
        <h1 className="text-[28px] font-bold leading-tight tracking-[-0.02em] text-slate-900">
          {title}
        </h1>
        {subtext && <div className="mt-1 text-sm text-slate-500">{subtext}</div>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}
