'use client'

import type { DualScore } from '@/types'
import { Modal } from '@/components/ui/Modal'

interface ScoreBarProps {
  label: string
  score: number
}

function ScoreBar({ label, score }: ScoreBarProps) {
  const color = score >= 75 ? 'bg-success' : score >= 50 ? 'bg-warning' : 'bg-destructive'
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted uppercase tracking-wider font-mono-labels">{label}</span>
        <span className="text-2xl font-bold text-foreground">{score}<span className="text-sm text-muted font-normal">/100</span></span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-overlay">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

interface InterviewScoreModalProps {
  scores: DualScore
  onClose: () => void
}

export function InterviewScoreModal({ scores, onClose }: InterviewScoreModalProps) {
  return (
    <Modal onClose={onClose} isOpen>
      <h2 className="mb-5 text-base font-semibold text-foreground">Interview Results</h2>
      <div className="flex flex-col gap-5">
        <ScoreBar label="Code Quality" score={scores.code_score} />
        <ScoreBar label="Prompt Engineering" score={scores.prompt_score} />

        <div className="rounded-lg bg-surface-raised border border-border p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1 font-mono-labels">Code Feedback</p>
          <p className="text-sm text-foreground leading-relaxed">{scores.code_feedback}</p>
        </div>

        <div className="rounded-lg bg-surface-raised border border-border p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1 font-mono-labels">Prompt Quality</p>
          <p className="text-sm text-foreground leading-relaxed">{scores.prompt_feedback}</p>
        </div>

        <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1 font-mono-labels">Overall</p>
          <p className="text-sm text-foreground leading-relaxed">{scores.overall_feedback}</p>
        </div>
      </div>
    </Modal>
  )
}
