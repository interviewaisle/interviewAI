'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { api } from '@/lib/api'
import { ErrorBoundary, TrackCard } from '@/components/ui'
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
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined)

  useEffect(() => {
    api.auth.me()
      .then(user => {
        const label = user.display_name ?? user.email
        setUserInitial(label.charAt(0).toUpperCase())
        setUserEmail(label)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="page-bg min-h-screen">
      <SparseMesh />
      <PlatformHeader userInitial={userInitial} userEmail={userEmail} activeNav="tracks" />

      <main
        className="relative z-10 mx-auto"
        style={{ maxWidth: 1100, padding: '106px 28px 80px' }}
      >
        {/* Page heading */}
        <div style={{ marginBottom: 40 }}>
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
            Learning Tracks
          </h1>
          <p className="text-secondary" style={{ fontSize: 15, lineHeight: 1.6 }}>
            Structured preparation paths curated by domain experts.
          </p>
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
