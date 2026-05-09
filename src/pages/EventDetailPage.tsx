import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { getEvent } from '../api/events'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'

export default function EventDetailPage() {
  const { subscriptionId, eventId } = useParams<{ subscriptionId: string; eventId: string }>()
  const navigate = useNavigate()

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', subscriptionId, eventId],
    queryFn: () => getEvent(subscriptionId!, eventId!),
    enabled: !!subscriptionId && !!eventId,
  })

  if (isLoading) return <Layout><div className="text-center py-16 text-gray-400">Loading...</div></Layout>
  if (!event) return <Layout><div className="text-center py-16 text-gray-400">Event not found</div></Layout>

  return (
    <Layout>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="max-w-3xl space-y-5">
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 mb-1">Event ID</p>
            <p className="font-mono text-sm text-gray-700">{event.id}</p>
          </div>
          <div className="text-right">
            <div className="mb-1"><StatusBadge status={event.deliveryStatus} /></div>
            <p className="text-xs text-gray-400">{new Date(event.createdAt).toLocaleString()}</p>
          </div>
        </div>

        {/* Delivery info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Delivery Info</h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-400">Event Type</p>
              <p className="font-mono text-gray-700">{event.eventType}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Attempts</p>
              <p className="text-gray-700">{event.retryCount}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Delivered At</p>
              <p className="text-gray-700">{event.deliveredAt ? new Date(event.deliveredAt).toLocaleString() : '—'}</p>
            </div>
          </div>
          {event.lastError && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs font-medium text-red-700 mb-1">Last Error</p>
              <p className="text-xs text-red-600 font-mono">{event.lastError}</p>
            </div>
          )}
        </div>

        {/* Payload */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Payload</h2>
          <pre className="bg-gray-50 rounded-lg p-4 text-xs text-gray-700 overflow-auto max-h-96 font-mono">
            {JSON.stringify(event.payload, null, 2)}
          </pre>
        </div>

        {/* Headers */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Request Headers</h2>
          <div className="space-y-1">
            {Object.entries(event.headers).map(([key, value]) => (
              <div key={key} className="flex gap-4 text-xs font-mono">
                <span className="text-indigo-600 w-64 flex-shrink-0">{key}</span>
                <span className="text-gray-600 break-all">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
