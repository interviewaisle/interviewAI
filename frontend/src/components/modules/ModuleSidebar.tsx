import Link from 'next/link'
import { ROUTES } from '@/constants'
import type { Module, User } from '@/types'

interface ModuleSidebarProps {
  allModules: Module[]
  currentModuleId: string
  completedIds: string[]
  user: User
}

const tierLabel: Record<Module['tier_type'], string> = {
  CONCEPT: 'Concept',
  CODING: 'Coding',
  SIMULATOR: 'Simulator',
  INTERVIEW: 'Interview',
}

function SmallCheck() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
    </svg>
  )
}

export function ModuleSidebar({ allModules, currentModuleId, completedIds, user }: ModuleSidebarProps) {
  const isFree = user.subscription_status === 'FREE'

  return (
    <aside className="module-sidebar w-64 shrink-0 overflow-y-auto">
      <div className="p-4">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted font-mono-labels">
          Modules
        </h2>
        <nav className="space-y-0.5">
          {allModules.map(mod => {
            const isLocked = isFree && mod.stage_index > 1
            const isCompleted = completedIds.includes(mod.id)
            const isCurrent = mod.id === currentModuleId

            const rowClass = [
              'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
              isLocked
                ? 'cursor-not-allowed opacity-50 text-muted'
                : isCurrent
                  ? 'bg-surface-overlay text-accent font-medium'
                  : isCompleted
                    ? 'text-success hover:bg-surface-overlay cursor-pointer'
                    : 'text-foreground hover:bg-surface-overlay cursor-pointer',
            ].join(' ')

            const indicator = isCompleted ? (
              <span className="flex h-4 w-4 shrink-0 items-center justify-center text-success">
                <SmallCheck />
              </span>
            ) : (
              <span className="flex h-4 w-4 shrink-0 items-center justify-center text-xs text-muted">
                {mod.stage_index + 1}
              </span>
            )

            const label = `${tierLabel[mod.tier_type]} · Stage ${mod.stage_index + 1}`

            const inner = (
              <div className={rowClass}>
                {indicator}
                <span className="truncate">{label}</span>
              </div>
            )

            if (isLocked) return <div key={mod.id}>{inner}</div>
            return (
              <Link key={mod.id} href={ROUTES.MODULE_DETAIL(mod.track_id, mod.id)}>
                {inner}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
