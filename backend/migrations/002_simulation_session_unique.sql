-- Required for ON CONFLICT upserts in the hydration worker.
-- Run this in Supabase SQL Editor after 001_initial_schema.sql.

ALTER TABLE active_simulation_sessions
ADD CONSTRAINT uq_simulation_session UNIQUE (user_id, module_id);
