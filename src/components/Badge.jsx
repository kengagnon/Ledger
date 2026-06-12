// Typographic classification/status marks: an 8px square glyph plus a mono
// uppercase label. No fills, no pills — ink-on-paper accounting notation.
const MARKS = {
  capex: { color: '#009EDE', square: 'outline' },
  opex: { color: '#5C645F', square: 'outline' },
  confirmed: { color: '#00A57D', square: 'filled' },
  pending: { color: '#B45309', square: 'outline' },
  exception: { color: '#C2410C', square: 'half' },
}

const LABELS = {
  capex: 'CapEx',
  opex: 'OpEx',
  confirmed: 'Confirmed',
  pending: 'Pending',
  exception: 'Exception',
}

function Square({ type, color }) {
  return (
    <svg className="h-2 w-2 shrink-0" viewBox="0 0 8 8" aria-hidden="true">
      {type === 'filled' && <rect width="8" height="8" fill={color} />}
      {type === 'outline' && (
        <rect x="0.75" y="0.75" width="6.5" height="6.5" fill="none" stroke={color} strokeWidth="1.5" />
      )}
      {type === 'half' && (
        <>
          <rect x="0.75" y="0.75" width="6.5" height="6.5" fill="none" stroke={color} strokeWidth="1.5" />
          <rect width="4" height="8" fill={color} />
        </>
      )}
    </svg>
  )
}

export default function Badge({ variant, children }) {
  const mark = MARKS[variant] || MARKS.opex
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap font-mono text-[10px] font-bold uppercase tracking-[0.08em]"
      style={{ color: mark.color }}
    >
      <Square type={mark.square} color={mark.color} />
      {children || LABELS[variant]}
    </span>
  )
}
