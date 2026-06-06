'use client'

import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { useModuleCompletion } from '@/hooks/useModuleCompletion'
import { Button } from '@/components/ui'
import { PlatformHeader } from '@/components/layout'
import { ModuleSidebar } from './ModuleSidebar'
import { ROUTES } from '@/constants'
import type { Module, TrackProgress, User } from '@/types'

interface ConceptModuleProps {
  module: Module
  allModules: Module[]
  progress: TrackProgress
  user: User
}

function CompleteIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
    </svg>
  )
}

export function ConceptModule({ module, allModules, progress, user }: ConceptModuleProps) {
  const { isCompleted, markComplete } = useModuleCompletion(
    progress.completed_modules.includes(module.id)
  )

  const effectiveCompleted =
    isCompleted && !progress.completed_modules.includes(module.id)
      ? [...progress.completed_modules, module.id]
      : progress.completed_modules

  const content = (module.content_payload as { content?: string }).content ?? ''

  return (
    <div className="bg-surface flex h-screen flex-col overflow-hidden">
      <PlatformHeader
        position="static"
        center={
          <>
            <Link href={ROUTES.TRACK_DETAIL(module.track_id)} className="back-link shrink-0">← Track</Link>
            <span className="header-sep" />
            <span className="text-sm font-medium text-foreground truncate">Concept · Stage {module.stage_index + 1}</span>
          </>
        }
      />
      <div className="flex flex-1 overflow-hidden">
        <ModuleSidebar
          allModules={allModules}
          currentModuleId={module.id}
          completedIds={effectiveCompleted}
          user={user}
        />
        <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-8 py-10">
          <article className="prose dark:prose-invert max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </article>
          <div className="mt-10 border-t border-border pt-8">
            {isCompleted ? (
              <p className="flex items-center gap-2 text-sm text-success">
                <CompleteIcon />
                Marked as complete
              </p>
            ) : (
              <Button variant="primary" onClick={markComplete}>
                Mark Complete
              </Button>
            )}
          </div>
        </div>
        </main>
      </div>
    </div>
  )
}
