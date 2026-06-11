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
      <div className="min-h-screen bg-white">
        <Nav tab={tab} onChange={setTab} />
        <main className="mx-auto max-w-[1100px] px-6 py-8">
          {tab === 'manager' && <ManagerDashboard onNavigate={setTab} />}
          {tab === 'employee' && <EmployeeView />}
          {tab === 'report' && <ReportView />}
          {tab === 'admin' && <AdminView />}
        </main>
      </div>
    </AppProvider>
  )
}
