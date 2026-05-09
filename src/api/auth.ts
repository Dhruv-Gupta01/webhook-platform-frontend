import client from './client'
import type { AuthResponse } from '../types'

export const register = (data: { email: string; password: string; name: string }) =>
  client.post<AuthResponse>('/auth/register', data).then((r) => r.data)

export const login = (data: { email: string; password: string }) =>
  client.post<AuthResponse>('/auth/login', data).then((r) => r.data)

export const getMe = () =>
  client.get<{ id: string; email: string; name: string }>('/auth/me').then((r) => r.data)
