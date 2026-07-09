'use client'

import Link from 'next/link'
import type { Track } from '@/types'
import { ROUTES } from '@/constants'

interface TrackCardProps {
  track: Track
  index: number
}

/* Keyword-based icon mapping — falls back to ServerIcon */
function matchIcon(name: string): 'server' | 'code' | 'users' | 'database' | 'cpu' | 'gitbranch' {
  const n = name.toLowerCase()
  if (n.includes('system') || n.includes('design') || n.includes('architecture')) return 'server'
  if (n.includes('algorithm') || n.includes('data struct') || n.includes('dsa') || n.includes('coding')) return 'code'
  if (n.includes('behavioral') || n.includes('interview') || n.includes('soft')) return 'users'
  if (n.includes('backend') || n.includes('database') || n.includes('api')) return 'database'
  if (n.includes('ml') || n.includes('machine') || n.includes('ai') || n.includes('learning')) return 'cpu'
  if (n.includes('frontend') || n.includes('react') || n.includes('web')) return 'gitbranch'
  return 'server'
}

function IconServer() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" />
    </svg>
  )
}
function IconCode() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="16,18 22,12 16,6" /><polyline points="8,6 2,12 8,18" />
    </svg>
  )
}
function IconUsers() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
function IconDatabase() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  )
}
function IconCpu() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" />
      <line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" />
      <line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" />
    </svg>
  )
}
function IconGitBranch() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="6" y1="3" x2="6" y2="15" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  )
}
function IconArrow() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12,5 19,12 12,19" />
    </svg>
  )
}

const ICON_MAP = { server: IconServer, code: IconCode, users: IconUsers, database: IconDatabase, cpu: IconCpu, gitbranch: IconGitBranch }

export function TrackCard({ track, index }: TrackCardProps) {
  const iconKey = matchIcon(track.name)
  const Icon = ICON_MAP[iconKey]

  return (
    <Link
      href={ROUTES.TRACK_DETAIL(track.id)}
      className="track-card card-anim"
      style={{ '--delay': `${index * 55}ms` } as React.CSSProperties}
    >
      {/* Icon row */}
      <div className="flex items-start justify-between">
        <div
          className="flex items-center justify-center rounded-lg shrink-0 bg-surface-overlay text-primary"
          style={{ width: 42, height: 42 }}
        >
          <Icon />
        </div>
      </div>

      {/* Title + description */}
      <div>
        <h3
          className="text-foreground"
          style={{ fontSize: 16.5, fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.2, marginBottom: 6 }}
        >
          {track.name}
        </h3>
        {track.description && (
          <p
            className="text-secondary text-pretty"
            style={{ fontSize: 13.5, lineHeight: 1.6 }}
          >
            {track.description}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto gap-2">
        <span className="btn-cta-sm">
          Start <IconArrow />
        </span>
      </div>
    </Link>
  )
}
