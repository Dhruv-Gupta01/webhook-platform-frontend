import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { login } from '../api/auth'
import { useAuthStore } from '../store/auth.store'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [form, setForm] = useState({ email: '', password: '' })
  const [focused, setFocused] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken)
      toast.success('Welcome back!')
      navigate('/dashboard')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? 'Login failed')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(form)
  }

  const inputStyle = (field: string) => ({
    font: '400 13px var(--font-sans)',
    color: 'var(--fg)',
    background: 'var(--surface)',
    border: `1px solid ${focused === field ? 'var(--accent)' : 'var(--border-strong)'}`,
    borderRadius: 'var(--radius-md)',
    padding: '8px 12px',
    outline: 'none',
    boxShadow: focused === field ? '0 0 0 3px var(--accent-soft)' : 'none',
    transition: 'all 150ms var(--ease-out)',
    width: '100%',
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: 32,
        width: '100%',
        maxWidth: 400,
        boxShadow: 'var(--shadow-2)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 24 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 'var(--radius-md)',
            background: 'var(--accent)', display: 'grid', placeItems: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
              <path d="M2 7C2 4.24 4.24 2 7 2s5 2.24 5 5-2.24 5-5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M7 10l2.5-2.5L7 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ font: '600 18px var(--font-sans)', color: 'var(--fg)', letterSpacing: '-0.01em' }}>WebhookHub</span>
        </div>

        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 24, letterSpacing: '-0.02em',
          color: 'var(--fg)', textAlign: 'center',
          margin: '0 0 6px', fontWeight: 400,
        }}>
          Sign in to your account
        </h2>
        <p style={{ font: '13px var(--font-sans)', color: 'var(--fg-3)', textAlign: 'center', margin: '0 0 24px' }}>
          Welcome back.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ font: '500 12px var(--font-sans)', color: 'var(--fg-2)' }}>Email</label>
            <input
              type="email" required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
              placeholder="you@example.com"
              style={inputStyle('email')}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ font: '500 12px var(--font-sans)', color: 'var(--fg-2)' }}>Password</label>
            <input
              type="password" required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused(null)}
              placeholder="••••••••"
              style={inputStyle('password')}
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 6, cursor: mutation.isPending ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 13,
              borderRadius: 'var(--radius-md)', border: '1px solid transparent',
              padding: '10px 14px', marginTop: 4,
              background: 'var(--accent)', color: 'var(--fg-on-accent)',
              opacity: mutation.isPending ? 0.6 : 1,
              transition: 'all 150ms var(--ease-out)',
            }}
            onMouseEnter={(e) => { if (!mutation.isPending) e.currentTarget.style.background = 'var(--accent-hover)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)' }}
          >
            {mutation.isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p style={{ textAlign: 'center', font: '13px var(--font-sans)', color: 'var(--fg-3)', marginTop: 18 }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 500, textDecoration: 'none' }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
