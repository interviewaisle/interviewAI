'use client'

import Link from 'next/link'
import { ROUTES } from '@/constants'
import type { Module } from '@/types'

interface ModuleStepItemProps {
  module: Module
  isCompleted: boolean
  isCurrent: boolean
  isLocked: boolean
  isLast: boolean
}

const tierLabel: Record<Module['tier_type'], string> = {
  CONCEPT: 'Lesson',
  CODING: 'Coding',
  SIMULATOR: 'Simulator',
  INTERVIEW: 'Interview',
}


function IconCheck() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20,6 9,17 4,12" />
    </svg>
  )
}
function IconCheckCyan() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20,6 9,17 4,12" />
    </svg>
  )
}
function IconLock() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}
function IconPlay() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  )
}
function IconLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15,18 9,12 15,6" />
    </svg>
  )
}

function CircleIndicator({
  isCompleted, isCurrent, isLocked, isUpcoming,
}: { isCompleted: boolean; isCurrent: boolean; isLocked: boolean; isUpcoming: boolean }) {
  if (isCompleted) {
    return (
      <div
        className="flex items-center justify-center rounded-full shrink-0"
        style={{
          width: 28, height: 28,
          background: 'var(--primary)',
        }}
      >
        <IconCheck />
      </div>
    )
  }
  if (isCurrent) {
    return (
      <div
        className="flex items-center justify-center rounded-full shrink-0"
        style={{
          width: 28, height: 28,
          background: 'var(--surface-raised)',
          border: '1.5px solid var(--border)',
        }}
      >
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />
      </div>
    )
  }
  if (isLocked) {
    return (
      <div
        className="flex items-center justify-center rounded-full shrink-0 text-muted"
        style={{
          width: 28, height: 28,
          background: 'rgba(248,250,252,1)',
          border: '1.5px solid rgba(200,214,232,0.8)',
        }}
      >
        <IconLock />
      </div>
    )
  }
  // upcoming
  return (
    <div
      className="flex items-center justify-center rounded-full shrink-0"
      style={{
        width: 28, height: 28,
        background: 'var(--surface-raised)',
        border: '1.5px solid var(--border)',
      }}
    >
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--muted)' }} />
    </div>
  )
}

function ModuleCard({
  module, isCompleted, isCurrent, isLocked,
}: Omit<ModuleStepItemProps, 'isLast'>) {
  const payload = module.content_payload as { title?: string; description?: string }
  const title = payload.title ?? `${tierLabel[module.tier_type]} · Stage ${module.stage_index + 1}`
  const description = payload.description ?? ''

  return (
    <div className={`module-card${isCurrent ? ' is-current' : ''}`}>
      {/* Header row: badge + action */}
      <div
        className="flex items-start justify-between gap-3"
        style={{ marginBottom: 10 }}
      >
        <div className="flex-1 min-w-0">
          {/* Type badge */}
          <div className="flex items-center gap-[7px] flex-wrap" style={{ marginBottom: 6 }}>
            <span
              className="font-mono-labels uppercase"
              style={{
                fontSize: 10,
                letterSpacing: '0.08em',
                padding: '2px 7px',
                borderRadius: 4,
                background: 'var(--surface-overlay)',
                color: 'var(--muted)',
              }}
            >
              {tierLabel[module.tier_type]}
            </span>
          </div>
          {/* Title */}
          <h3
            style={{
              fontSize: 15.5,
              fontWeight: 700,
              lineHeight: 1.25,
              letterSpacing: '-0.012em',
              color: isLocked ? 'var(--muted)' : 'var(--foreground)',
            }}
          >
            {title}
          </h3>
        </div>

        {/* Action: start button or completed indicator */}
        {isCurrent && (
          <button className="btn-cta-sm" style={{ marginTop: 2 }} type="button">
            Start <IconPlay />
          </button>
        )}
        {isCompleted && (
          <div
            className="flex items-center gap-[5px] shrink-0 font-mono-labels uppercase"
            style={{ fontSize: 11.5, color: 'var(--muted)', letterSpacing: '0.05em', marginTop: 2 }}
          >
            <IconCheckCyan /> Completed
          </div>
        )}
      </div>

      {/* Description */}
      {description && (
        <p
          className="text-secondary text-pretty"
          style={{ fontSize: 13.5, lineHeight: 1.6 }}
        >
          {description}
        </p>
      )}
    </div>
  )
}

export function ModuleStepItem({ module, isCompleted, isCurrent, isLocked, isLast }: ModuleStepItemProps) {
  const isUpcoming = !isCompleted && !isCurrent && !isLocked

  const cardContent = (
    <div style={{ display: 'flex', gap: 0 }}>
      {/* Left rail: circle + connector */}
      <div
        className="flex flex-col items-center shrink-0"
        style={{ width: 52 }}
      >
        <CircleIndicator
          isCompleted={isCompleted}
          isCurrent={isCurrent}
          isLocked={isLocked}
          isUpcoming={isUpcoming}
        />
        {!isLast && (
          <div
            style={{
              width: 1,
              flex: 1,
              minHeight: 20,
              marginTop: 4,
              background: 'var(--connector-color)',
            }}
          />
        )}
      </div>

      {/* Right: module card */}
      <div
        style={{
          flex: 1,
          paddingBottom: isLast ? 0 : 14,
          opacity: isLocked ? 0.5 : 1,
        }}
      >
        <ModuleCard
          module={module}
          isCompleted={isCompleted}
          isCurrent={isCurrent}
          isLocked={isLocked}
        />
      </div>
    </div>
  )

  if (isLocked) {
    return cardContent
  }

  return (
    <Link href={ROUTES.MODULE_DETAIL(module.track_id, module.id)} className="block">
      {cardContent}
    </Link>
  )
}

/* Re-export IconLeft for track detail page back link */
export { IconLeft }
