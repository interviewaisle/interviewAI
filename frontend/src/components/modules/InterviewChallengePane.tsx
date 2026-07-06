'use client'

import ReactMarkdown from 'react-markdown'
import { Badge } from '@/components/ui/Badge'

const DIFFICULTY_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
  EASY: 'success',
  MEDIUM: 'warning',
  HARD: 'destructive',
}

interface InterviewChallengePaneProps {
  title: string
  difficulty: string
  description: string
}

export function InterviewChallengePane({ title, difficulty, description }: InterviewChallengePaneProps) {
  return (
    <aside className="flex h-full w-80 flex-shrink-0 flex-col overflow-hidden border-r border-border">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <h2 className="flex-1 truncate text-sm font-semibold text-foreground">{title}</h2>
        <Badge variant={DIFFICULTY_VARIANT[difficulty] ?? 'default'}>{difficulty}</Badge>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="prose prose-sm dark:prose-invert max-w-none text-foreground">
          <ReactMarkdown>{description}</ReactMarkdown>
        </div>
      </div>
    </aside>
  )
}
