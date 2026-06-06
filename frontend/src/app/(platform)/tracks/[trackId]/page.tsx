'use client'

import { useEffect, useState } from 'react'
import { useParams, notFound } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { api } from '@/lib/api'
import { clearToken } from '@/lib/auth'
import { ErrorBoundary, GradientText, ModuleStepItem } from '@/components/ui'
import { PlatformHeader } from '@/components/layout'
import { ROUTES } from '@/constants'
import type { Module, Track, TrackProgress, User } from '@/types'

const SparseMesh = dynamic(
  () => import('@/components/layout').then(m => m.SparseMesh),
  { ssr: false }
)

function IconLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15,18 9,12 15,6" />
    </svg>
  )
}

function IconServer() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" />
    </svg>
  )
}

function TrackDetailSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-[14px]"
          style={{ background: 'var(--module-card-bg)', border: '1.5px solid var(--card-border-color)', padding: '18px 20px' }}
        >
          <div className="flex items-center gap-4">
            <div className="h-7 w-7 rounded-full bg-surface-overlay shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 rounded bg-surface-overlay" />
              <div className="h-3 w-48 rounded bg-surface-overlay" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

interface TrackDetailState {
  modules: Module[]
  progress: TrackProgress
  user: User
  track: Track | null
}

function TrackDetailContent() {
  const params = useParams<{ trackId: string }>()
  const trackId = params.trackId

  const [data, setData] = useState<TrackDetailState | null>(null)
  const [notFoundFlag, setNotFoundFlag] = useState(false)

  useEffect(() => {
    Promise.all([
      api.tracks.modules(trackId),
      api.tracks.progress(trackId),
      api.auth.me(),
      api.tracks.list(),
    ])
      .then(([modules, progress, user, allTracks]) => {
        const track = allTracks.find(t => t.id === trackId) ?? null
        setData({ modules, progress, user, track })
      })
      .catch((err: unknown) => {
        const status = (err as { status?: number }).status
        if (status === 401) {
          clearToken()
          window.location.replace(ROUTES.LOGIN)
        } else {
          setNotFoundFlag(true)
        }
      })
  }, [trackId])

  if (notFoundFlag) notFound()
  if (!data) return <TrackDetailSkeleton />

  const { modules, progress, user, track } = data
  const isFree = user.subscription_status === 'FREE'

  const completedCount = progress.completed_modules.length
  const totalCount = modules.length
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const remaining = totalCount - completedCount

  const trackName = track?.name ?? 'Track'
  const trackDesc = track?.description ?? ''
  const eyebrowColor = 'var(--accent)' // icy-cyan

  return (
    <div>
      {/* Back link */}
      <Link
        href={ROUTES.TRACKS}
        className="back-link fade-in"
        style={{ marginBottom: 20, display: 'inline-flex' }}
      >
        <IconLeft /> All Tracks
      </Link>

      {/* Track overview card */}
      <div
        className="glass-card fade-in"
        style={{ padding: '28px 30px', marginTop: 16, marginBottom: 32, animationDelay: '50ms' }}
      >
        <div
          className="flex items-start justify-between gap-4"
          style={{ marginBottom: 20 }}
        >
          <div className="flex-1 min-w-0">
            {/* Eyebrow label */}
            <div style={{ marginBottom: 8 }}>
              <span
                className="font-mono-labels uppercase"
                style={{ fontSize: 10.5, letterSpacing: '0.1em', color: eyebrowColor }}
              >
                {trackName}
              </span>
            </div>
            {/* Heading */}
            <h1
              className="text-foreground"
              style={{
                fontSize: 'clamp(22px, 3vw, 30px)',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                lineHeight: 1.1,
                marginBottom: 10,
              }}
            >
              Track <GradientText>Overview</GradientText>
            </h1>
            {trackDesc && (
              <p
                className="text-secondary text-pretty"
                style={{ fontSize: 14, lineHeight: 1.6 }}
              >
                {trackDesc}
              </p>
            )}
          </div>
          {/* Track icon */}
          <div
            className="flex items-center justify-center rounded-[13px] shrink-0 text-accent"
            style={{
              width: 50,
              height: 50,
              background: 'rgba(125,200,235,0.13)',
            }}
          >
            <IconServer />
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between items-center" style={{ marginBottom: 10 }}>
            <span
              className="font-mono-labels text-muted uppercase"
              style={{ fontSize: 11, letterSpacing: '0.09em' }}
            >
              Track Progress
            </span>
            <span
              className="font-mono-labels text-muted"
              style={{ fontSize: 11.5 }}
            >
              {completedCount} / {totalCount} modules
            </span>
          </div>
          <div className="progress-track" style={{ height: 5 }}>
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-6 flex-wrap" style={{ marginTop: 16 }}>
          {[
            `${pct}% complete`,
            `${remaining} remaining`,
          ].map(s => (
            <span
              key={s}
              className="font-mono-labels text-muted uppercase"
              style={{ fontSize: 11, letterSpacing: '0.07em' }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Modules label */}
      <div style={{ marginBottom: 18 }}>
        <span
          className="font-mono-labels text-muted uppercase"
          style={{ fontSize: 11, letterSpacing: '0.1em' }}
        >
          Modules
        </span>
      </div>

      {/* Module timeline */}
      {modules.length === 0 ? (
        <p className="text-sm text-muted">No modules available yet.</p>
      ) : (
        <div>
          {modules.map((mod, i) => (
            <ModuleStepItem
              key={mod.id}
              module={mod}
              isCompleted={progress.completed_modules.includes(mod.id)}
              isCurrent={mod.stage_index === progress.current_stage}
              isLocked={isFree && mod.stage_index > 1}
              isLast={i === modules.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function TrackDetailPage() {
  const params = useParams<{ trackId: string }>()
  const [userInitial, setUserInitial] = useState('?')

  useEffect(() => {
    api.auth.me()
      .then(user => setUserInitial(user.email.charAt(0).toUpperCase()))
      .catch(() => {})
  }, [params.trackId])

  return (
    <div className="page-bg min-h-screen">
      <SparseMesh />
      <PlatformHeader userInitial={userInitial} />

      <main
        className="relative z-10 mx-auto"
        style={{ maxWidth: 720, padding: '106px 28px 80px' }}
      >
        <TrackDetailContent />
      </main>
    </div>
  )
}

export default function TrackDetailPageWrapper() {
  return (
    <ErrorBoundary>
      <TrackDetailPage />
    </ErrorBoundary>
  )
}
