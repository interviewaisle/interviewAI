import { getToken } from '@/lib/auth'
import { API_PATHS } from '@/constants'
import type { Track, Module, TrackProgress, User, SubmissionBody, SubmissionResult, ChatMessage, DualScore, ProfileStats, LeaderboardEntry } from '@/types'

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
    updateProfile: (body: { display_name: string }) =>
      apiFetch<User>(API_PATHS.AUTH_ME, { method: 'PATCH', body: JSON.stringify(body) }),
    changePassword: (body: { current_password: string; new_password: string }) =>
      apiFetch<{ ok: boolean }>(API_PATHS.AUTH_CHANGE_PASSWORD, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },
  tracks: {
    list: () => apiFetch<Track[]>('/api/v1/tracks'),
    modules: (trackId: string) =>
      apiFetch<Module[]>(`/api/v1/tracks/${trackId}/modules`),
    progress: (trackId: string) =>
      apiFetch<TrackProgress>(`/api/v1/tracks/${trackId}/progress`),
    complete: (trackId: string, moduleId: string) =>
      apiFetch<{ ok: boolean }>(`/api/v1/tracks/${trackId}/modules/${moduleId}/complete`, {
        method: 'POST',
      }),
  },
  profile: {
    stats: () => apiFetch<ProfileStats>('/api/v1/profile/stats'),
    leaderboard: () => apiFetch<LeaderboardEntry[]>(API_PATHS.PROFILE_LEADERBOARD),
  },
  submissions: {
    run: (body: SubmissionBody) =>
      apiFetch<SubmissionResult>('/api/v1/submissions/run', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },
  interview: {
    evaluate: (body: { module_id: string; code: string; chat_logs: ChatMessage[]; ran_successfully?: boolean }) =>
      apiFetch<DualScore>('/api/v1/interview/evaluate', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },
}
