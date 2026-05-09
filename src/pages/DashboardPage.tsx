import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Webhook, Activity, XCircle, ExternalLink, Trash2, Plus } from 'lucide-react'
import { getSubscriptions, cancelSubscription, deleteSubscription } from '../api/subscriptions'
import { useAuthStore } from '../store/auth.store'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import type { WebhookSubscription } from '../types'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: getSubscriptions,
  })

  const cancelMutation = useMutation({
    mutationFn: cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      toast.success('Subscription cancelled')
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Failed to cancel'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      toast.success('Subscription deleted')
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Failed to delete'),
  })

  const active = subscriptions.filter((s) => s.isActive).length
  const inactive = subscriptions.length - active

  return (
    <Layout>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, gap: 16 }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 36, lineHeight: 1.1,
            letterSpacing: '-0.02em',
            color: 'var(--fg)', margin: 0, fontWeight: 400,
          }}>
            Welcome back, {user?.name || user?.email?.split('@')[0]} 👋
          </h1>
          <p style={{ font: '13px var(--font-sans)', color: 'var(--fg-3)', margin: '6px 0 0' }}>
            Manage your webhook subscriptions.
          </p>
        </div>
        <PrimaryButton to="/subscriptions/new" icon={<Plus size={14} />}>
          New subscription
        </PrimaryButton>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard icon={<Webhook size={18} />} label="Total" value={subscriptions.length} tint="indigo" />
        <StatCard icon={<Activity size={18} />} label="Active" value={active} tint="green" />
        <StatCard icon={<XCircle size={18} />} label="Cancelled" value={inactive} tint="red" />
      </div>

      {/* List */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '64px 0', font: '13px var(--font-sans)', color: 'var(--fg-3)' }}>
          Loading…
        </div>
      ) : subscriptions.length === 0 ? (
        <EmptyState />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {subscriptions.map((sub) => (
            <SubRow
              key={sub.id}
              sub={sub}
              onCancel={() => { if (confirm('Cancel this subscription?')) cancelMutation.mutate(sub.id) }}
              onDelete={() => { if (confirm('Permanently delete this subscription and all its events?')) deleteMutation.mutate(sub.id) }}
            />
          ))}
        </div>
      )}
    </Layout>
  )
}

function StatCard({ icon, label, value, tint }: { icon: React.ReactNode; label: string; value: number; tint: 'indigo' | 'green' | 'red' }) {
  const tints = {
    indigo: { bg: 'var(--accent-soft)',   fg: 'var(--accent)' },
    green:  { bg: 'var(--success-soft)',  fg: 'var(--success)' },
    red:    { bg: 'var(--danger-soft)',   fg: 'var(--danger)' },
  }
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: 18,
      display: 'flex', alignItems: 'center', gap: 14,
      boxShadow: 'var(--shadow-1)',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 'var(--radius-md)',
        display: 'grid', placeItems: 'center',
        background: tints[tint].bg, color: tints[tint].fg,
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ font: '600 28px var(--font-display)', letterSpacing: '-0.02em', lineHeight: 1.1, color: 'var(--fg)' }}>
          {value}
        </div>
        <div style={{ font: '13px var(--font-sans)', color: 'var(--fg-3)', marginTop: 2 }}>{label}</div>
      </div>
    </div>
  )
}

function SubRow({ sub, onCancel, onDelete }: { sub: WebhookSubscription; onCancel: () => void; onDelete: () => void }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px',
        background: hover ? 'var(--surface-2)' : 'var(--surface)',
        border: `1px solid ${hover ? 'var(--border-strong)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        transition: 'all 150ms var(--ease-out)',
        boxShadow: 'var(--shadow-1)',
      }}
    >
      <span style={{
        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
        background: sub.isActive ? 'var(--success)' : 'var(--fg-muted)',
      }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ font: '500 14px var(--font-sans)', color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {sub.name}
          </span>
          {!sub.isActive && <StatusBadge status="cancelled" withDot={false} />}
        </div>
        <div style={{ font: '12px var(--font-mono)', color: 'var(--fg-3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {sub.sourceUrl}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <Link
          to={`/subscriptions/${sub.id}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, font: '500 12px var(--font-sans)', color: 'var(--accent)', textDecoration: 'none' }}
        >
          <ExternalLink size={13} /> View events
        </Link>
        {sub.isActive && (
          <SecondaryButton size="sm" onClick={onCancel}>Cancel</SecondaryButton>
        )}
        <button
          onClick={onDelete}
          style={{ background: 'transparent', border: 0, padding: 6, color: 'var(--fg-3)', cursor: 'pointer', borderRadius: 'var(--radius-sm)', transition: 'all 150ms var(--ease-out)', display: 'grid', placeItems: 'center' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'var(--danger-soft)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--fg-3)'; e.currentTarget.style.background = 'transparent' }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px dashed var(--border-strong)',
      borderRadius: 'var(--radius-lg)',
      padding: '48px 20px',
      textAlign: 'center',
    }}>
      <div style={{ color: 'var(--fg-muted)', marginBottom: 14, display: 'flex', justifyContent: 'center' }}>
        <Webhook size={36} />
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, letterSpacing: '-0.02em', color: 'var(--fg)' }}>
        No subscriptions yet
      </div>
      <div style={{ font: '13px var(--font-sans)', color: 'var(--fg-3)', marginTop: 6 }}>
        Create your first webhook subscription to get started.
      </div>
      <div style={{ marginTop: 18 }}>
        <PrimaryButton to="/subscriptions/new" icon={<Plus size={14} />}>
          New subscription
        </PrimaryButton>
      </div>
    </div>
  )
}

function PrimaryButton({ to, icon, children }: { to: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '8px 14px',
        background: 'var(--accent)', color: 'var(--fg-on-accent)',
        font: '500 13px var(--font-sans)',
        borderRadius: 'var(--radius-md)', border: '1px solid transparent',
        textDecoration: 'none',
        transition: 'all 150ms var(--ease-out)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-hover)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)' }}
    >
      {icon}{children}
    </Link>
  )
}

function SecondaryButton({ size = 'md', onClick, children }: { size?: 'sm' | 'md'; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: size === 'sm' ? '5px 10px' : '8px 14px',
        fontSize: size === 'sm' ? 12 : 13,
        background: 'var(--surface)', color: 'var(--fg)',
        font: `500 ${size === 'sm' ? 12 : 13}px var(--font-sans)`,
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-strong)',
        cursor: 'pointer',
        transition: 'all 150ms var(--ease-out)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-2)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface)' }}
    >
      {children}
    </button>
  )
}
