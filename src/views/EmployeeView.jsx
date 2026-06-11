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
    <div className="space-y-6">
      <PageHeader
        title={`Week of ${formatWeek(week)}`}
        subtext={
          <>
            Here&rsquo;s your estimated allocation, derived from Jira activity at{' '}
            {spConversionRate} hrs per story point.
          </>
        }
        actions={
          <label className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Viewing as</span>
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
        <div className="flex items-start justify-between gap-4 rounded-lg border border-green-200 bg-green-50 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-green-800">
              {employee.name} confirmed this week&rsquo;s allocation
              {confirmation.adjusted ? ' with adjustments' : ''}
            </p>
            <p className="mt-1 text-xs font-medium text-green-700">
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
          <Badge variant={confirmation.adjusted ? 'exception' : 'confirmed'} />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {activeProjects.map((p) => {
          const h = hours[p.id] || 0
          const pct = split.find((s) => s.projectId === p.id)?.percentage || 0
          return (
            <Card key={p.id} accent={p.type} className="relative">
              <span className="absolute right-4 top-4">
                <Badge variant={p.type} />
              </span>
              <h2 className="text-base font-semibold text-slate-800">{p.name}</h2>
              <p className="mt-3 text-4xl font-bold text-slate-900">
                {h}{' '}
                <span className="text-[13px] font-normal text-slate-500">hrs est.</span>
              </p>
              <p className="mt-1 text-[13px] text-slate-500">{pct}% of your week</p>
            </Card>
          )
        })}
      </div>

      <Card
        accent="teal"
        title="Confirm your split"
        subtitle="Pre-populated from your Jira activity. Adjust if it doesn't match reality — must total 100%."
      >
        <div className="flex flex-wrap items-end gap-5">
          {activeProjects.map((p) => (
            <label key={p.id} className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-gray-500">{p.name}</span>
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
              className={`text-sm font-semibold ${
                total === 100 ? 'text-slate-900' : 'text-red-600'
              }`}
            >
              Total {total}%
            </span>
            {total !== 100 && (
              <span className="text-[10px] font-medium text-red-500">≠ 100</span>
            )}
          </div>
        </div>

        {!confirmation?.confirmed && (
          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
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
              <span className="text-xs font-medium text-gray-500">
                Your adjustments will be flagged for manager review.
              </span>
            )}
          </div>
        )}
      </Card>

      <Card
        accent="teal"
        title="Jira activity this week"
        subtitle={`Read-only context · story points convert at ${spConversionRate} hrs/SP · ${totalHours} hrs total`}
      >
        <div className="overflow-x-auto">
          <table className="table-striped w-full border-collapse">
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
                  <td className="td">
                    <span className="ticket-key">{t.key}</span>
                  </td>
                  <td className="td">{t.title}</td>
                  <td className="td text-right">{t.storyPoints}</td>
                  <td className="td text-right">{t.storyPoints * spConversionRate}</td>
                  <td className="td">
                    <span className="mr-2">{projectById[t.projectId]?.name}</span>
                    <Badge variant={projectById[t.projectId]?.type} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
