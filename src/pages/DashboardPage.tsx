import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Plus, Webhook, Activity, XCircle, Trash2, ExternalLink } from 'lucide-react'
import { getSubscriptions, cancelSubscription, deleteSubscription } from '../api/subscriptions'
import { useAuthStore } from '../store/auth.store'
import Layout from '../components/Layout'
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name || user?.email} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage your webhook subscriptions</p>
        </div>
        <Link
          to="/subscriptions/new"
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
        >
          <Plus size={16} /> New Subscription
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard icon={<Webhook size={20} />} label="Total" value={subscriptions.length} color="indigo" />
        <StatCard icon={<Activity size={20} />} label="Active" value={active} color="green" />
        <StatCard icon={<XCircle size={20} />} label="Cancelled" value={inactive} color="red" />
      </div>

      {/* Subscription List */}
      {isLoading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : subscriptions.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {subscriptions.map((sub) => (
            <SubscriptionCard
              key={sub.id}
              sub={sub}
              onCancel={() => {
                if (confirm('Cancel this subscription?')) cancelMutation.mutate(sub.id)
              }}
              onDelete={() => {
                if (confirm('Permanently delete this subscription and all its events?'))
                  deleteMutation.mutate(sub.id)
              }}
            />
          ))}
        </div>
      )}
    </Layout>
  )
}

function StatCard({
  icon, label, value, color,
}: {
  icon: React.ReactNode
  label: string
  value: number
  color: 'indigo' | 'green' | 'red'
}) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600',
    green:  'bg-green-50  text-green-600',
    red:    'bg-red-50    text-red-600',
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
      <div className={`p-2 rounded-lg ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  )
}

function SubscriptionCard({
  sub, onCancel, onDelete,
}: {
  sub: WebhookSubscription
  onCancel: () => void
  onDelete: () => void
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${sub.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 truncate">{sub.name}</span>
            {!sub.isActive && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">cancelled</span>
            )}
          </div>
          <p className="text-xs text-gray-400 truncate mt-0.5">{sub.sourceUrl}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          to={`/subscriptions/${sub.id}`}
          className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
        >
          <ExternalLink size={14} /> View Events
        </Link>
        {sub.isActive && (
          <button
            onClick={onCancel}
            className="text-xs text-gray-400 hover:text-orange-500 px-2 py-1 rounded border border-gray-200 hover:border-orange-300 transition"
          >
            Cancel
          </button>
        )}
        <button
          onClick={onDelete}
          className="text-gray-400 hover:text-red-500 transition"
          title="Delete permanently"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
      <Webhook size={40} className="mx-auto text-gray-300 mb-3" />
      <p className="text-gray-500 font-medium">No subscriptions yet</p>
      <p className="text-gray-400 text-sm mb-4">Create your first webhook subscription to get started</p>
      <Link
        to="/subscriptions/new"
        className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition"
      >
        <Plus size={16} /> New Subscription
      </Link>
    </div>
  )
}
