'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { PlatformHeader } from '@/components/layout'
import { clearToken } from '@/lib/auth'
import { ROUTES } from '@/constants'
import type { ProfileStats, User } from '@/types'
import { TrackProgressList } from './TrackProgressList'
import { BadgeGrid } from './BadgeGrid'
import { ActivityFeed } from './ActivityFeed'

function GettingStarted() {
  return (
    <div className="glass-card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Start your journey 🚀</h3>
        <p className="mt-1 text-sm text-secondary">
          Complete your first module to earn XP, start a streak, and unlock badges. Your progress shows up here.
        </p>
      </div>
      <Link
        href={ROUTES.TRACKS}
        className="shrink-0 rounded-lg bg-primary px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
      >
        Browse tracks →
      </Link>
    </div>
  )
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card p-4">
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-0.5 text-xs text-muted">{label}</p>
    </div>
  )
}

function LevelCard({ stats, email, onLogout }: { stats: ProfileStats; email?: string; onLogout: () => void }) {
  const initial = (email?.[0] ?? '?').toUpperCase()
  const pct = Math.round((stats.xp_into_level / stats.xp_for_next_level) * 100)
  return (
    <div className="glass-card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="user-avatar" style={{ width: 56, height: 56, fontSize: 20 }}>{initial}</div>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-foreground">{email ?? 'Loading…'}</p>
          <p className="text-sm text-muted">Level {stats.level} · {stats.xp.toLocaleString()} XP</p>
          <div className="mt-2 h-1.5 w-40 overflow-hidden rounded-full bg-surface-overlay">
            <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">🔥 {stats.streak_days}</p>
          <p className="text-xs text-muted">day streak</p>
        </div>
        <button
          onClick={onLogout}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-surface-raised"
        >
          Log out
        </button>
      </div>
    </div>
  )
}

export function ProfileDashboard() {
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    Promise.all([api.profile.stats(), api.auth.me()])
      .then(([s, u]) => { setStats(s); setUser(u) })
      .catch(() => {})
  }, [])

  function logOut() {
    clearToken()
    router.replace(ROUTES.LOGIN)
  }

  const initial = (user?.email?.[0] ?? '?').toUpperCase()

  return (
    <div className="page-bg min-h-screen">
      <PlatformHeader userInitial={initial} userEmail={user?.email} />
      <main className="relative z-10 mx-auto" style={{ maxWidth: 960, padding: '106px 28px 80px' }}>
        <h1 className="mb-6 text-3xl font-extrabold tracking-[-0.025em] text-foreground">Profile</h1>

        {!stats ? (
          <div className="glass-card h-40 animate-pulse" />
        ) : (
          <div className="flex flex-col gap-4">
            <LevelCard stats={stats} email={user?.email} onLogout={logOut} />

            {stats.modules_completed === 0 && stats.interviews_taken === 0 && <GettingStarted />}

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatTile label="Modules completed" value={String(stats.modules_completed)} />
              <StatTile label="Interviews taken" value={String(stats.interviews_taken)} />
              <StatTile label="Best code score" value={stats.best_code_score !== null ? String(stats.best_code_score) : '—'} />
              <StatTile label="Best prompt score" value={stats.best_prompt_score !== null ? String(stats.best_prompt_score) : '—'} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <TrackProgressList tracks={stats.tracks} />
              <ActivityFeed activity={stats.activity} />
            </div>

            <BadgeGrid badges={stats.badges} />
          </div>
        )}
      </main>
    </div>
  )
}
