import { redis } from '../redis/client'
import { persistSessionToDb } from '../simulation/session'
import type { SessionState } from '../simulation/session'

const INTERVAL_MS = 10_000

/**
 * Every 10s, scan all active simulation sessions in Redis and upsert them to
 * Postgres. This ensures state survives a server restart and enables page-reload
 * hydration from the DB when the Redis TTL has expired.
 */
export function startHydrationWorker(): ReturnType<typeof setInterval> {
  return setInterval(async () => {
    let keys: string[]
    try {
      keys = await redis.keys('sim:session:*')
    } catch {
      return // Redis unavailable — skip this tick silently
    }

    if (keys.length === 0) return

    // Batch-fetch all session values in one round trip
    const pipeline = redis.pipeline()
    keys.forEach(k => pipeline.get(k))
    const results = await pipeline.exec()

    if (!results) return

    const sessions = results
      .map(([err, val]) => {
        if (err || !val) return null
        try { return JSON.parse(val as string) as SessionState } catch { return null }
      })
      .filter((s): s is SessionState => s !== null)

    // Upsert each session — errors are logged but don't crash the worker
    await Promise.allSettled(
      sessions.map(s =>
        persistSessionToDb(s).catch(err =>
          console.error('[Hydration] failed to persist session', s.session_id, err?.message)
        )
      )
    )
  }, INTERVAL_MS)
}
