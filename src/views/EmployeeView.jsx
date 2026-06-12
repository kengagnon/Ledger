import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import Card from '../components/Card'
import Badge from '../components/Badge'
import AllocationInput from '../components/AllocationInput'
import PageHeader from '../components/PageHeader'

function formatWeek(week) {
  const [y, m, d] = week.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

const CLASSIFICATION_FILL = {
  capex: '#009EDE',
  opex: '#5C645F',
}

export default function EmployeeView() {
  const {
    employees,
    projects,
    weeklyActivity,
    spConversionRate,
    derivedHours,
    totalDerivedHours,
    derivedSplit,
    confirmationFor,
    confirm,
    projectById,
    week,
  } = useApp()

  const [selectedId, setSelectedId] = useState(employees[0].id)
  // Unsaved percentage edits, keyed by employee so switching people doesn't leak values
  const [edits, setEdits] = useState({})

  const employee = employees.find((e) => e.id === selectedId)
  const activeProjects = projects.filter((p) => p.active)
  const hours = derivedHours(selectedId)
  const totalHours = totalDerivedHours(selectedId)
  const split = derivedSplit(selectedId)
  const confirmation = confirmationFor(selectedId)
  const tickets = weeklyActivity.find((a) => a.employeeId === selectedId)?.tickets ?? []

  const values = useMemo(() => {
    if (confirmation?.confirmed) {
      return Object.fromEntries(
        confirmation.adjustedAllocations.map((a) => [a.projectId, a.percentage])
      )
    }
    const base = Object.fromEntries(split.map((s) => [s.projectId, s.percentage]))
    return { ...base, ...(edits[selectedId] || {}) }
  }, [confirmation, split, edits, selectedId])

  const total = activeProjects.reduce((sum, p) => sum + (values[p.id] || 0), 0)
  const hasEdits = activeProjects.some(
    (p) => (values[p.id] || 0) !== (split.find((s) => s.projectId === p.id)?.percentage || 0)
  )

  function setValue(projectId, v) {
    setEdits((prev) => ({
      ...prev,
      [selectedId]: { ...(prev[selectedId] || {}), [projectId]: v },
    }))
  }

  function handleConfirm(useAdjustments) {
    const allocations = activeProjects.map((p) => ({
      projectId: p.id,
      percentage: useAdjustments ? values[p.id] || 0 : split.find((s) => s.projectId === p.id)?.percentage || 0,
    }))
    confirm(selectedId, allocations, useAdjustments && hasEdits)
    setEdits((prev) => {
      const next = { ...prev }
      delete next[selectedId]
      return next
    })
  }

  return (
    <div className="stagger space-y-10">
      <PageHeader
        eyebrow="Employee · Weekly Confirmation"
        title={`Week of ${formatWeek(week)}`}
        subtext={
          <>
            Here&rsquo;s your estimated allocation, derived from Jira activity at{' '}
            {spConversionRate} hrs per story point.
          </>
        }
        actions={
          <label className="flex items-center gap-2">
            <span className="eyebrow">Viewing as</span>
            <select
              className="input"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </label>
        }
      />

      {confirmation?.confirmed && (
        <div className="flex items-start justify-between gap-4 rounded-[2px] bg-ink px-6 py-5 text-paper">
          <div className="flex items-start gap-3">
            <svg
              className="mt-0.5 h-5 w-5 shrink-0"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <rect x="1" y="1" width="18" height="18" stroke="#97D162" strokeWidth="1.5" />
              <path
                d="M6 10.5l3 3 5.5-7"
                stroke="#97D162"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div>
              <p className="text-sm font-medium">
                {employee.name} confirmed this week&rsquo;s allocation
                {confirmation.adjusted ? ' with adjustments' : ''}
              </p>
              <p className="mt-1.5 font-mono text-xs text-[rgba(252,252,250,0.65)]">
                {new Date(confirmation.timestamp).toLocaleString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
                {' · '}
                {confirmation.adjustedAllocations
                  .map((a) => `${projectById[a.projectId]?.name} ${a.percentage}%`)
                  .join(' · ')}
              </p>
            </div>
          </div>
          <Badge variant={confirmation.adjusted ? 'exception' : 'confirmed'} />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {activeProjects.map((p) => {
          const h = hours[p.id] || 0
          const pct = split.find((s) => s.projectId === p.id)?.percentage || 0
          return (
            <Card key={p.id}>
              <div className="flex items-start justify-between gap-3">
                <h2 className="section-title">{p.name}</h2>
                <Badge variant={p.type} />
              </div>
              <p className="mt-5 font-mono text-[40px] font-medium leading-none text-ink">
                {h}
              </p>
              <p className="eyebrow mt-2">hrs estimated</p>
              <div className="mt-4 flex items-center gap-2">
                <div className="h-1 flex-1 bg-hairline">
                  <div
                    className="h-full"
                    style={{
                      width: `${Math.min(pct, 100)}%`,
                      backgroundColor: CLASSIFICATION_FILL[p.type] || CLASSIFICATION_FILL.opex,
                    }}
                  />
                </div>
                <span className="font-mono text-xs text-txt-secondary">{pct}%</span>
              </div>
            </Card>
          )
        })}
      </div>

      <section>
        <h2 className="section-title">Confirm your split</h2>
        <p className="mt-1 text-xs text-txt-secondary">
          Pre-populated from your Jira activity. Adjust if it doesn&rsquo;t match reality —
          must total 100%.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-6">
          {activeProjects.map((p) => (
            <label key={p.id} className="flex flex-col gap-2">
              <span className="eyebrow">{p.name}</span>
              <AllocationInput
                value={values[p.id] || 0}
                invalid={total !== 100}
                disabled={!!confirmation?.confirmed}
                label={`${p.name} percentage`}
                onChange={(v) => setValue(p.id, v)}
              />
            </label>
          ))}
          <div className="flex flex-col pb-1">
            <span
              className={`font-mono text-sm font-semibold ${
                total === 100 ? 'text-txt-primary' : 'text-[#C2410C]'
              }`}
            >
              Total {total}%
            </span>
            {total !== 100 && (
              <span className="font-mono text-[10px] text-[#C2410C]">≠ 100</span>
            )}
          </div>
        </div>

        {!confirmation?.confirmed && (
          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-hairline pt-5">
            <button className="btn-primary" onClick={() => handleConfirm(false)}>
              Looks right — Confirm
            </button>
            <button
              className="btn-secondary"
              disabled={total !== 100}
              onClick={() => handleConfirm(true)}
            >
              Save adjustments and confirm
            </button>
            {hasEdits && total === 100 && (
              <span className="text-xs text-txt-secondary">
                Your adjustments will be flagged for manager review.
              </span>
            )}
          </div>
        )}
      </section>

      <section>
        <h2 className="section-title">Jira activity this week</h2>
        <p className="mt-1 text-xs text-txt-secondary">
          Read-only context · story points convert at {spConversionRate} hrs/SP ·{' '}
          {totalHours} hrs total
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="th">Ticket</th>
                <th className="th">Title</th>
                <th className="th text-right">Story points</th>
                <th className="th text-right">Derived hours</th>
                <th className="th">Project</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.key}>
                  <td className="td font-mono text-[13.5px]">{t.key}</td>
                  <td className="td">{t.title}</td>
                  <td className="td td-num">{t.storyPoints}</td>
                  <td className="td td-num">{t.storyPoints * spConversionRate}</td>
                  <td className="td">
                    <span className="mr-2.5">{projectById[t.projectId]?.name}</span>
                    <Badge variant={projectById[t.projectId]?.type} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
