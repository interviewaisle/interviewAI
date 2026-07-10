'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import type { Module, TrackProgress, User, SubmissionFile, DualScore } from '@/types'
import { MonacoEditor } from '@/components/editor/MonacoEditor'
import { Button } from '@/components/ui/Button'
import { PlatformHeader } from '@/components/layout'
import { useWorkspace } from '@/store/workspace'
import { useInterviewChat } from '@/hooks/useInterviewChat'
import { api } from '@/lib/api'
import { ROUTES } from '@/constants'
import { InterviewChallengePane } from './InterviewChallengePane'
import { InterviewAISidebar } from './InterviewAISidebar'
import { InterviewScoreModal } from './InterviewScoreModal'

const MonacoDynamic = dynamic(
  () => import('@/components/editor/MonacoEditor').then(m => m.MonacoEditor),
  { ssr: false }
) as typeof MonacoEditor

interface InterviewModuleProps {
  module: Module
  allModules: Module[]
  progress: TrackProgress
  user: User
}

interface ChallengePayload {
  title?: string
  difficulty?: string
  description?: string
  buggy_code?: string
  language?: string
}

export function InterviewModule({ module }: InterviewModuleProps) {
  const { upsertFile, files } = useWorkspace()
  const { messages, isStreaming, sendMessage } = useInterviewChat()
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [scores, setScores] = useState<DualScore | null>(null)
  const seededRef = useRef(false)

  const payload = module.content_payload as ChallengePayload
  const title = payload.title ?? 'Interview Challenge'
  const difficulty = payload.difficulty ?? 'MEDIUM'
  const description = payload.description ?? ''
  const buggyCode = payload.buggy_code ?? ''
  const language = payload.language ?? 'python'
  const fileName = `solution.${language === 'python' ? 'py' : language}`

  const starterFiles: SubmissionFile[] = [{ name: fileName, content: buggyCode }]

  useEffect(() => {
    if (seededRef.current) return
    seededRef.current = true
    upsertFile(fileName, { content: buggyCode, isDirty: false, language })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleEvaluate() {
    setIsEvaluating(true)
    try {
      const currentCode = files[fileName]?.content ?? buggyCode
      const result = await api.interview.evaluate({
        module_id: module.id,
        code: currentCode,
        chat_logs: messages,
      })
      setScores(result)
      // Scoring the interview counts as completing the module.
      api.tracks.complete(module.track_id, module.id).catch(() => {})
    } catch {
      // silent — user can retry
    } finally {
      setIsEvaluating(false)
    }
  }

  return (
    <div className="bg-surface flex h-screen flex-col overflow-hidden">
      <PlatformHeader
        position="static"
        center={
          <>
            <Link href={ROUTES.TRACK_DETAIL(module.track_id)} className="back-link shrink-0">← Track</Link>
            <span className="header-sep" />
            <span className="text-sm font-medium text-foreground truncate">Interview · Stage {module.stage_index + 1}</span>
          </>
        }
        rightExtra={
          <Button
            variant="primary"
            onClick={handleEvaluate}
            disabled={isEvaluating || messages.length === 0}
            isLoading={isEvaluating}
            className="text-xs"
          >
            Submit &amp; Score
          </Button>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        <InterviewChallengePane title={title} difficulty={difficulty} description={description} />

        <div className="flex flex-1 overflow-hidden">
          <MonacoDynamic starterFiles={starterFiles} activeFileId={fileName} />
        </div>

        <InterviewAISidebar
          messages={messages}
          isStreaming={isStreaming}
          moduleId={module.id}
          onSendMessage={sendMessage}
        />
      </div>

      {scores && (
        <InterviewScoreModal scores={scores} onClose={() => setScores(null)} />
      )}
    </div>
  )
}
