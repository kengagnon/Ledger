import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import Card from '../components/Card'
import Badge from '../components/Badge'
import PageHeader from '../components/PageHeader'

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

function formatHours(h) {
  return Number.isInteger(h) ? String(h) : h.toFixed(1)
}

function LockIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-slate-500"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-green-700"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  )
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
      <div className="-mx-6 -mt-8 border-b border-slate-200 bg-slate-50 px-6 py-6">
        <PageHeader
          title={`IT Labor Cost Allocation Report — ${monthLabel}`}
          subtext="Derived from confirmed weekly allocations and loaded labor rates."
          actions={
            <div className="no-print flex items-center gap-2">
              <button className="btn-secondary" onClick={exportCsv}>
                Export CSV
              </button>
              <button className="btn-secondary" onClick={() => window.print()}>
                Print / Export PDF
              </button>
            </div>
          }
        />
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

      <Card accent="teal" title="Summary by employee">
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
                  <td className="td text-right font-semibold text-slate-900">
                    {usd.format(r.capexDollars)}
                  </td>
                  <td className="td text-right font-semibold text-slate-900">
                    {usd.format(r.opexDollars)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-green-50">
                <td className="td border-t-2 border-t-brand-teal font-bold text-slate-900">
                  Total
                </td>
                <td className="td border-t-2 border-t-brand-teal text-right font-bold text-slate-900">
                  {formatHours(totals.totalHours)}
                </td>
                <td className="td border-t-2 border-t-brand-teal text-right font-bold text-slate-900">
                  {formatHours(totals.capexHours)}
                </td>
                <td className="td border-t-2 border-t-brand-teal text-right font-bold text-slate-900">
                  {formatHours(totals.opexHours)}
                </td>
                <td className="td border-t-2 border-t-brand-teal" />
                <td className="td border-t-2 border-t-brand-teal text-right font-bold text-slate-900">
                  {usd.format(totals.capexDollars)}
                </td>
                <td className="td border-t-2 border-t-brand-teal text-right font-bold text-slate-900">
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
            <Card key={project.id} accent={project.type}>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-800">{project.name}</h3>
                <Badge variant={project.type} />
              </div>
              <p className="mt-3 text-[32px] font-bold leading-tight text-slate-900">
                {usd.format(dollars)}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatHours(hours)} hrs allocated this period
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 border-t-[3px] border-t-brand-teal bg-[#FAFAFA] p-6 shadow-card">
        <div className="mb-4">
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-800">
            <LockIcon />
            Manager attestation
          </h2>
          <p className="mt-0.5 text-xs font-medium text-gray-500">
            Required for the period to be considered audit-ready.
          </p>
        </div>
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
            className="mt-0.5 h-4 w-4 rounded accent-brand-teal"
            checked={signed ? true : attested}
            disabled={!!signed}
            onChange={(e) => setAttested(e.target.checked)}
          />
          <span className="text-sm text-gray-700">
            I confirm this allocation accurately reflects my team&rsquo;s labor activity for the
            period.
          </span>
        </label>
        {signed ? (
          <div className="mt-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
            <CheckIcon />
            <span className="text-sm font-semibold text-green-700">
              Signed by {signed.name} · {signed.date}
            </span>
          </div>
        ) : (
          <div className="no-print mt-5 border-t border-slate-200 pt-4">
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
  )
}
