'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { ErrorBoundary, TrackCard } from '@/components/ui'
import { PlatformHeader } from '@/components/layout'
import { ROUTES } from '@/constants'
import type { Track, User } from '@/types'

interface HomeState {
  tracks: Track[]
  user: User | null
}

function HomeInner() {
  const [state, setState] = useState<HomeState | null>(null)

  useEffect(() => {
    Promise.all([api.tracks.list(), api.auth.me()])
      .then(([tracks, user]) => setState({ tracks, user }))
      .catch(() => setState({ tracks: [], user: null }))
  }, [])

  const user = state?.user
  const displayLabel = user?.display_name ?? user?.email
  const initial = displayLabel?.[0] ?? '?'
  const firstTrack = state?.tracks[0]
  const greetingName = user?.display_name ?? user?.email?.split('@')[0] ?? 'there'

  return (
    <div className="page-bg min-h-screen">
      <PlatformHeader userInitial={initial} userEmail={displayLabel} activeNav="home" />

      <main className="relative z-10 mx-auto" style={{ maxWidth: 1000, padding: '106px 28px 80px' }}>
        <h1 className="text-3xl font-extrabold tracking-[-0.025em] text-foreground md:text-[40px]">
          Welcome back, {greetingName}
        </h1>
        <p className="mt-2.5 text-[15px] leading-[1.6] text-secondary">
          Pick up where you left off or explore a new track.
        </p>

        {/* Continue learning */}
        <div className="glass-card mt-9 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-muted">
              {firstTrack ? 'Continue learning' : 'Get started'}
            </p>
            <h2 className="mt-1.5 text-lg font-semibold text-foreground">
              {firstTrack ? firstTrack.name : 'Browse the track catalog'}
            </h2>
            {firstTrack?.description && (
              <p className="mt-1 line-clamp-1 text-sm text-secondary">{firstTrack.description}</p>
            )}
          </div>
          <Link
            href={firstTrack ? ROUTES.TRACK_DETAIL(firstTrack.id) : ROUTES.TRACKS}
            className="shrink-0 rounded-lg bg-primary px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            {firstTrack ? 'Resume' : 'Explore'}
          </Link>
        </div>

        {/* Your tracks — real content */}
        <div className="mt-11 mb-4 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-foreground">Your tracks</h3>
          <Link href={ROUTES.TRACKS} className="text-sm font-medium text-muted transition-colors hover:text-foreground">
            View all →
          </Link>
        </div>
        {!state ? (
          <div className="glass-card h-40 animate-pulse" />
        ) : state.tracks.length === 0 ? (
          <p className="text-sm text-muted">No tracks available yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {state.tracks.map((track, i) => (
              <TrackCard key={track.id} track={track} index={i} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default function HomePage() {
  return (
    <ErrorBoundary>
      <HomeInner />
    </ErrorBoundary>
  )
}
