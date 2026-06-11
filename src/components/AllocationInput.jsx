// Percentage input used in allocation tables. Turns red when the row total ≠ 100.
export default function AllocationInput({ value, onChange, invalid = false, disabled = false, label }) {
  return (
    <div className="relative inline-flex items-center">
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
        className={`input w-[72px] pr-7 text-center ${
          invalid ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''
        }`}
      />
      <span className="pointer-events-none absolute right-2.5 text-xs text-gray-400">%</span>
    </div>
  )
}
