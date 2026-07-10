-- Token-usage assessment: capture real token counts per AI turn and per score.
-- Run in the Supabase SQL Editor after 001–006.

-- Per-message token usage (stored on the assistant row for each turn).
ALTER TABLE ai_chat_logs ADD COLUMN IF NOT EXISTS prompt_tokens INTEGER;
ALTER TABLE ai_chat_logs ADD COLUMN IF NOT EXISTS completion_tokens INTEGER;

-- Aggregate AI-usage stats captured at submit/evaluate time.
ALTER TABLE interview_scores ADD COLUMN IF NOT EXISTS total_tokens INTEGER;
ALTER TABLE interview_scores ADD COLUMN IF NOT EXISTS turn_count INTEGER;
