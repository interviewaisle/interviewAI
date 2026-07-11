'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

import type { Module, TrackProgress, User, SubmissionFile } from '@/types'
import { MonacoEditor } from '@/components/editor/MonacoEditor'
import { CodingFileTabBar } from './CodingFileTabBar'
import { PaywallModal } from '@/components/ui/PaywallModal'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'
import { useWorkspace } from '@/store/workspace'
import { useExecution } from '@/hooks/useExecution'
import { useAutosave, loadDraft, clearDraft } from '@/hooks/useAutosave'
import { getNextModule } from '@/lib/moduleNav'
import Link from 'next/link'
import { PlatformHeader } from '@/components/layout'
import { ROUTES } from '@/constants'
import type { TerminalHandle } from '@/components/editor/Terminal'

const TerminalDynamic = dynamic(
  () => import('@/components/editor/Terminal').then((m) => m.Terminal),
  { ssr: false }
) as React.ForwardRefExoticComponent<
  { className?: string } & React.RefAttributes<TerminalHandle>
>

interface CodingModuleProps {
  module: Module
  allModules: Module[]
  progress: TrackProgress
  user: User
}

const STATUS_LABEL: Record<string, string> = {
  IDLE: 'Run',
  BUILDING: 'Building…',
  RUNNING: 'Running…',
  STREAMING: 'Running…',
  ERROR: 'Run',
}

export function CodingModule({ module, allModules }: CodingModuleProps) {
  const termRef = useRef<TerminalHandle | null>(null)
  const { activeFileId, setActiveFile, upsertFile, files } = useWorkspace()
  const { run, status } = useExecution(termRef)
  const [paywallMessage, setPaywallMessage] = useState<string | null>(null)
  const [hasDraft, setHasDraft] = useState(false)
  const [solved, setSolved] = useState(false)

  const nextModule = getNextModule(allModules, module.id)

  const { starter_files: starterFiles = [] } = module.content_payload as {
    starter_files?: SubmissionFile[]
    description?: string
  }
  const description =
    (module.content_payload as { description?: string }).description ?? ''

  useAutosave(module.id)

  useEffect(() => {
    if (starterFiles.length === 0) return
    const draft = loadDraft(module.id)
    const hasSaved = Object.keys(draft).length > 0
    setHasDraft(hasSaved)

    for (const file of starterFiles) {
      const savedContent = draft[file.name]
      upsertFile(file.name, {
        content: savedContent ?? file.content,
        isDirty: Boolean(savedContent),
        language: '',
      })
    }
    setActiveFile(starterFiles[0].name)
    // Only seed on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleResetDraft() {
    clearDraft(module.id)
    setHasDraft(false)
    for (const file of starterFiles) {
      upsertFile(file.name, { content: file.content, isDirty: false, language: '' })
    }
  }

  async function handleRun() {
    const currentFiles: SubmissionFile[] = starterFiles.map((f) => ({
      name: f.name,
      content: files[f.name]?.content ?? f.content,
    }))
    try {
      const result = await run(currentFiles, module.id, module.stage_index, module.track_id)
      // A clean run counts as completing the coding module.
      if (result?.exit_code === 0) {
        api.tracks.complete(module.track_id, module.id).catch(() => {})
        setSolved(true)
      }
    } catch (err) {
      const e = err as { status?: number; data?: { message?: string } }
      if (e.status === 402) {
        setPaywallMessage(e.data?.message ?? 'This module requires a Pro subscription.')
      }
    }
  }

  const isRunning = status === 'BUILDING' || status === 'RUNNING' || status === 'STREAMING'

  return (
    <div className="bg-surface flex h-screen flex-col overflow-hidden">
      <PlatformHeader
        position="static"
        center={
          <>
            <Link href={ROUTES.TRACK_DETAIL(module.track_id)} className="back-link shrink-0">← Track</Link>
            <span className="header-sep" />
            <span className="text-sm font-medium text-foreground truncate">Coding · Stage {module.stage_index + 1}</span>
            {hasDraft && (
              <span className="flex items-center gap-2 text-xs text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Draft restored
                <button
                  onClick={handleResetDraft}
                  className="text-xs text-muted underline underline-offset-2 hover:text-foreground"
                >
                  Reset
                </button>
              </span>
            )}
          </>
        }
        rightExtra={
          <div className="flex items-center gap-2">
            <Button
              variant={solved ? 'ghost' : 'primary'}
              isLoading={isRunning}
              disabled={isRunning}
              onClick={handleRun}
              className="text-xs"
            >
              {STATUS_LABEL[status] ?? 'Run'}
            </Button>
            {nextModule && (
              <Link
                href={ROUTES.MODULE_DETAIL(module.track_id, nextModule.id)}
                className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                  solved
                    ? 'bg-primary text-white hover:bg-primary-hover'
                    : 'border border-border text-foreground hover:bg-surface-raised'
                }`}
              >
                Next →
              </Link>
            )}
          </div>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-hidden">
          <CodingFileTabBar
            tabs={starterFiles.map((f) => ({ id: f.name, name: f.name }))}
            activeId={activeFileId}
            onSelect={setActiveFile}
          />
          <div className="flex-1 overflow-hidden">
            <MonacoEditor starterFiles={starterFiles} activeFileId={activeFileId} />
          </div>
          <div className="h-48 flex-shrink-0 border-t border-border">
            <TerminalDynamic ref={termRef} className="bg-surface" />
          </div>
        </div>

        <aside className="module-panel-right w-80 flex-shrink-0 overflow-y-auto p-4">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted font-mono-labels">
            Problem
          </h2>
          <p className="text-sm text-foreground">{description}</p>
        </aside>
      </div>

      {solved && (
        <div className="fade-in pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center">
          <div className="pointer-events-auto flex items-center gap-3 rounded-xl border border-success/40 bg-surface-raised px-5 py-3 shadow-xl">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-success/15 text-success">✓</span>
            <div>
              <p className="text-sm font-semibold text-foreground">Solved! +100 XP</p>
              <p className="text-xs text-muted">Your code ran clean — module complete.</p>
            </div>
            {nextModule && (
              <Link
                href={ROUTES.MODULE_DETAIL(module.track_id, nextModule.id)}
                className="ml-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-hover"
              >
                Next module →
              </Link>
            )}
            <button onClick={() => setSolved(false)} className="ml-1 text-muted hover:text-foreground" aria-label="Dismiss">✕</button>
          </div>
        </div>
      )}

      <PaywallModal
        isOpen={paywallMessage !== null}
        onClose={() => setPaywallMessage(null)}
        message={paywallMessage ?? ''}
      />
    </div>
  )
}
