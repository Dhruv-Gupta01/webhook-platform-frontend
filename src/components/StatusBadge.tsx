import type { DeliveryStatus } from '../types'

const styles: Record<DeliveryStatus, string> = {
  pending:   'bg-yellow-100 text-yellow-800',
  delivered: 'bg-green-100  text-green-800',
  retrying:  'bg-blue-100   text-blue-800',
  failed:    'bg-red-100    text-red-800',
}

export default function StatusBadge({ status }: { status: DeliveryStatus }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  )
}
