-- Add an editable display name for account settings / leaderboard.
-- Nullable: falls back to email in the frontend when unset.

ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name VARCHAR(50);
