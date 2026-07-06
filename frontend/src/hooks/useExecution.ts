'use client'

import type { RefObject } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { clearToken } from '@/lib/auth'
import { useWorkspace } from '@/store/workspace'
import { ROUTES } from '@/constants'
import type { SubmissionFile, SubmissionResult } from '@/types'
import type { TerminalHandle } from '@/components/editor/Terminal'

const RESET = '\x1b[0m'
const DIM = '\x1b[2m'
const RED = '\x1b[31m'
const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'

function toLines(text: string): string {
  return text.replace(/\n/g, '\r\n')
}

function renderOutput(term: TerminalHandle, result: SubmissionResult, filename: string) {
  term.write(`${DIM}$ ${result.language} ${filename}${RESET}\r\n`)

  if (result.status === 'COMPILE_ERROR') {
    term.write(`${RED}Compile error:\r\n${toLines(result.stderr)}${RESET}\r\n`)
    term.write(`${RED}✗ Compilation failed${RESET}\r\n`)
    return
  }

  if (result.stdout) {
    term.write(toLines(result.stdout))
    if (!result.stdout.endsWith('\n')) term.write('\r\n')
  }

  if (result.stderr) {
    term.write(`${RED}${toLines(result.stderr)}${RESET}`)
    if (!result.stderr.endsWith('\n')) term.write('\r\n')
  }

  if (result.status === 'TIMEOUT') {
    term.write(`${YELLOW}✗ Time limit exceeded (10s)${RESET}\r\n`)
  } else if (result.exit_code === 0) {
    term.write(`${GREEN}✓ Exited with code 0${RESET}\r\n`)
  } else {
    term.write(`${RED}✗ Exited with code ${result.exit_code}${RESET}\r\n`)
  }
}

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
    termRef.current?.clear()
    termRef.current?.write(`${DIM}Preparing sandbox…${RESET}\r\n`)

    try {
      const result = await api.submissions.run({
        module_id: moduleId,
        stage_index: stageIndex,
        track_id: trackId,
        files,
      })

      setStatus('RUNNING')
      termRef.current?.clear()
      if (termRef.current) renderOutput(termRef.current, result, files[0].name)
      setStatus(result.exit_code === 0 ? 'IDLE' : 'ERROR')
    } catch (err) {
      const e = err as { status?: number; data?: { message?: string } }
      if (e.status === 402) {
        setStatus('IDLE')
        throw err
      } else if (e.status === 401) {
        clearToken()
        router.replace(ROUTES.LOGIN)
      } else {
        setStatus('ERROR')
        termRef.current?.write(`${RED}✗ Execution service unavailable${RESET}\r\n`)
      }
    }
  }

  return { run, status }
}
