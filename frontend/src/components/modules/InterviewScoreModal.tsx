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

function UsagePanel({ totalTokens, turnCount }: { totalTokens: number; turnCount: number }) {
  const avg = turnCount > 0 ? Math.round(totalTokens / turnCount) : 0
  const stats = [
    { label: 'Tokens used', value: totalTokens.toLocaleString() },
    { label: 'Chat turns', value: String(turnCount) },
    { label: 'Avg / turn', value: avg.toLocaleString() },
  ]
  return (
    <div className="rounded-lg border border-border bg-surface-raised p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted font-mono-labels">AI Usage</p>
      <div className="grid grid-cols-3 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col">
            <span className="text-lg font-bold text-foreground">{s.value}</span>
            <span className="text-[11px] text-muted">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function InterviewScoreModal({ scores, onClose }: InterviewScoreModalProps) {
  return (
    <Modal onClose={onClose} isOpen>
      <h2 className="mb-5 text-base font-semibold text-foreground">Interview Results</h2>
      <div className="flex flex-col gap-5">
        <ScoreBar label="Code Quality" score={scores.code_score} />
        <ScoreBar label="Prompt Engineering" score={scores.prompt_score} />

        {scores.total_tokens !== undefined && scores.turn_count !== undefined && (
          <UsagePanel totalTokens={scores.total_tokens} turnCount={scores.turn_count} />
        )}

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
