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
        className={`input w-[68px] pr-6 text-center font-semibold ${
          invalid ? 'border-red-500 bg-[#FFF5F5]' : ''
        }`}
      />
      <span className="pointer-events-none absolute right-2 text-xs text-gray-400">%</span>
    </div>
  )
}
