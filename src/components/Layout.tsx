import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'
import { Webhook, LogOut, LayoutDashboard } from 'lucide-react'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-indigo-600 text-lg">
          <Webhook size={22} />
          WebhookHub
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-1 text-sm text-gray-600 hover:text-indigo-600">
            <LayoutDashboard size={16} /> Dashboard
          </Link>
          <span className="text-sm text-gray-500">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
