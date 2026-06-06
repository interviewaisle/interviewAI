'use client'

import type { RefObject } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { simulateMockExecution } from '@/lib/mockRunner'
import { clearToken } from '@/lib/auth'
import { useWorkspace } from '@/store/workspace'
import { ROUTES } from '@/constants'
import type { SubmissionFile } from '@/types'
import type { Terminal as XTerm } from 'xterm'
import type { TerminalHandle } from '@/components/editor/Terminal'

export function useExecution(termRef: RefObject<TerminalHandle | null>) {
  const router = useRouter()
  const { status, setStatus } = useWorkspace()

  async function run(
    files: SubmissionFile[],
    moduleId: string,
    stageIndex: number,
    trackId: string
  ): Promise<void> {
    setStatus('BUILDING')
    try {
      await api.submissions.run({
        module_id: moduleId,
        stage_index: stageIndex,
        track_id: trackId,
        files,
      })
      setStatus('RUNNING')
      termRef.current?.clear()
      if (!termRef.current) return
      simulateMockExecution(termRef.current as unknown as XTerm, (exitStatus) => {
        setStatus(exitStatus === 'PASS' ? 'IDLE' : 'ERROR')
      })
    } catch (err) {
      const e = err as { status?: number }
      if (e.status === 402) {
        setStatus('IDLE')
        throw err
      } else if (e.status === 401) {
        clearToken()
        router.replace(ROUTES.LOGIN)
      } else {
        setStatus('ERROR')
      }
    }
  }

  return { run, status }
}
