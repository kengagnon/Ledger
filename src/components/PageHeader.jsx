// Editorial page title block: eyebrow context line, Newsreader display title.
export default function PageHeader({ eyebrow, title, subtext, actions }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-2 font-display text-[32px] font-medium leading-tight tracking-[-0.01em] text-txt-primary">
          {title}
        </h1>
        {subtext && <div className="mt-2 text-sm text-txt-secondary">{subtext}</div>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}
