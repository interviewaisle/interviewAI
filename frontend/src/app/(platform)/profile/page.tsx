'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { ErrorBoundary } from '@/components/ui'
import { PlatformHeader } from '@/components/layout'
import { clearToken } from '@/lib/auth'
import { ROUTES } from '@/constants'
import type { User } from '@/types'

const TIER_LABEL: Record<User['subscription_status'], string> = {
  FREE: 'Free plan',
  ACTIVE_PRO: 'Pro plan',
  CANCELLED: 'Cancelled',
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-3.5 last:border-b-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  )
}

function ProfileInner() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    api.auth.me().then(setUser).catch(() => {})
  }, [])

  function logOut() {
    clearToken()
    router.replace(ROUTES.LOGIN)
  }

  const initial = (user?.email?.[0] ?? '?').toUpperCase()
  const joined = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : '—'

  return (
    <div className="page-bg min-h-screen">
      <PlatformHeader userInitial={initial} userEmail={user?.email} />

      <main className="relative z-10 mx-auto" style={{ maxWidth: 720, padding: '106px 28px 80px' }}>
        <h1 className="text-3xl font-extrabold tracking-[-0.025em] text-foreground">Profile</h1>

        {/* Identity */}
        <div className="glass-card mt-8 flex items-center gap-4 p-6">
          <div className="user-avatar" style={{ width: 52, height: 52, fontSize: 18 }}>{initial}</div>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-foreground">{user?.email ?? 'Loading…'}</p>
            <p className="text-sm text-muted">{user ? TIER_LABEL[user.subscription_status] : ''}</p>
          </div>
        </div>

        {/* Details */}
        <div className="glass-card mt-4 px-6 py-2">
          <Row label="Email" value={user?.email ?? '—'} />
          <Row label="Plan" value={user ? TIER_LABEL[user.subscription_status] : '—'} />
          <Row label="Member since" value={joined} />
        </div>

        {/* Plan CTA + logout */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {user?.subscription_status === 'FREE' ? (
            <button
              disabled
              className="cursor-not-allowed rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted"
            >
              Upgrade to Pro — coming soon
            </button>
          ) : <span />}
          <button
            onClick={logOut}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-surface-raised"
          >
            Log out
          </button>
        </div>
      </main>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <ErrorBoundary>
      <ProfileInner />
    </ErrorBoundary>
  )
}
