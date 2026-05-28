import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from '@/app/landing/LandingPage'
import LoginPage from '@/app/auth/LoginPage'
import DashboardPage from '@/app/dashboard/DashboardPage'
import AdminPage from '@/app/admin/AdminPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
