export interface User {
  id: string
  email: string
  name: string
}

export interface AuthResponse {
  accessToken: string
  user: User
}

export type DeliveryStatus = 'pending' | 'delivered' | 'retrying' | 'failed'

export interface WebhookSubscription {
  id: string
  name: string
  sourceUrl: string
  callbackUrl: string
  secret: string
  events: string[]
  isActive: boolean
  webhookEndpoint: string
  createdAt: string
  updatedAt: string
}

export interface WebhookEvent {
  id: string
  subscriptionId: string
  eventType: string
  payload: Record<string, unknown>
  headers: Record<string, string>
  deliveryStatus: DeliveryStatus
  retryCount: number
  lastError: string | null
  deliveredAt: string | null
  createdAt: string
}

export interface PaginatedEvents {
  data: WebhookEvent[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// Shape pushed down the SSE stream
export interface SSEEventUpdate {
  subscriptionId: string
  eventId: string
  deliveryStatus: DeliveryStatus
  eventType: string
  retryCount: number
  lastError?: string
}
