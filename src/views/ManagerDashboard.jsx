import { useState } from 'react'
import { useApp } from '../context/AppContext'
import Card from '../components/Card'
import Badge from '../components/Badge'
import AllocationInput from '../components/AllocationInput'

function formatWeek(week) {
  const [y, m, d] = week.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(iso) {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function ManagerDashboard({ onNavigate }) {
  const {
    projects,
    employees,
    managerAllocations,
    setAllocation,
    applyTeamSplit,
    confirmationFor,
    week,
  } = useApp()

  const activeProjects = projects.filter((p) => p.active)

  const [teamSplit, setTeamSplit] = useState(() =>
    Object.fromEntries(activeProjects.map((p, i) => [p.id, [50, 30, 20][i] ?? 0]))
  )
  const teamSplitTotal = activeProjects.reduce((sum, p) => sum + (teamSplit[p.id] || 0), 0)
  const [applied, setApplied] = useState(false)

  function allocationFor(employeeId, projectId) {
    return (
      managerAllocations.find(
        (a) => a.employeeId === employeeId && a.projectId === projectId
      )?.percentage ?? 0
    )
  }

  function rowTotal(employeeId) {
    return activeProjects.reduce((sum, p) => sum + allocationFor(employeeId, p.id), 0)
  }

  const confirmedCount = employees.filter((e) => confirmationFor(e.id)?.confirmed).length

  function statusFor(employeeId) {
    const conf = confirmationFor(employeeId)
    if (!conf?.confirmed) return 'pending'
    return conf.adjusted ? 'exception' : 'confirmed'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Manager Dashboard</h1>
          <p className="mt-1 text-xs font-medium text-gray-500">
            Week of {formatWeek(week)} · {confirmedCount} of {employees.length} confirmed
          </p>
        </div>
        <button className="btn-primary" onClick={() => onNavigate('report')}>
          View Monthly Report
        </button>
      </div>

      <Card
        title="Team allocation"
        subtitle="Manager-set intent split per person. Each row must total 100%."
      >
        <div className="overflow-x-auto">
          <table className="table-striped w-full border-collapse">
            <thead>
              <tr>
                <th className="th">Name</th>
                {activeProjects.map((p) => (
                  <th key={p.id} className="th text-center">
                    <span className="mr-1.5">{p.name}</span>
                    <Badge variant={p.type} />
                  </th>
                ))}
                <th className="th text-center">Total</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => {
                const total = rowTotal(e.id)
                const invalid = total !== 100
                return (
                  <tr key={e.id}>
                    <td className="td font-medium text-slate-800">{e.name}</td>
                    {activeProjects.map((p) => (
                      <td key={p.id} className="td text-center">
                        <AllocationInput
                          value={allocationFor(e.id, p.id)}
                          invalid={invalid}
                          label={`${e.name} — ${p.name} allocation`}
                          onChange={(v) => setAllocation(e.id, p.id, v)}
                        />
                      </td>
                    ))}
                    <td
                      className={`td text-center font-semibold ${
                        invalid ? 'text-red-600' : 'text-slate-800'
                      }`}
                    >
                      {total}%
                      {invalid && (
                        <span className="ml-1.5 align-middle text-xs font-medium text-red-500">
                          {total > 100 ? 'over' : 'under'}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card
        title="Set team allocation"
        subtitle="Push a default percentage split to every team member at once."
      >
        <div className="flex flex-wrap items-end gap-5">
          {activeProjects.map((p) => (
            <label key={p.id} className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-gray-500">{p.name}</span>
              <AllocationInput
                value={teamSplit[p.id] || 0}
                invalid={teamSplitTotal !== 100}
                label={`Default split — ${p.name}`}
                onChange={(v) => {
                  setApplied(false)
                  setTeamSplit((prev) => ({ ...prev, [p.id]: v }))
                }}
              />
            </label>
          ))}
          <div className="flex items-center gap-3">
            <button
              className="btn-secondary"
              disabled={teamSplitTotal !== 100}
              onClick={() => {
                applyTeamSplit(
                  activeProjects.map((p) => ({
                    projectId: p.id,
                    percentage: teamSplit[p.id] || 0,
                  }))
                )
                setApplied(true)
              }}
            >
              Apply to whole team
            </button>
            {teamSplitTotal !== 100 ? (
              <span className="text-xs font-medium text-red-500">
                Split totals {teamSplitTotal}% — must equal 100%
              </span>
            ) : applied ? (
              <span className="text-xs font-medium text-green-700">
                Applied to all {employees.length} team members
              </span>
            ) : null}
          </div>
        </div>
      </Card>

      <Card
        title="Weekly confirmation status"
        subtitle={`Who has responded to the week of ${formatWeek(week)} confirmation prompt.`}
      >
        <ul className="divide-y divide-slate-100">
          {employees.map((e) => {
            const conf = confirmationFor(e.id)
            const status = statusFor(e.id)
            return (
              <li key={e.id} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-3">
                  <span className="w-40 text-sm font-medium text-slate-800">{e.name}</span>
                  <Badge variant={status} />
                </div>
                <span className="text-xs font-medium text-gray-500">
                  {conf?.confirmed
                    ? `${status === 'exception' ? 'Adjusted and confirmed' : 'Confirmed'} · ${formatTime(conf.timestamp)}`
                    : 'No response yet'}
                </span>
              </li>
            )
          })}
        </ul>
      </Card>
    </div>
  )
}
