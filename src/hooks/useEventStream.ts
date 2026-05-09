import { useEffect, useRef } from 'react'
import { useAuthStore } from '../store/auth.store'
import type { SSEEventUpdate } from '../types'

// Opens a persistent SSE connection to the server for a specific subscription.
// Calls onUpdate every time the server pushes a delivery status change.
// Automatically reconnects if the connection drops.
export function useEventStream(
  subscriptionId: string,
  onUpdate: (update: SSEEventUpdate) => void,
) {
  const token = useAuthStore((s) => s.token)
  const onUpdateRef = useRef(onUpdate)
  onUpdateRef.current = onUpdate // keep ref fresh without re-subscribing

  useEffect(() => {
    if (!token || !subscriptionId) return

    // EventSource can't set headers — pass JWT as query param instead
    const url = `/api/webhooks/${subscriptionId}/events/stream?token=${token}`
    const es = new EventSource(url)

    es.onmessage = (e) => {
      try {
        const data: SSEEventUpdate = JSON.parse(e.data)
        onUpdateRef.current(data)
      } catch {
        // malformed message — ignore
      }
    }

    es.onerror = () => {
      // Browser auto-reconnects after a few seconds — no manual handling needed
    }

    // Cleanup: close the SSE connection when component unmounts
    return () => es.close()
  }, [subscriptionId, token])
}
