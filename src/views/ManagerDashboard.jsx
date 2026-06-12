import { useState } from 'react'
import { useApp } from '../context/AppContext'
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
    <div className="stagger space-y-10">
      <PageHeader
        eyebrow={`Allocation · Week of ${formatWeek(week)}`}
        title="Manager Dashboard"
        subtext={
          <span className="font-mono text-[13px]">
            {confirmedCount} of {employees.length} confirmed
          </span>
        }
        actions={
          <button className="btn-primary" onClick={() => onNavigate('report')}>
            View Monthly Report
          </button>
        }
      />

      <section>
        <h2 className="section-title">Team allocation</h2>
        <p className="mt-1 text-xs text-txt-secondary">
          Manager-set intent split per person. Each row must total 100%.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="th">Name</th>
                {activeProjects.map((p) => (
                  <th key={p.id} className="th text-right">
                    <span className="mr-2">{p.name}</span>
                    <Badge variant={p.type} />
                  </th>
                ))}
                <th className="th text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => {
                const total = rowTotal(e.id)
                const invalid = total !== 100
                return (
                  <tr key={e.id}>
                    <td className="td font-medium">{e.name}</td>
                    {activeProjects.map((p) => (
                      <td key={p.id} className="td text-right">
                        <AllocationInput
                          value={allocationFor(e.id, p.id)}
                          invalid={invalid}
                          label={`${e.name} — ${p.name} allocation`}
                          onChange={(v) => setAllocation(e.id, p.id, v)}
                        />
                      </td>
                    ))}
                    <td className={`td td-num font-medium ${invalid ? 'text-[#C2410C]' : ''}`}>
                      <span className="block leading-tight">{total}%</span>
                      {invalid && (
                        <span className="block text-[10px] leading-tight text-[#C2410C]">
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
      </section>

      <section>
        <h2 className="section-title">Set team allocation</h2>
        <p className="mt-1 text-xs text-txt-secondary">
          Push a default percentage split to every team member at once.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-6">
          {activeProjects.map((p) => (
            <label key={p.id} className="flex flex-col gap-2">
              <span className="eyebrow">{p.name}</span>
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
              <span className="font-mono text-xs text-[#C2410C]">
                Split totals {teamSplitTotal}% — must equal 100%
              </span>
            ) : applied ? (
              <span className="font-mono text-xs text-brand-green">
                Applied to all {employees.length} team members
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <section>
        <h2 className="section-title">Weekly confirmation status</h2>
        <p className="mt-1 text-xs text-txt-secondary">
          Who has responded to the week of {formatWeek(week)} confirmation prompt.
        </p>
        <ul className="mt-4 border-t-[1.5px] border-txt-primary">
          {employees.map((e) => {
            const conf = confirmationFor(e.id)
            const status = statusFor(e.id)
            return (
              <li
                key={e.id}
                className="flex min-h-[56px] items-center justify-between gap-4 border-b border-hairline"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center bg-ink font-mono text-[11px] text-paper">
                    {initials(e.name)}
                  </span>
                  <span className="w-40 text-sm font-medium">{e.name}</span>
                  <Badge variant={status} />
                </div>
                {hasActivity(e.id) ? (
                  <span className="font-mono text-xs text-txt-tertiary">
                    {conf?.confirmed
                      ? `${status === 'exception' ? 'Adjusted and confirmed' : 'Confirmed'} · ${formatTime(conf.timestamp)}`
                      : 'No response yet'}
                  </span>
                ) : (
                  <span className="text-xs italic text-txt-tertiary">
                    No Jira activity recorded this week
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
