import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import Badge from '../components/Badge'

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

function formatHours(h) {
  return Number.isInteger(h) ? String(h) : h.toFixed(1)
}

export default function ReportView() {
  const { employees, projects, totalDerivedHours, effectiveSplit, projectById } = useApp()

  const [managerName, setManagerName] = useState('')
  const [attested, setAttested] = useState(false)
  const [signed, setSigned] = useState(null) // { name, date } once locked

  const today = new Date()
  const monthLabel = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const dateLabel = today.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const rows = useMemo(
    () =>
      employees.map((e) => {
        const totalHours = totalDerivedHours(e.id)
        const split = effectiveSplit(e.id)
        const capexPct = split
          .filter((s) => projectById[s.projectId]?.type === 'capex')
          .reduce((sum, s) => sum + s.percentage, 0)
        const capexHours = (totalHours * capexPct) / 100
        const opexHours = totalHours - capexHours
        return {
          employee: e,
          totalHours,
          capexHours,
          opexHours,
          capexDollars: capexHours * e.loadedRate,
          opexDollars: opexHours * e.loadedRate,
        }
      }),
    [employees, totalDerivedHours, effectiveSplit, projectById]
  )

  const totals = rows.reduce(
    (acc, r) => ({
      totalHours: acc.totalHours + r.totalHours,
      capexHours: acc.capexHours + r.capexHours,
      opexHours: acc.opexHours + r.opexHours,
      capexDollars: acc.capexDollars + r.capexDollars,
      opexDollars: acc.opexDollars + r.opexDollars,
    }),
    { totalHours: 0, capexHours: 0, opexHours: 0, capexDollars: 0, opexDollars: 0 }
  )

  const projectBreakdown = useMemo(
    () =>
      projects
        .filter((p) => p.active)
        .map((p) => {
          let hours = 0
          let dollars = 0
          for (const e of employees) {
            const totalHours = totalDerivedHours(e.id)
            const pct = effectiveSplit(e.id).find((s) => s.projectId === p.id)?.percentage || 0
            const h = (totalHours * pct) / 100
            hours += h
            dollars += h * e.loadedRate
          }
          return { project: p, hours, dollars }
        }),
    [projects, employees, totalDerivedHours, effectiveSplit]
  )

  function exportCsv() {
    const header = [
      'Employee',
      'Total Hours',
      'CapEx Hours',
      'OpEx Hours',
      'Loaded Rate',
      'CapEx $',
      'OpEx $',
    ]
    const lines = rows.map((r) =>
      [
        r.employee.name,
        r.totalHours.toFixed(1),
        r.capexHours.toFixed(1),
        r.opexHours.toFixed(1),
        r.employee.loadedRate.toFixed(2),
        r.capexDollars.toFixed(2),
        r.opexDollars.toFixed(2),
      ].join(',')
    )
    const totalLine = [
      'Total',
      totals.totalHours.toFixed(1),
      totals.capexHours.toFixed(1),
      totals.opexHours.toFixed(1),
      '',
      totals.capexDollars.toFixed(2),
      totals.opexDollars.toFixed(2),
    ].join(',')
    const csv = [header.join(','), ...lines, totalLine].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ledger-labor-allocation-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const checkboxChecked = signed ? true : attested

  return (
    <div className="mx-auto max-w-[1000px]">
      <div className="no-print mb-6 flex justify-end gap-2">
        <button className="btn-ghost-dark" onClick={exportCsv}>
          Export CSV
        </button>
        <button className="btn-ghost-dark" onClick={() => window.print()}>
          Print / Export PDF
        </button>
      </div>

      <div className="report-sheet sheet-land mx-auto max-w-[880px] rounded-[2px] bg-white px-8 py-12 shadow-sheet sm:px-[72px] sm:py-16">
        <header>
          <p className="eyebrow">First Tech Federal Credit Union</p>
          <h1 className="mt-3 font-display text-4xl font-medium leading-tight tracking-[-0.01em] text-txt-primary">
            IT Labor Cost Allocation
          </h1>
          <p className="mt-2.5 font-mono text-xs text-txt-secondary">
            {monthLabel} · Prepared by Ledger
          </p>
          <div className="mt-7 border-b-[1.5px] border-txt-primary" />
        </header>

        {signed && (
          <p className="mt-5 font-mono text-xs text-txt-secondary">
            Report signed and locked by {signed.name} · Attested {signed.date} · Allocation
            figures for {monthLabel} are frozen.
          </p>
        )}

        <section className="mt-9">
          <h2 className="section-title">Summary by employee</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="th">Employee</th>
                  <th className="th text-right">Total Hours</th>
                  <th className="th text-right">CapEx Hours</th>
                  <th className="th text-right">OpEx Hours</th>
                  <th className="th text-right">Loaded Rate</th>
                  <th className="th text-right">CapEx $</th>
                  <th className="th text-right">OpEx $</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.employee.id}>
                    <td className="td font-medium">{r.employee.name}</td>
                    <td className="td td-num">{formatHours(r.totalHours)}</td>
                    <td className="td td-num">{formatHours(r.capexHours)}</td>
                    <td className="td td-num">{formatHours(r.opexHours)}</td>
                    <td className="td td-num">{usd.format(r.employee.loadedRate)}/hr</td>
                    <td className="td td-num">{usd.format(r.capexDollars)}</td>
                    <td className="td td-num">{usd.format(r.opexDollars)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="total-row">
                  <td className="td">Total</td>
                  <td className="td td-num">{formatHours(totals.totalHours)}</td>
                  <td className="td td-num">{formatHours(totals.capexHours)}</td>
                  <td className="td td-num">{formatHours(totals.opexHours)}</td>
                  <td className="td" />
                  <td className="td td-num">{usd.format(totals.capexDollars)}</td>
                  <td className="td td-num">{usd.format(totals.opexDollars)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="section-title">Project breakdown</h2>
          <div className="mt-5 grid gap-8 sm:grid-cols-3">
            {projectBreakdown.map(({ project, hours, dollars }) => (
              <div key={project.id}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-medium text-txt-primary">{project.name}</h3>
                  <Badge variant={project.type} />
                </div>
                <p className="mt-3 font-mono text-[28px] font-medium leading-none text-txt-primary">
                  {usd.format(dollars)}
                </p>
                <p className="mt-2 font-mono text-xs text-txt-secondary">
                  {formatHours(hours)} hrs this period
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14 border-t border-hairline pt-7">
          <p className="eyebrow">Attestation</p>
          <p className="mt-4 font-display text-base italic text-txt-primary">
            I confirm this allocation accurately reflects my team&rsquo;s labor activity for
            the period.
          </p>
          <div className="mt-8 flex flex-wrap items-end gap-10">
            <label className="flex w-72 flex-col">
              <input
                type="text"
                className="signature-input"
                placeholder="Sign here"
                value={signed ? signed.name : managerName}
                disabled={!!signed}
                onChange={(e) => setManagerName(e.target.value)}
              />
              <span className="eyebrow mt-2">Manager name</span>
            </label>
            <div className="flex flex-col">
              <span className="pb-1 font-mono text-sm text-txt-primary">{dateLabel}</span>
              <span className="eyebrow mt-2">Date</span>
            </div>
          </div>
          <label className="mt-7 inline-flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={checkboxChecked}
              disabled={!!signed}
              onChange={(e) => setAttested(e.target.checked)}
            />
            <span
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border-[1.5px] border-ink peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-teal ${
                checkboxChecked ? 'bg-ink' : 'bg-white'
              }`}
              aria-hidden="true"
            >
              {checkboxChecked && (
                <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path
                    d="M2.5 6.5l2.5 2.5 4.5-5.5"
                    stroke="#FCFCFA"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            <span className="text-sm text-txt-primary">
              I attest to the figures above for {monthLabel}.
            </span>
          </label>

          {signed ? (
            <div className="mt-8 flex items-center gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-ink">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path
                    d="M4 10.5l4 4 8-9.5"
                    stroke="#FCFCFA"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="font-mono text-sm text-txt-primary">
                Signed by {signed.name} · {signed.date}
              </span>
            </div>
          ) : (
            <div className="no-print mt-8">
              <button
                className="btn-primary"
                disabled={!attested || managerName.trim() === ''}
                onClick={() => setSigned({ name: managerName.trim(), date: dateLabel })}
              >
                Sign and lock report
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
