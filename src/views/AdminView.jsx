import { useApp } from '../context/AppContext'
import Card from '../components/Card'
import Badge from '../components/Badge'
import PageHeader from '../components/PageHeader'

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-150 ${
        checked ? 'bg-brand-teal' : 'bg-slate-300'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-[18px]' : 'translate-x-[3px]'
        }`}
      />
    </button>
  )
}

export default function AdminView() {
  const {
    projects,
    employees,
    spConversionRate,
    setSpConversionRate,
    updateProject,
    updateRate,
  } = useApp()

  const usd = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin"
        subtext="Configuration changes apply immediately across the app, including Report totals."
      />

      <Card
        accent="teal"
        title="Project registry"
        subtitle="Active projects available for allocation. CapEx/OpEx classification drives report categorization."
      >
        <div className="overflow-x-auto">
          <table className="table-striped w-full border-collapse">
            <thead>
              <tr>
                <th className="th">Project</th>
                <th className="th">Classification</th>
                <th className="th">Owning epic</th>
                <th className="th text-center">Active</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} className={p.active ? '' : 'opacity-60'}>
                  <td className="td font-medium text-slate-800">{p.name}</td>
                  <td className="td">
                    <div className="inline-flex items-center gap-2">
                      <div
                        className="inline-flex overflow-hidden rounded-md border border-gray-300"
                        role="group"
                        aria-label={`${p.name} classification`}
                      >
                        {['capex', 'opex'].map((type) => (
                          <button
                            key={type}
                            type="button"
                            aria-pressed={p.type === type}
                            onClick={() => updateProject(p.id, { type })}
                            className={`px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
                              p.type === type
                                ? 'bg-brand-teal text-white'
                                : 'bg-white text-gray-500 hover:text-slate-800'
                            }`}
                          >
                            {type === 'capex' ? 'CapEx' : 'OpEx'}
                          </button>
                        ))}
                      </div>
                      <Badge variant={p.type} />
                    </div>
                  </td>
                  <td className="td">
                    <input
                      type="text"
                      className="input w-72"
                      value={p.epic}
                      aria-label={`${p.name} owning epic`}
                      onChange={(e) => updateProject(p.id, { epic: e.target.value })}
                    />
                  </td>
                  <td className="td text-center">
                    <Toggle
                      checked={p.active}
                      label={`${p.name} active`}
                      onChange={(v) => updateProject(p.id, { active: v })}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card
        accent="teal"
        title="Story point conversion"
        subtitle="Hours of effort assumed per Jira story point. Drives every derived-hours figure in the app."
      >
        <label className="flex items-center gap-3">
          <input
            type="number"
            min="0.5"
            step="0.5"
            className="w-[72px] rounded-md border-2 border-brand-teal bg-white px-2 py-1.5 text-center text-2xl font-bold text-brand-teal transition-colors duration-150"
            value={spConversionRate}
            aria-label="Hours per story point"
            onChange={(e) => {
              const n = Number(e.target.value)
              setSpConversionRate(Number.isNaN(n) || n <= 0 ? 0.5 : n)
            }}
          />
          <span className="text-sm text-gray-700">hours per story point</span>
        </label>
      </Card>

      <Card
        accent="teal"
        title="Loaded labor rates"
        subtitle="Fully loaded hourly cost per team member. Used to compute CapEx and OpEx dollars in the Monthly Report."
      >
        <div className="overflow-x-auto">
          <table className="table-striped w-full max-w-xl border-collapse">
            <thead>
              <tr>
                <th className="th">Team member</th>
                <th className="th text-right">Loaded rate</th>
                <th className="th text-right">Annualized (2,080 hrs)</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e.id}>
                  <td className="td font-medium text-slate-800">{e.name}</td>
                  <td className="td text-right">
                    <div className="relative inline-flex items-center">
                      <span className="pointer-events-none absolute left-3 text-xs text-gray-400">
                        $
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        className="input w-28 pl-6 text-right"
                        value={e.loadedRate}
                        aria-label={`${e.name} loaded hourly rate`}
                        onChange={(ev) => {
                          const n = Number(ev.target.value)
                          updateRate(e.id, Number.isNaN(n) || n < 0 ? 0 : n)
                        }}
                      />
                    </div>
                    <span className="ml-1.5 text-xs text-gray-400">/hr</span>
                  </td>
                  <td className="td text-right font-semibold text-slate-900">
                    {usd.format(e.loadedRate * 2080)}
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
