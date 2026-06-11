import { useState } from 'react'
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

function formatTime(iso) {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function initials(name) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

const STATUS_BORDER = {
  confirmed: 'border-l-brand-green',
  pending: 'border-l-amber-500',
  exception: 'border-l-orange-500',
}

export default function ManagerDashboard({ onNavigate }) {
  const {
    projects,
    employees,
    managerAllocations,
    setAllocation,
    applyTeamSplit,
    confirmationFor,
    weeklyActivity,
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

  function hasActivity(employeeId) {
    return (weeklyActivity.find((a) => a.employeeId === employeeId)?.tickets ?? []).length > 0
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manager Dashboard"
        subtext={
          <span className="flex flex-wrap items-center gap-2">
            Week of {formatWeek(week)}
            <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
              {confirmedCount} of {employees.length} confirmed
            </span>
          </span>
        }
        actions={
          <button className="btn-primary" onClick={() => onNavigate('report')}>
            View Monthly Report
          </button>
        }
      />

      <Card
        accent="teal"
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
                        invalid ? 'text-red-600' : 'text-slate-900'
                      }`}
                    >
                      <span className="block">{total}%</span>
                      {invalid && (
                        <span className="block text-[10px] font-medium leading-tight text-red-500">
                          ≠ 100
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
        accent="teal"
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
        accent="teal"
        title="Weekly confirmation status"
        subtitle={`Who has responded to the week of ${formatWeek(week)} confirmation prompt.`}
      >
        <ul>
          {employees.map((e) => {
            const conf = confirmationFor(e.id)
            const status = statusFor(e.id)
            return (
              <li
                key={e.id}
                className={`flex min-h-[48px] items-center justify-between gap-4 border-b border-l-[3px] border-b-slate-100 pl-3 last:border-b-0 ${STATUS_BORDER[status]}`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-500">
                    {initials(e.name)}
                  </span>
                  <span className="w-40 text-sm font-medium text-slate-800">{e.name}</span>
                  <Badge variant={status} />
                </div>
                {hasActivity(e.id) ? (
                  <span className="text-xs text-slate-400">
                    {conf?.confirmed
                      ? `${status === 'exception' ? 'Adjusted and confirmed' : 'Confirmed'} · ${formatTime(conf.timestamp)}`
                      : 'No response yet'}
                  </span>
                ) : (
                  <span className="text-xs italic text-slate-400">
                    No Jira activity recorded this week
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      </Card>
    </div>
  )
}
