import { useApp } from '../context/AppContext'
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
      className={`relative inline-flex h-5 w-9 shrink-0 items-center transition-colors duration-100 ${
        checked ? 'bg-ink' : 'bg-hairline'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform bg-white shadow transition-transform ${
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
    <div className="stagger space-y-10">
      <PageHeader
        eyebrow="Configuration"
        title="Admin"
        subtext="Configuration changes apply immediately across the app, including Report totals."
      />

      <section>
        <h2 className="section-title">Project registry</h2>
        <p className="mt-1 text-xs text-txt-secondary">
          Active projects available for allocation. CapEx/OpEx classification drives report
          categorization.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse">
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
                  <td className="td font-medium">{p.name}</td>
                  <td className="td">
                    <div className="inline-flex items-center gap-3">
                      <div
                        className="inline-flex overflow-hidden rounded-[2px] border border-txt-primary"
                        role="group"
                        aria-label={`${p.name} classification`}
                      >
                        {['capex', 'opex'].map((type) => (
                          <button
                            key={type}
                            type="button"
                            aria-pressed={p.type === type}
                            onClick={() => updateProject(p.id, { type })}
                            className={`px-3 py-1.5 text-xs font-medium transition-colors duration-100 ${
                              p.type === type
                                ? 'bg-ink text-paper'
                                : 'bg-white text-txt-secondary hover:text-txt-primary'
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
      </section>

      <section>
        <h2 className="section-title">Story point conversion</h2>
        <p className="mt-1 text-xs text-txt-secondary">
          Hours of effort assumed per Jira story point. Drives every derived-hours figure in
          the app.
        </p>
        <label className="mt-5 flex flex-col gap-2">
          <input
            type="number"
            min="0.5"
            step="0.5"
            className="input-ledger h-auto w-24 px-1 py-1 text-left text-[32px] font-medium leading-none"
            value={spConversionRate}
            aria-label="Hours per story point"
            onChange={(e) => {
              const n = Number(e.target.value)
              setSpConversionRate(Number.isNaN(n) || n <= 0 ? 0.5 : n)
            }}
          />
          <span className="eyebrow">Hours per story point</span>
        </label>
      </section>

      <section>
        <h2 className="section-title">Loaded labor rates</h2>
        <p className="mt-1 text-xs text-txt-secondary">
          Fully loaded hourly cost per team member. Used to compute CapEx and OpEx dollars in
          the Monthly Report.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full max-w-xl border-collapse">
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
                  <td className="td font-medium">{e.name}</td>
                  <td className="td td-num">
                    <span className="mr-0.5 font-mono text-xs text-txt-tertiary">$</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      className="input-ledger w-20 text-right"
                      value={e.loadedRate}
                      aria-label={`${e.name} loaded hourly rate`}
                      onChange={(ev) => {
                        const n = Number(ev.target.value)
                        updateRate(e.id, Number.isNaN(n) || n < 0 ? 0 : n)
                      }}
                    />
                    <span className="ml-1 font-mono text-xs text-txt-tertiary">/hr</span>
                  </td>
                  <td className="td td-num text-txt-tertiary">
                    {usd.format(e.loadedRate * 2080)}
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
