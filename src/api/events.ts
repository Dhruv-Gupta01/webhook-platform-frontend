import client from './client'
import type { PaginatedEvents, WebhookEvent } from '../types'

export const getEvents = (subscriptionId: string, page = 1, limit = 20) =>
  client
    .get<PaginatedEvents>(`/webhooks/${subscriptionId}/events`, { params: { page, limit } })
    .then((r) => r.data)

export const getEvent = (subscriptionId: string, eventId: string) =>
  client.get<WebhookEvent>(`/webhooks/${subscriptionId}/events/${eventId}`).then((r) => r.data)
