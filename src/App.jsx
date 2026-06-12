import { useState } from 'react'
import { AppProvider } from './context/AppContext'
import Nav from './components/Nav'
import ManagerDashboard from './views/ManagerDashboard'
import EmployeeView from './views/EmployeeView'
import ReportView from './views/ReportView'
import AdminView from './views/AdminView'

export default function App() {
  const [tab, setTab] = useState('manager')

  return (
    <AppProvider>
      <div className="min-h-screen bg-paper min-[900px]:flex">
        <Nav tab={tab} onChange={setTab} />
        <main className={`min-h-screen min-w-0 flex-1 ${tab === 'report' ? 'bg-ink' : 'bg-paper'}`}>
          <div
            key={tab}
            className={
              tab === 'report'
                ? 'px-8 py-10'
                : 'mx-auto max-w-[1240px] px-8 py-10 min-[900px]:px-14 min-[900px]:py-12'
            }
          >
            {tab === 'manager' && <ManagerDashboard onNavigate={setTab} />}
            {tab === 'employee' && <EmployeeView />}
            {tab === 'report' && <ReportView />}
            {tab === 'admin' && <AdminView />}
          </div>
        </main>
      </div>
    </AppProvider>
  )
}
