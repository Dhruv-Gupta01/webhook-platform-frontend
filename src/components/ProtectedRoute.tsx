import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'

// Wraps any route that requires authentication.
// If not logged in, redirects to /login.
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}
