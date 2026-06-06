'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

import type { Module, TrackProgress, User, SubmissionFile } from '@/types'
import { MonacoEditor } from '@/components/editor/MonacoEditor'
import { CodingFileTabBar } from './CodingFileTabBar'
import { PaywallModal } from '@/components/ui/PaywallModal'
import { Button } from '@/components/ui/Button'
import { useWorkspace } from '@/store/workspace'
import { useExecution } from '@/hooks/useExecution'
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

export function CodingModule({ module }: CodingModuleProps) {
  const termRef = useRef<TerminalHandle | null>(null)
  const { activeFileId, setActiveFile, upsertFile, files } = useWorkspace()
  const { run, status } = useExecution(termRef)
  const [paywallMessage, setPaywallMessage] = useState<string | null>(null)

  const { starter_files: starterFiles = [] } = module.content_payload as {
    starter_files?: SubmissionFile[]
    description?: string
  }
  const description =
    (module.content_payload as { description?: string }).description ?? ''

  useEffect(() => {
    if (starterFiles.length === 0) return
    for (const file of starterFiles) {
      upsertFile(file.name, { content: file.content, isDirty: false, language: '' })
    }
    setActiveFile(starterFiles[0].name)
    // Only seed on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleRun() {
    const currentFiles: SubmissionFile[] = starterFiles.map((f) => ({
      name: f.name,
      content: files[f.name]?.content ?? f.content,
    }))
    try {
      await run(currentFiles, module.id, module.stage_index, module.track_id)
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
          </>
        }
        rightExtra={
          <Button
            variant="primary"
            isLoading={isRunning}
            disabled={isRunning}
            onClick={handleRun}
            className="text-xs"
          >
            {STATUS_LABEL[status] ?? 'Run'}
          </Button>
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

      <PaywallModal
        isOpen={paywallMessage !== null}
        onClose={() => setPaywallMessage(null)}
        message={paywallMessage ?? ''}
      />
    </div>
  )
}
