import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Copy, Check, ArrowLeft, Key } from 'lucide-react'
import { createSubscription } from '../api/subscriptions'
import Layout from '../components/Layout'
import type { WebhookSubscription } from '../types'

export default function NewSubscriptionPage() {
  const navigate = useNavigate()
  const [created, setCreated] = useState<WebhookSubscription | null>(null)
  const [copied, setCopied] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', sourceUrl: '', callbackUrl: '', events: '' })

  const mutation = useMutation({
    mutationFn: createSubscription,
    onSuccess: (data) => {
      setCreated(data)
      toast.success('Subscription created!')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? 'Failed to create subscription')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({
      name: form.name,
      sourceUrl: form.sourceUrl,
      callbackUrl: form.callbackUrl,
      events: form.events ? form.events.split(',').map((s) => s.trim()).filter(Boolean) : [],
    })
  }

  const copyEndpoint = () => {
    if (created) {
      navigator.clipboard.writeText(created.webhookEndpoint)
      setCopied(true)
      toast.success('Endpoint copied')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const inputStyle = (field: string): React.CSSProperties => ({
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

  if (created) {
    return (
      <Layout>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: 28,
            boxShadow: 'var(--shadow-2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--success-soft)', color: 'var(--success)', display: 'grid', placeItems: 'center' }}>
                <Check size={18} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, letterSpacing: '-0.02em', color: 'var(--fg)', margin: 0, fontWeight: 400 }}>
                Subscription created
              </h2>
            </div>

            {/* Webhook endpoint */}
            <div style={{ background: 'var(--accent-soft)', border: '1px solid rgba(79,70,229,0.25)', borderRadius: 'var(--radius-md)', padding: 14, marginBottom: 16 }}>
              <div style={{ font: '600 12px var(--font-sans)', color: 'var(--accent-soft-fg)', marginBottom: 4 }}>Your webhook endpoint</div>
              <div style={{ font: '12px var(--font-sans)', color: 'var(--fg-2)', marginBottom: 10 }}>
                Copy this URL and paste it into GitHub, Stripe, or any other service as their webhook destination.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 10px' }}>
                <code style={{ flex: 1, font: '12px var(--font-mono)', color: 'var(--fg)', wordBreak: 'break-all' }}>{created.webhookEndpoint}</code>
                <button
                  onClick={copyEndpoint}
                  style={{ background: 'transparent', border: 0, color: 'var(--accent)', cursor: 'pointer', padding: 4, flexShrink: 0 }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* Signing secret */}
            <div style={{ background: 'var(--warn-soft)', border: '1px solid rgba(180,83,9,0.25)', borderRadius: 'var(--radius-md)', padding: 14, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, font: '600 12px var(--font-sans)', color: 'var(--warn-fg)', marginBottom: 4 }}>
                <Key size={13} /> Signing secret
              </div>
              <div style={{ font: '12px var(--font-sans)', color: 'var(--fg-2)', marginBottom: 8 }}>
                Use this secret to sign webhook payloads (HMAC-SHA256). Save it now — it won't be shown again in full.
              </div>
              <code style={{ font: '12px var(--font-mono)', color: 'var(--fg)', wordBreak: 'break-all' }}>{created.secret}</code>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => navigate(`/subscriptions/${created.id}`)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 14px', background: 'var(--accent)', color: 'var(--fg-on-accent)', font: '500 13px var(--font-sans)', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', transition: 'background 150ms var(--ease-out)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-hover)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)' }}
              >
                View events dashboard
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 14px', background: 'var(--surface)', color: 'var(--fg)', font: '500 13px var(--font-sans)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)', cursor: 'pointer', transition: 'background 150ms var(--ease-out)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-2)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface)' }}
              >
                Back to dashboard
              </button>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <a
          onClick={() => navigate(-1)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, font: '13px var(--font-sans)', color: 'var(--fg-3)', cursor: 'pointer', marginBottom: 18, textDecoration: 'none' }}
        >
          <ArrowLeft size={14} /> Back
        </a>

        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: 28,
          boxShadow: 'var(--shadow-2)',
        }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: '-0.02em', color: 'var(--fg)', margin: 0, fontWeight: 400 }}>
            New webhook subscription
          </h1>
          <p style={{ font: '13px var(--font-sans)', color: 'var(--fg-3)', margin: '6px 0 24px' }}>
            We'll give you a URL to paste into your source service. Events will be forwarded to your callback URL.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Name" hint="A friendly label for this subscription">
              <input
                required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
                placeholder="My GitHub webhook"
                style={inputStyle('name')}
              />
            </Field>

            <Field label="Source URL" hint="The service sending events to you">
              <input
                required type="url" value={form.sourceUrl}
                onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
                onFocus={() => setFocused('sourceUrl')} onBlur={() => setFocused(null)}
                placeholder="https://github.com"
                style={inputStyle('sourceUrl')}
              />
            </Field>

            <Field label="Callback URL" hint="Your server endpoint where we forward processed events">
              <input
                required type="url" value={form.callbackUrl}
                onChange={(e) => setForm({ ...form, callbackUrl: e.target.value })}
                onFocus={() => setFocused('callbackUrl')} onBlur={() => setFocused(null)}
                placeholder="https://myapp.com/webhook-handler"
                style={inputStyle('callbackUrl')}
              />
            </Field>

            <Field label="Event filter" hint="Comma-separated event types to accept. Leave blank to accept all.">
              <input
                value={form.events}
                onChange={(e) => setForm({ ...form, events: e.target.value })}
                onFocus={() => setFocused('events')} onBlur={() => setFocused(null)}
                placeholder="push, pull_request, payment.succeeded"
                style={inputStyle('events')}
              />
            </Field>

            <button
              type="submit"
              disabled={mutation.isPending}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '10px 14px', marginTop: 4,
                background: 'var(--accent)', color: 'var(--fg-on-accent)',
                font: '500 13px var(--font-sans)',
                borderRadius: 'var(--radius-md)', border: 'none', cursor: mutation.isPending ? 'not-allowed' : 'pointer',
                opacity: mutation.isPending ? 0.6 : 1,
                transition: 'background 150ms var(--ease-out)',
              }}
              onMouseEnter={(e) => { if (!mutation.isPending) e.currentTarget.style.background = 'var(--accent-hover)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)' }}
            >
              {mutation.isPending ? 'Creating…' : 'Create subscription'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ font: '500 12px var(--font-sans)', color: 'var(--fg-2)' }}>{label}</label>
      {children}
      {hint && <span style={{ font: '11px var(--font-sans)', color: 'var(--fg-3)' }}>{hint}</span>}
    </div>
  )
}
