// Percentage input styled as a ledger line: bare underline, teal on focus,
// rust-red underline when the row total ≠ 100.
export default function AllocationInput({ value, onChange, invalid = false, disabled = false, label }) {
  return (
    <span className="inline-flex items-baseline gap-1">
      <input
        type="number"
        min="0"
        max="100"
        step="1"
        value={value}
        disabled={disabled}
        aria-label={label}
        aria-invalid={invalid}
        onChange={(e) => {
          const n = e.target.value === '' ? 0 : Number(e.target.value)
          onChange(Number.isNaN(n) ? 0 : n)
        }}
        className={`input-ledger ${
          invalid ? 'border-[#C2410C] focus:border-[#C2410C]' : ''
        }`}
      />
      <span className="font-mono text-xs text-txt-tertiary">%</span>
    </span>
  )
}
