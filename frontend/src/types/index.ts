export interface User {
  id: string
  email: string
  subscription_status: 'FREE' | 'ACTIVE_PRO' | 'CANCELLED'
  created_at: string
}

export interface Track {
  id: string
  name: string
  description: string | null
  created_at: string
}

export interface Module {
  id: string
  track_id: string
  stage_index: number
  tier_type: 'CONCEPT' | 'CODING' | 'SIMULATOR' | 'INTERVIEW'
  company_tags: string[]
  content_payload: Record<string, unknown>
  created_at: string
}

export interface TrackProgress {
  completed_modules: string[]
  current_stage: number
}

export interface SimulationMetrics {
  latencyMs: number
  tokenSpendUsd: number
  errorRate: number
  cacheHitRatio: number
}

export interface SubmissionFile {
  name: string
  content: string
}

export interface SubmissionBody {
  module_id: string
  stage_index: number
  track_id: string
  files: SubmissionFile[]
}

export type ExecutionStatus = 'IDLE' | 'BUILDING' | 'RUNNING' | 'STREAMING' | 'ERROR'

export type ExitStatus = 'PASS' | 'RUNTIME_ERROR' | 'TIME_LIMIT_EXCEEDED' | 'OUT_OF_MEMORY'

export interface SubmissionResult {
  execution_id: string
  status: 'COMPLETED' | 'COMPILE_ERROR' | 'RUNTIME_ERROR' | 'TIMEOUT'
  language: string
  version: string
  stdout: string
  stderr: string
  exit_code: number
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface DualScore {
  code_score: number
  prompt_score: number
  code_feedback: string
  prompt_feedback: string
  overall_feedback: string
  /** AI-usage stats — present when the backend has token data for the session */
  total_tokens?: number
  turn_count?: number
}

export interface ProfileStats {
  xp: number
  level: number
  xp_into_level: number
  xp_for_next_level: number
  streak_days: number
  modules_completed: number
  interviews_taken: number
  best_code_score: number | null
  best_prompt_score: number | null
  tracks: { track_id: string; name: string; completed: number; total: number; pct: number }[]
  badges: { id: string; label: string; description: string; earned: boolean }[]
  activity: { type: 'module' | 'interview'; label: string; at: string }[]
}

export type WsFrame =
  | {
      type: 'STATE_SYNC'
      metrics: {
        latency_ms: number
        token_spend_usd: number
        error_rate_percentage: number
        cache_hit_ratio: number
      }
    }
  | { type: 'STDOUT'; data: string }
  | { type: 'STDERR'; data: string }
  | { type: 'EXIT'; code: number; status: ExitStatus }
