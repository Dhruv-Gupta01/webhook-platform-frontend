import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Copy, Check, Radio, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { getSubscription } from '../api/subscriptions'
import { getEvents } from '../api/events'
import { useEventStream } from '../hooks/useEventStream'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import type { SSEEventUpdate, WebhookEvent } from '../types'

export default function SubscriptionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [liveEvents, setLiveEvents] = useState<SSEEventUpdate[]>([])
  const [copiedEndpoint, setCopiedEndpoint] = useState(false)

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

  // Connect to the SSE stream — new events appear in liveEvents instantly
  useEventStream(id!, (update) => {
    setLiveEvents((prev) => {
      // If event already in list, update its status; otherwise prepend it
      const exists = prev.find((e) => e.eventId === update.eventId)
      if (exists) return prev.map((e) => (e.eventId === update.eventId ? update : e))
      return [update, ...prev]
    })
    // Refresh the full event list so the paginated table stays in sync
    queryClient.invalidateQueries({ queryKey: ['events', id] })
  })

  const copyEndpoint = () => {
    if (sub) {
      navigator.clipboard.writeText(sub.webhookEndpoint)
      setCopiedEndpoint(true)
      toast.success('Endpoint copied!')
      setTimeout(() => setCopiedEndpoint(false), 2000)
    }
  }

  if (subLoading) return <Layout><div className="text-center py-16 text-gray-400">Loading...</div></Layout>
  if (!sub) return <Layout><div className="text-center py-16 text-gray-400">Subscription not found</div></Layout>

  return (
    <Layout>
      {/* Back + Header */}
      <div className="mb-6">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={16} /> Dashboard
        </button>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{sub.name}</h1>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sub.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {sub.isActive ? 'Active' : 'Cancelled'}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-1">{sub.sourceUrl}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left column — subscription details */}
        <div className="space-y-4">
          <InfoCard title="Subscription Info">
            <InfoRow label="Callback URL" value={sub.callbackUrl} mono />
            <InfoRow label="Event Filter" value={sub.events.length > 0 ? sub.events.join(', ') : 'All events'} />
            <InfoRow label="Created" value={new Date(sub.createdAt).toLocaleDateString()} />
          </InfoCard>

          <InfoCard title="Webhook Endpoint">
            <p className="text-xs text-gray-500 mb-3">Paste this URL into your source service</p>
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg border border-gray-200 p-2">
              <code className="text-xs text-gray-600 flex-1 break-all">{sub.webhookEndpoint}</code>
              <button onClick={copyEndpoint} className="flex-shrink-0 text-gray-400 hover:text-indigo-600">
                {copiedEndpoint ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </InfoCard>
        </div>

        {/* Right column — live feed + event history */}
        <div className="col-span-2 space-y-5">

          {/* Live Event Feed */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Radio size={16} className="text-red-500 animate-pulse" />
              <h2 className="font-semibold text-gray-800">Live Event Feed</h2>
              <span className="text-xs text-gray-400 ml-auto">Updates in real-time</span>
            </div>

            {liveEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                Waiting for events... Send a POST to your webhook endpoint to see them here.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {liveEvents.map((ev) => (
                  <LiveEventRow key={ev.eventId} event={ev} />
                ))}
              </div>
            )}
          </div>

          {/* Event History */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Event History</h2>

            {eventsLoading ? (
              <div className="text-center py-8 text-gray-400 text-sm">Loading events...</div>
            ) : !eventsData || eventsData.data.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">No events yet</div>
            ) : (
              <>
                <div className="space-y-2">
                  {eventsData.data.map((ev) => (
                    <EventRow key={ev.id} event={ev} subscriptionId={sub.id} />
                  ))}
                </div>

                {/* Pagination */}
                {eventsData.meta.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30"
                    >
                      ← Previous
                    </button>
                    <span className="text-xs text-gray-400">
                      Page {eventsData.meta.page} of {eventsData.meta.totalPages}
                    </span>
                    <button
                      disabled={page >= eventsData.meta.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

function LiveEventRow({ event }: { event: SSEEventUpdate }) {
  return (
    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg text-sm">
      <StatusBadge status={event.deliveryStatus} />
      <span className="font-mono text-xs text-gray-600">{event.eventType}</span>
      <span className="text-xs text-gray-400 ml-auto">{event.eventId.slice(0, 8)}...</span>
    </div>
  )
}

function EventRow({ event, subscriptionId }: { event: WebhookEvent; subscriptionId: string }) {
  return (
    <Link
      to={`/subscriptions/${subscriptionId}/events/${event.id}`}
      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition group"
    >
      <StatusBadge status={event.deliveryStatus} />
      <span className="font-mono text-xs text-gray-600 flex-1">{event.eventType}</span>
      {event.retryCount > 0 && (
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <Clock size={12} /> {event.retryCount} attempt{event.retryCount > 1 ? 's' : ''}
        </span>
      )}
      <span className="text-xs text-gray-400">{new Date(event.createdAt).toLocaleString()}</span>
    </Link>
  )
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`text-sm text-gray-700 break-all ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  )
}
