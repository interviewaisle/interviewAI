import { getToken } from '@/lib/auth'
import type { Track, Module, TrackProgress, User, SubmissionBody } from '@/types'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw Object.assign(new Error(err.message ?? 'Request failed'), {
      status: res.status,
      data: err,
    })
  }

  return res.json() as Promise<T>
}

export const api = {
  auth: {
    signup: (body: { email: string; password: string }) =>
      apiFetch<{ user_id: string }>('/api/v1/auth/signup', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    login: (body: { email: string; password: string }) =>
      apiFetch<{ access_token: string; refresh_token: string; expires_at: number }>(
        '/api/v1/auth/login',
        { method: 'POST', body: JSON.stringify(body) }
      ),
    me: () => apiFetch<User>('/api/v1/auth/me'),
  },
  tracks: {
    list: () => apiFetch<Track[]>('/api/v1/tracks'),
    modules: (trackId: string) =>
      apiFetch<Module[]>(`/api/v1/tracks/${trackId}/modules`),
    progress: (trackId: string) =>
      apiFetch<TrackProgress>(`/api/v1/tracks/${trackId}/progress`),
  },
  submissions: {
    run: (body: SubmissionBody) =>
      apiFetch<{ execution_id: string; status: string }>('/api/v1/submissions/run', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },
}
