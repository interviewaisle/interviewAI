import { randomUUID } from 'crypto'
import { redis } from '../redis/client'
import { sql } from '../db/client'
import { DEFAULT_INFRA, recalculateMetrics } from './engine'
import type { InfrastructureState, SimulationMetrics } from './engine'

export interface SessionState {
  session_id: string
  user_id: string
  module_id: string
  infrastructure_state: InfrastructureState
  metrics: SimulationMetrics
}

const SESSION_TTL_SECONDS = 3600

function redisKey(userId: string, moduleId: string): string {
  return `sim:session:${userId}:${moduleId}`
}

export async function loadOrCreateSession(
  userId: string,
  moduleId: string
): Promise<SessionState> {
  const key = redisKey(userId, moduleId)

  // 1. Redis — hot path
  const cached = await redis.get(key)
  if (cached) {
    return JSON.parse(cached) as SessionState
  }

  // 2. Postgres — warm path (page reload after TTL)
  const [row] = await sql`
    SELECT state_snapshot
    FROM active_simulation_sessions
    WHERE user_id = ${userId} AND module_id = ${moduleId}
    LIMIT 1
  `

  if (row?.state_snapshot) {
    const state = row.state_snapshot as SessionState
    await redis.setex(key, SESSION_TTL_SECONDS, JSON.stringify(state))
    return state
  }

  // 3. Cold start — build default session
  const infra = { ...DEFAULT_INFRA }
  const state: SessionState = {
    session_id: randomUUID(),
    user_id: userId,
    module_id: moduleId,
    infrastructure_state: infra,
    metrics: recalculateMetrics(infra),
  }

  await redis.setex(key, SESSION_TTL_SECONDS, JSON.stringify(state))
  return state
}

export async function saveSession(state: SessionState): Promise<void> {
  const key = redisKey(state.user_id, state.module_id)
  await redis.setex(key, SESSION_TTL_SECONDS, JSON.stringify(state))
}

export async function persistSessionToDb(state: SessionState): Promise<void> {
  await sql`
    INSERT INTO active_simulation_sessions (user_id, module_id, state_snapshot, updated_at)
    VALUES (${state.user_id}, ${state.module_id}, ${JSON.stringify(state)}::jsonb, NOW())
    ON CONFLICT ON CONSTRAINT uq_simulation_session
    DO UPDATE SET
      state_snapshot = EXCLUDED.state_snapshot,
      updated_at     = NOW()
  `
}
