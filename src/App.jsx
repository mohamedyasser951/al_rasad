import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { ProtectedRoute } from './auth/ProtectedRoute'
import DashboardLayout from './components/layout/DashboardLayout'
import DailyWorkPage from './pages/DailyWorkPage'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import ReportsPage from './pages/ReportsPage'
import ContractorsPage from './pages/ContractorsPage'
import UsersPage from './pages/UsersPage'
import SettingsPage from './pages/SettingsPage'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/daily-work" element={<DailyWorkPage />} />
          <Route path="/contractors" element={<ContractorsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
