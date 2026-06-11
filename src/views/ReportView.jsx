import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import Card from '../components/Card'
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            IT Labor Cost Allocation Report — {monthLabel}
          </h1>
          <p className="mt-1 text-xs font-medium text-gray-500">
            Derived from confirmed weekly allocations and loaded labor rates.
          </p>
        </div>
        <div className="no-print flex items-center gap-2">
          <button className="btn-secondary" onClick={exportCsv}>
            Export CSV
          </button>
          <button className="btn-secondary" onClick={() => window.print()}>
            Print / Export PDF
          </button>
        </div>
      </div>

      {signed && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-5 py-4">
          <p className="text-sm font-semibold text-green-800">
            Report signed and locked by {signed.name}
          </p>
          <p className="mt-1 text-xs font-medium text-green-700">
            Attested {signed.date} · Allocation figures for {monthLabel} are frozen.
          </p>
        </div>
      )}

      <Card title="Summary by employee">
        <div className="overflow-x-auto">
          <table className="table-striped w-full border-collapse">
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
                  <td className="td font-medium text-slate-800">{r.employee.name}</td>
                  <td className="td text-right">{formatHours(r.totalHours)}</td>
                  <td className="td text-right">{formatHours(r.capexHours)}</td>
                  <td className="td text-right">{formatHours(r.opexHours)}</td>
                  <td className="td text-right">{usd.format(r.employee.loadedRate)}/hr</td>
                  <td className="td text-right">{usd.format(r.capexDollars)}</td>
                  <td className="td text-right">{usd.format(r.opexDollars)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="td border-t-2 border-slate-300 font-semibold text-slate-800">
                  Total
                </td>
                <td className="td border-t-2 border-slate-300 text-right font-semibold text-slate-800">
                  {formatHours(totals.totalHours)}
                </td>
                <td className="td border-t-2 border-slate-300 text-right font-semibold text-slate-800">
                  {formatHours(totals.capexHours)}
                </td>
                <td className="td border-t-2 border-slate-300 text-right font-semibold text-slate-800">
                  {formatHours(totals.opexHours)}
                </td>
                <td className="td border-t-2 border-slate-300" />
                <td className="td border-t-2 border-slate-300 text-right font-semibold text-slate-800">
                  {usd.format(totals.capexDollars)}
                </td>
                <td className="td border-t-2 border-slate-300 text-right font-semibold text-slate-800">
                  {usd.format(totals.opexDollars)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      <section>
        <h2 className="mb-3 text-base font-semibold text-slate-800">Project breakdown</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {projectBreakdown.map(({ project, hours, dollars }) => (
            <Card key={project.id}>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-800">{project.name}</h3>
                <Badge variant={project.type} />
              </div>
              <p className="mt-3 text-xl font-semibold text-slate-800">{usd.format(dollars)}</p>
              <p className="mt-0.5 text-xs font-medium text-gray-500">
                {formatHours(hours)} hrs allocated this period
              </p>
            </Card>
          ))}
        </div>
      </section>

      <Card
        title="Manager attestation"
        subtitle="Required for the period to be considered audit-ready."
      >
        <div className="flex flex-wrap items-end gap-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-500">Manager name</span>
            <input
              type="text"
              className="input w-64"
              placeholder="Full name"
              value={signed ? signed.name : managerName}
              disabled={!!signed}
              onChange={(e) => setManagerName(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-500">Date</span>
            <input type="text" className="input w-44" value={dateLabel} disabled readOnly />
          </label>
        </div>
        <label className="mt-4 flex items-start gap-2.5">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 accent-brand-teal"
            checked={signed ? true : attested}
            disabled={!!signed}
            onChange={(e) => setAttested(e.target.checked)}
          />
          <span className="text-sm text-gray-700">
            I confirm this allocation accurately reflects my team&rsquo;s labor activity for the
            period.
          </span>
        </label>
        <div className="no-print mt-5 border-t border-slate-100 pt-4">
          <button
            className="btn-primary"
            disabled={!!signed || !attested || managerName.trim() === ''}
            onClick={() => setSigned({ name: managerName.trim(), date: dateLabel })}
          >
            {signed ? 'Report locked' : 'Sign and lock report'}
          </button>
        </div>
      </Card>
    </div>
  )
}
