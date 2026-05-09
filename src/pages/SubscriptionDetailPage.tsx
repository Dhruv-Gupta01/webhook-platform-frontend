import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Copy, Check, Clock, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { getSubscription } from '../api/subscriptions'
import { getEvents } from '../api/events'
import { useEventStream } from '../hooks/useEventStream'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import type { SSEEventUpdate, WebhookEvent } from '../types'

const SAMPLE_EVENTS = [
  { type: 'payment.succeeded', source: 'Stripe', data: { id: 'evt_001', amount: 2999, currency: 'INR', customer: 'alice@example.com', status: 'succeeded' } },
  { type: 'push', source: 'GitHub', data: { ref: 'refs/heads/main', repository: 'myorg/my-repo', pusher: 'bob', commits: [{ id: 'abc123', message: 'Fix login bug' }] } },
  { type: 'order.created', source: 'Shopify', data: { orderId: 'ORD-1042', customer: 'charlie@example.com', items: [{ sku: 'TSHIRT-L', qty: 2, price: 799 }], total: 1598 } },
  { type: 'payment.failed', source: 'Stripe', data: { id: 'evt_002', amount: 499, currency: 'INR', customer: 'dave@example.com', reason: 'insufficient_funds' } },
  { type: 'user.signup', source: 'Custom', data: { userId: 'usr_9981', email: 'eve@example.com', plan: 'pro', signupSource: 'google_oauth' } },
]

export default function SubscriptionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [liveEvents, setLiveEvents] = useState<SSEEventUpdate[]>([])
  const [copiedEndpoint, setCopiedEndpoint] = useState(false)
  const [sending, setSending] = useState(false)

  const { data: sub, isLoading: subLoading } = useQuery({
    queryKey: ['subscription', id],
    queryFn: () => getSubscription(id!),
    enabled: !!id,
  })

  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['events', id, page],
    queryFn: () => getEvents(id!, page),
    enabled: !!id,
  })

  useEventStream(id!, (update) => {
    setLiveEvents((prev) => {
      const exists = prev.find((e) => e.eventId === update.eventId)
      if (exists) return prev.map((e) => (e.eventId === update.eventId ? update : e))
      return [update, ...prev]
    })
    queryClient.invalidateQueries({ queryKey: ['events', id] })
  })

  const copyEndpoint = () => {
    if (sub) {
      navigator.clipboard.writeText(sub.webhookEndpoint)
      setCopiedEndpoint(true)
      toast.success('Endpoint copied')
      setTimeout(() => setCopiedEndpoint(false), 2000)
    }
  }

  const sendTestEvent = async () => {
    if (!sub || sending) return
    setSending(true)
    const event = SAMPLE_EVENTS[Math.floor(Math.random() * SAMPLE_EVENTS.length)]
    try {
      const res = await fetch(sub.webhookEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-event-type': event.type },
        body: JSON.stringify(event.data),
      })
      const data = await res.json()
      if (data.received) {
        toast.success(`Sent ${event.type} event`)
      } else {
        toast(`Event filtered out (${event.type} not in filter)`, { icon: '🔕' })
      }
    } catch {
      toast.error('Failed to send test event')
    } finally {
      setSending(false)
    }
  }

  if (subLoading) return (
    <Layout>
      <div style={{ textAlign: 'center', padding: '64px 0', font: '13px var(--font-sans)', color: 'var(--fg-3)' }}>Loading…</div>
    </Layout>
  )
  if (!sub) return (
    <Layout>
      <div style={{ textAlign: 'center', padding: '64px 0', font: '13px var(--font-sans)', color: 'var(--fg-3)' }}>Subscription not found</div>
    </Layout>
  )

  return (
    <Layout>
      {/* Back */}
      <a
        onClick={() => navigate('/dashboard')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, font: '13px var(--font-sans)', color: 'var(--fg-3)', cursor: 'pointer', marginBottom: 18, textDecoration: 'none' }}
      >
        <ArrowLeft size={14} /> Dashboard
      </a>

      {/* Page title */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, lineHeight: 1.1, letterSpacing: '-0.02em', color: 'var(--fg)', margin: 0, fontWeight: 400 }}>
            {sub.name}
          </h1>
          <StatusBadge status={sub.isActive ? 'active' : 'cancelled'} withDot={false} />
        </div>
        <p style={{ font: '13px var(--font-mono)', color: 'var(--fg-3)', margin: '6px 0 0' }}>{sub.sourceUrl}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Subscription info */}
          <Card eyebrow="Subscription info">
            <InfoRow label="Callback URL" value={sub.callbackUrl} mono />
            <InfoRow label="Event filter" value={sub.events.length > 0 ? sub.events.join(', ') : 'All events'} />
            <InfoRow label="Created" value={new Date(sub.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} />
          </Card>

          {/* Webhook endpoint */}
          <Card eyebrow="Webhook endpoint">
            <p style={{ font: '12px var(--font-sans)', color: 'var(--fg-3)', margin: '0 0 10px' }}>
              Paste this URL into your source service.
            </p>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 10px',
            }}>
              <code style={{ flex: 1, font: '12px var(--font-mono)', color: 'var(--fg-2)', wordBreak: 'break-all' }}>
                {sub.webhookEndpoint}
              </code>
              <button
                onClick={copyEndpoint}
                style={{ background: 'transparent', border: 0, color: 'var(--fg-3)', cursor: 'pointer', padding: 4, flexShrink: 0, transition: 'color 150ms' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--fg-3)' }}
              >
                {copiedEndpoint ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </Card>

          {/* Send test event */}
          <Card eyebrow="Quick test">
            <p style={{ font: '12px var(--font-sans)', color: 'var(--fg-3)', margin: '0 0 12px' }}>
              Fire a sample webhook event to test your setup. Picks a random event type (Stripe, GitHub, Shopify, etc).
            </p>
            <button
              onClick={sendTestEvent}
              disabled={sending || !sub.isActive}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '10px 0',
                background: sending ? 'var(--surface-2)' : 'var(--accent)',
                color: sending ? 'var(--fg-3)' : '#fff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                font: '600 13px var(--font-sans)',
                cursor: sending || !sub.isActive ? 'not-allowed' : 'pointer',
                transition: 'opacity 150ms',
                opacity: !sub.isActive ? 0.5 : 1,
              }}
            >
              <Zap size={14} />
              {sending ? 'Sending…' : 'Send test event'}
            </button>
          </Card>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Live event feed */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span className="wh-pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--live)', flexShrink: 0 }} />
              <h3 style={{ font: '600 14px var(--font-sans)', color: 'var(--fg)', margin: 0 }}>Live event feed</h3>
              <span style={{ font: '11px var(--font-sans)', color: 'var(--fg-3)', marginLeft: 'auto' }}>Updates in real-time</span>
            </div>

            {liveEvents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', font: '13px var(--font-sans)', color: 'var(--fg-3)' }}>
                Waiting for events… Send a POST to your webhook endpoint to see them here.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
                {liveEvents.map((ev) => (
                  <div key={ev.eventId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 10px', background: 'var(--surface-2)', borderRadius: 'var(--radius-md)' }}>
                    <StatusBadge status={ev.deliveryStatus} />
                    <span style={{ font: '12px var(--font-mono)', color: 'var(--fg-2)' }}>{ev.eventType}</span>
                    <span style={{ font: '11px var(--font-mono)', color: 'var(--fg-3)', marginLeft: 'auto' }}>{ev.eventId.slice(0, 12)}…</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Event history */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ font: '600 14px var(--font-sans)', color: 'var(--fg)', margin: 0 }}>Event history</h3>
              {eventsData && (
                <span style={{ font: '11px var(--font-sans)', color: 'var(--fg-3)' }}>{eventsData.meta.total} events</span>
              )}
            </div>

            {eventsLoading ? (
              <div style={{ textAlign: 'center', padding: '24px 0', font: '13px var(--font-sans)', color: 'var(--fg-3)' }}>Loading events…</div>
            ) : !eventsData || eventsData.data.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', font: '13px var(--font-sans)', color: 'var(--fg-3)' }}>No events yet</div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {eventsData.data.map((ev, i) => (
                    <EventRow key={ev.id} event={ev} subscriptionId={sub.id} first={i === 0} />
                  ))}
                </div>

                {eventsData.meta.totalPages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                      style={{ background: 'none', border: 'none', font: '13px var(--font-sans)', color: 'var(--fg-3)', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}
                    >
                      ← Previous
                    </button>
                    <span style={{ font: '11px var(--font-sans)', color: 'var(--fg-3)' }}>
                      Page {eventsData.meta.page} of {eventsData.meta.totalPages}
                    </span>
                    <button
                      disabled={page >= eventsData.meta.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      style={{ background: 'none', border: 'none', font: '13px var(--font-sans)', color: 'var(--fg-3)', cursor: page >= eventsData.meta.totalPages ? 'not-allowed' : 'pointer', opacity: page >= eventsData.meta.totalPages ? 0.4 : 1 }}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  )
}

function Card({ children, eyebrow }: { children: React.ReactNode; eyebrow?: string }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: 20,
      boxShadow: 'var(--shadow-1)',
    }}>
      {eyebrow && (
        <div style={{ font: '600 10px var(--font-sans)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 12 }}>
          {eyebrow}
        </div>
      )}
      {children}
    </div>
  )
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ padding: '6px 0', borderTop: '1px solid var(--border)' }}>
      <div style={{ font: '11px var(--font-sans)', color: 'var(--fg-3)' }}>{label}</div>
      <div style={{ font: mono ? '13px var(--font-mono)' : '13px var(--font-sans)', color: 'var(--fg-2)', marginTop: 2, wordBreak: 'break-all' }}>{value}</div>
    </div>
  )
}

function EventRow({ event, subscriptionId, first }: { event: WebhookEvent; subscriptionId: string; first: boolean }) {
  const [hover, setHover] = useState(false)
  return (
    <Link
      to={`/subscriptions/${subscriptionId}/events/${event.id}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 4px',
        borderTop: first ? 'none' : '1px solid var(--border)',
        textDecoration: 'none',
        borderRadius: first ? 'var(--radius-sm) var(--radius-sm) 0 0' : 0,
        background: hover ? 'var(--surface-2)' : 'transparent',
        transition: 'background 150ms var(--ease-out)',
        cursor: 'pointer',
      }}
    >
      <StatusBadge status={event.deliveryStatus} />
      <span style={{ font: '12px var(--font-mono)', color: 'var(--fg-2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {event.eventType}
      </span>
      {event.retryCount > 0 && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, font: '11px var(--font-sans)', color: 'var(--fg-3)' }}>
          <Clock size={11} /> {event.retryCount} attempt{event.retryCount > 1 ? 's' : ''}
        </span>
      )}
      <span style={{ font: '11px var(--font-sans)', color: 'var(--fg-3)', whiteSpace: 'nowrap' }}>
        {new Date(event.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
      </span>
    </Link>
  )
}
