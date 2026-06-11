import { createContext, useContext, useMemo, useState } from 'react'
import * as seed from '../data/mockData'

const AppContext = createContext(null)

// Round percentages so they always sum to exactly 100 (largest-remainder method).
export function roundToHundred(values) {
  const floors = values.map(Math.floor)
  let remainder = 100 - floors.reduce((a, b) => a + b, 0)
  const order = values
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac)
  for (let k = 0; k < order.length && remainder > 0; k++, remainder--) {
    floors[order[k].i] += 1
  }
  return floors
}

export function AppProvider({ children }) {
  const [projects, setProjects] = useState(seed.projects)
  const [employees, setEmployees] = useState(seed.employees)
  const [managerAllocations, setManagerAllocations] = useState(seed.managerAllocations)
  const [weeklyActivity] = useState(seed.weeklyActivity)
  const [confirmations, setConfirmations] = useState(seed.confirmations)
  const [spConversionRate, setSpConversionRate] = useState(seed.spConversionRate)

  const week = seed.currentWeekOf()

  const helpers = useMemo(() => {
    const projectById = Object.fromEntries(projects.map((p) => [p.id, p]))

    // projectId → hours for one employee's current-week tickets
    function derivedHours(employeeId) {
      const activity = weeklyActivity.find((a) => a.employeeId === employeeId)
      const hours = {}
      if (!activity) return hours
      for (const t of activity.tickets) {
        hours[t.projectId] = (hours[t.projectId] || 0) + t.storyPoints * spConversionRate
      }
      return hours
    }

    function totalDerivedHours(employeeId) {
      return Object.values(derivedHours(employeeId)).reduce((a, b) => a + b, 0)
    }

    // Jira-derived percentage split, guaranteed to sum to 100
    function derivedSplit(employeeId) {
      const hours = derivedHours(employeeId)
      const ids = projects.filter((p) => p.active).map((p) => p.id)
      const total = ids.reduce((sum, id) => sum + (hours[id] || 0), 0)
      if (total === 0) return ids.map((id) => ({ projectId: id, percentage: 0 }))
      const raw = ids.map((id) => ((hours[id] || 0) / total) * 100)
      const rounded = roundToHundred(raw)
      return ids.map((id, i) => ({ projectId: id, percentage: rounded[i] }))
    }

    function confirmationFor(employeeId) {
      return confirmations.find((c) => c.employeeId === employeeId && c.week === week) || null
    }

    // Allocation used for reporting: confirmed split if present, otherwise Jira-derived
    function effectiveSplit(employeeId) {
      const conf = confirmationFor(employeeId)
      if (conf?.confirmed) return conf.adjustedAllocations
      return derivedSplit(employeeId)
    }

    function confirm(employeeId, allocations, adjusted) {
      setConfirmations((prev) => [
        ...prev.filter((c) => !(c.employeeId === employeeId && c.week === week)),
        {
          employeeId,
          week,
          confirmed: true,
          adjusted,
          adjustedAllocations: allocations,
          timestamp: new Date().toISOString(),
        },
      ])
    }

    function setAllocation(employeeId, projectId, percentage) {
      setManagerAllocations((prev) => {
        const next = prev.filter(
          (a) => !(a.employeeId === employeeId && a.projectId === projectId)
        )
        return [...next, { employeeId, projectId, percentage }]
      })
    }

    function applyTeamSplit(split) {
      // split: [{ projectId, percentage }] applied to every employee
      setManagerAllocations(
        employees.flatMap((e) =>
          split.map(({ projectId, percentage }) => ({
            employeeId: e.id,
            projectId,
            percentage,
          }))
        )
      )
    }

    function updateProject(projectId, patch) {
      setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, ...patch } : p)))
    }

    function updateRate(employeeId, loadedRate) {
      setEmployees((prev) =>
        prev.map((e) => (e.id === employeeId ? { ...e, loadedRate } : e))
      )
    }

    return {
      projectById,
      derivedHours,
      totalDerivedHours,
      derivedSplit,
      confirmationFor,
      effectiveSplit,
      confirm,
      setAllocation,
      applyTeamSplit,
      updateProject,
      updateRate,
    }
  }, [projects, employees, weeklyActivity, confirmations, spConversionRate, week])

  const value = {
    projects,
    employees,
    managerAllocations,
    weeklyActivity,
    confirmations,
    spConversionRate,
    setSpConversionRate,
    week,
    ...helpers,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
