import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'
import { LayoutDashboard, LogOut, Settings, ChevronDown } from 'lucide-react'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    if (menuOpen) document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [menuOpen])

  const initial = ((user?.name || user?.email) ?? 'U')[0].toUpperCase()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Top nav */}
      <nav style={{
        height: 'var(--nav-height)',
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(16px) saturate(1.1)',
        WebkitBackdropFilter: 'blur(16px) saturate(1.1)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        {/* Logo */}
        <Link to="/dashboard" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          textDecoration: 'none',
          font: '600 15px var(--font-sans)',
          color: 'var(--fg)',
          letterSpacing: '-0.01em',
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 'var(--radius-md)',
            background: 'var(--accent)', display: 'grid', placeItems: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7C2 4.24 4.24 2 7 2s5 2.24 5 5-2.24 5-5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M7 10l2.5-2.5L7 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          WebhookHub
        </Link>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <NavLink to="/dashboard" icon={<LayoutDashboard size={14} />} label="Dashboard" />

          {/* Avatar dropdown */}
          <div ref={menuRef} style={{ position: 'relative', marginLeft: 8 }}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 8px 4px 4px',
                background: menuOpen ? 'var(--surface-2)' : 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer',
                transition: 'all 150ms var(--ease-out)',
              }}
            >
              <span style={{
                width: 24, height: 24, borderRadius: '50%',
                background: 'var(--accent-soft)', color: 'var(--accent-soft-fg)',
                display: 'grid', placeItems: 'center',
                font: '600 11px var(--font-sans)',
              }}>
                {initial}
              </span>
              <ChevronDown size={12} color="var(--fg-3)" />
            </button>

            {menuOpen && (
              <div className="wh-fade-in" style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0, minWidth: 220,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-2)',
                padding: 6,
                zIndex: 100,
              }}>
                {/* User info */}
                <div style={{ padding: '8px 10px 10px', borderBottom: '1px solid var(--border)', marginBottom: 6 }}>
                  <div style={{ font: '500 13px var(--font-sans)', color: 'var(--fg)' }}>{user?.name || 'Account'}</div>
                  <div style={{ font: '11px var(--font-mono)', color: 'var(--fg-3)', marginTop: 2 }}>{user?.email}</div>
                </div>

                <DropdownItem icon={<Settings size={14} />} label="Account settings" onClick={() => setMenuOpen(false)} />

                <div style={{ height: 1, background: 'var(--border)', margin: '6px 0' }} />

                <DropdownItem
                  icon={<LogOut size={14} />}
                  label="Sign out"
                  onClick={() => { setMenuOpen(false); handleLogout() }}
                  danger
                />
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: '32px 24px' }}>
        {children}
      </main>
    </div>
  )
}

function NavLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link to={to} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      font: '500 13px var(--font-sans)', color: 'var(--fg-2)',
      textDecoration: 'none',
      padding: '6px 10px',
      borderRadius: 'var(--radius-md)',
      transition: 'all 150ms var(--ease-out)',
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--surface-2)'
        e.currentTarget.style.color = 'var(--fg)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.color = 'var(--fg-2)'
      }}
    >
      {icon} {label}
    </Link>
  )
}

function DropdownItem({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 8, width: '100%',
        padding: '7px 10px', background: 'transparent', border: 'none',
        font: '500 13px var(--font-sans)', color: danger ? 'var(--danger)' : 'var(--fg-2)',
        cursor: 'pointer', borderRadius: 'var(--radius-md)',
        transition: 'all 150ms var(--ease-out)',
        textAlign: 'left',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = danger ? 'var(--danger-soft)' : 'var(--surface-2)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
    >
      {icon} {label}
    </button>
  )
}
