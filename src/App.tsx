import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import NewSubscriptionPage from './pages/NewSubscriptionPage'
import SubscriptionDetailPage from './pages/SubscriptionDetailPage'
import EventDetailPage from './pages/EventDetailPage'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes — redirect to /login if not authenticated */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/subscriptions/new" element={<ProtectedRoute><NewSubscriptionPage /></ProtectedRoute>} />
      <Route path="/subscriptions/:id" element={<ProtectedRoute><SubscriptionDetailPage /></ProtectedRoute>} />
      <Route path="/subscriptions/:subscriptionId/events/:eventId" element={<ProtectedRoute><EventDetailPage /></ProtectedRoute>} />

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
