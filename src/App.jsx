import { Navigate, Route, Routes } from 'react-router-dom'
import DashboardLayout from './components/layout/DashboardLayout'
import DailyWorkPage from './pages/DailyWorkPage'
import DashboardPage from './pages/DashboardPage'
import ReportsPage from './pages/ReportsPage'

function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/daily-work" element={<DailyWorkPage />} />
      </Route>
    </Routes>
  )
}

export default App
