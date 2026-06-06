'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { api } from '@/lib/api'
import { ErrorBoundary, TrackCard, GradientText } from '@/components/ui'
import { PlatformHeader } from '@/components/layout'
import type { Track, User } from '@/types'

const SparseMesh = dynamic(
  () => import('@/components/layout').then(m => m.SparseMesh),
  { ssr: false }
)

function TracksSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(308px, 1fr))', gap: 18 }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-[18px]"
          style={{
            background: 'var(--card-bg)',
            border: '1.5px solid var(--card-border-color)',
            padding: 26,
            height: 180,
          }}
        >
          <div className="mb-4 h-[42px] w-[42px] rounded-[11px] bg-surface-overlay" />
          <div className="mb-2.5 h-5 w-3/4 rounded bg-surface-overlay" />
          <div className="h-4 w-full rounded bg-surface-overlay" />
          <div className="mt-1.5 h-4 w-2/3 rounded bg-surface-overlay" />
        </div>
      ))}
    </div>
  )
}

interface TracksState {
  tracks: Track[]
  user: User | null
  fetchError: boolean
}

function TracksGrid() {
  const [state, setState] = useState<TracksState | null>(null)

  useEffect(() => {
    Promise.all([api.tracks.list(), api.auth.me()])
      .then(([tracks, user]) => {
        setState({ tracks, user, fetchError: false })
      })
      .catch(() => {
        setState({ tracks: [], user: null, fetchError: true })
      })
  }, [])

  if (!state) return <TracksSkeleton />

  if (state.fetchError) {
    return <p className="text-sm text-destructive">Failed to load tracks. Please refresh the page.</p>
  }

  if (state.tracks.length === 0) {
    return <p className="text-sm text-muted">No tracks available yet.</p>
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(308px, 1fr))', gap: 18 }}>
      {state.tracks.map((track, i) => (
        <TrackCard key={track.id} track={track} index={i} />
      ))}
    </div>
  )
}

function TracksPageContent() {
  const [userInitial, setUserInitial] = useState('?')

  useEffect(() => {
    api.auth.me()
      .then(user => {
        setUserInitial(user.email.charAt(0).toUpperCase())
      })
      .catch(() => {})
  }, [])

  return (
    <div className="page-bg min-h-screen">
      <SparseMesh />
      <PlatformHeader userInitial={userInitial} />

      <main
        className="relative z-10 mx-auto"
        style={{ maxWidth: 1100, padding: '106px 28px 80px' }}
      >
        {/* Page heading */}
        <div style={{ marginBottom: 44 }}>
          <h1
            className="text-foreground"
            style={{
              fontSize: 'clamp(26px, 3.5vw, 40px)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
              marginBottom: 10,
            }}
          >
            Learning <GradientText>Tracks</GradientText>
          </h1>
          <p
            className="text-secondary"
            style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 16 }}
          >
            Structured preparation paths curated by domain experts.
          </p>
          <div className="flex gap-[22px] flex-wrap">
            {['Tracks', 'Self-paced'].map(label => (
              <span
                key={label}
                className="font-mono-labels text-muted uppercase"
                style={{ fontSize: 11, letterSpacing: '0.09em' }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <TracksGrid />
      </main>
    </div>
  )
}

export default function TracksPage() {
  return (
    <ErrorBoundary>
      <TracksPageContent />
    </ErrorBoundary>
  )
}
