'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { PlatformHeader } from '@/components/layout'
import { clearToken } from '@/lib/auth'
import { ROUTES } from '@/constants'
import type { ProfileStats, User } from '@/types'
import { ProfileTabs, type ProfileTab } from './ProfileTabs'
import { ProfileOverview } from './ProfileOverview'
import { LeaderboardTable } from './LeaderboardTable'
import { AccountSettings } from './AccountSettings'

function LevelCard({ stats, user, onLogout }: { stats: ProfileStats; user: User | null; onLogout: () => void }) {
  const name = user?.display_name ?? user?.email
  const initial = (name?.[0] ?? '?').toUpperCase()
  const pct = Math.round((stats.xp_into_level / stats.xp_for_next_level) * 100)
  return (
    <div className="glass-card mb-4 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="user-avatar" style={{ width: 56, height: 56, fontSize: 20 }}>{initial}</div>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-foreground">{name ?? 'Loading…'}</p>
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
  const [tab, setTab] = useState<ProfileTab>('overview')
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

  const initial = (user?.display_name?.[0] ?? user?.email?.[0] ?? '?').toUpperCase()

  return (
    <div className="page-bg min-h-screen">
      <PlatformHeader userInitial={initial} userEmail={user?.display_name ?? user?.email} />
      <main className="relative z-10 mx-auto" style={{ maxWidth: 960, padding: '106px 28px 80px' }}>
        <h1 className="mb-6 text-3xl font-extrabold tracking-[-0.025em] text-foreground">Profile</h1>

        {!stats || !user ? (
          <div className="glass-card h-40 animate-pulse" />
        ) : (
          <>
            <LevelCard stats={stats} user={user} onLogout={logOut} />
            <ProfileTabs active={tab} onChange={setTab} />
            {tab === 'overview' && <ProfileOverview stats={stats} />}
            {tab === 'leaderboard' && <LeaderboardTable />}
            {tab === 'settings' && <AccountSettings user={user} onUserUpdate={setUser} />}
          </>
        )}
      </main>
    </div>
  )
}
