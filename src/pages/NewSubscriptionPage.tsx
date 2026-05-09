import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Copy, Check, ArrowLeft } from 'lucide-react'
import { createSubscription } from '../api/subscriptions'
import Layout from '../components/Layout'
import type { WebhookSubscription } from '../types'

export default function NewSubscriptionPage() {
  const navigate = useNavigate()
  const [created, setCreated] = useState<WebhookSubscription | null>(null)
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({
    name: '',
    sourceUrl: '',
    callbackUrl: '',
    events: '',
  })

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
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Show success state after creation
  if (created) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-100 text-green-600 rounded-full p-2">
                <Check size={20} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Subscription Created!</h2>
            </div>

            {/* The most important part — the webhook endpoint */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-indigo-800 mb-2">
                📌 Your Webhook Endpoint
              </p>
              <p className="text-xs text-indigo-600 mb-3">
                Copy this URL and paste it into GitHub, Stripe, or any other service as their webhook destination.
              </p>
              <div className="flex items-center gap-2 bg-white rounded-lg border border-indigo-200 p-3">
                <code className="text-xs text-gray-700 flex-1 break-all">{created.webhookEndpoint}</code>
                <button
                  onClick={copyEndpoint}
                  className="flex-shrink-0 text-indigo-600 hover:text-indigo-800 transition"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* Secret */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-yellow-800 mb-1">🔑 Signing Secret</p>
              <p className="text-xs text-yellow-700 mb-2">
                Use this secret in your source to sign webhook payloads (HMAC-SHA256). Save it now — it won't be shown again in full.
              </p>
              <code className="text-xs text-gray-700 break-all">{created.secret}</code>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/subscriptions/${created.id}`)}
                className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 transition"
              >
                View Events Dashboard
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm hover:bg-gray-50 transition"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">New Webhook Subscription</h1>
          <p className="text-sm text-gray-500 mb-6">
            We'll give you a URL to paste into your source service. Events will be forwarded to your callback URL.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Name" hint="A friendly label for this subscription">
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="My GitHub Webhook"
                className={inputClass}
              />
            </Field>

            <Field
              label="Source URL"
              hint="The service sending events to you (e.g. https://github.com)"
            >
              <input
                required
                type="url"
                value={form.sourceUrl}
                onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
                placeholder="https://github.com"
                className={inputClass}
              />
            </Field>

            <Field
              label="Callback URL"
              hint="Your server endpoint where we forward processed events"
            >
              <input
                required
                type="url"
                value={form.callbackUrl}
                onChange={(e) => setForm({ ...form, callbackUrl: e.target.value })}
                placeholder="https://myapp.com/webhook-handler"
                className={inputClass}
              />
            </Field>

            <Field
              label="Event Filter (optional)"
              hint="Comma-separated event types to accept. Leave blank to accept all."
            >
              <input
                value={form.events}
                onChange={(e) => setForm({ ...form, events: e.target.value })}
                placeholder="push, pull_request, payment.succeeded"
                className={inputClass}
              />
            </Field>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {mutation.isPending ? 'Creating...' : 'Create Subscription'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  )
}

const inputClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'

function Field({
  label, hint, children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}
