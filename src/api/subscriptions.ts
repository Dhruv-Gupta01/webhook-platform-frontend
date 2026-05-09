import client from './client'
import type { WebhookSubscription } from '../types'

export const getSubscriptions = () =>
  client.get<WebhookSubscription[]>('/webhooks').then((r) => r.data)

export const getSubscription = (id: string) =>
  client.get<WebhookSubscription>(`/webhooks/${id}`).then((r) => r.data)

export const createSubscription = (data: {
  name: string
  sourceUrl: string
  callbackUrl: string
  secret?: string
  events?: string[]
}) => client.post<WebhookSubscription>('/webhooks/subscribe', data).then((r) => r.data)

export const cancelSubscription = (id: string) =>
  client.patch<WebhookSubscription>(`/webhooks/${id}/cancel`).then((r) => r.data)

export const deleteSubscription = (id: string) =>
  client.delete(`/webhooks/${id}`).then((r) => r.data)
