-- AI chat logs: every message sent to / received from the AI assistant
CREATE TABLE IF NOT EXISTS ai_chat_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module_id   UUID        NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  role        TEXT        NOT NULL CHECK (role IN ('user', 'assistant')),
  content     TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ai_chat_logs_user_module ON ai_chat_logs (user_id, module_id, created_at);

-- Interview scores: one row per submit-and-score action
CREATE TABLE IF NOT EXISTS interview_scores (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module_id         UUID        NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  code_score        INTEGER     NOT NULL CHECK (code_score BETWEEN 0 AND 100),
  prompt_score      INTEGER     NOT NULL CHECK (prompt_score BETWEEN 0 AND 100),
  code_feedback     TEXT,
  prompt_feedback   TEXT,
  overall_feedback  TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS interview_scores_user_module ON interview_scores (user_id, module_id, created_at);
