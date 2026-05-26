import type { FastifyInstance } from 'fastify'
import { supabaseAdmin } from '../lib/supabase'
import { LeakyBucket } from '../simulation/leakyBucket'
import { loadOrCreateSession, saveSession } from '../simulation/session'
import { recalculateMetrics } from '../simulation/engine'
import type { InfrastructureState } from '../simulation/engine'

type MutableKey = keyof InfrastructureState

const MUTABLE_KEYS = new Set<string>([
  'chunk_size',
  'chunk_overlap',
  'embedding_model',
  'vector_index_type',
  'cache_enabled',
])

interface MutateConfigMessage {
  action: 'MUTATE_CONFIG'
  key: MutableKey
  value: string | number | boolean
}

function isMutateConfig(msg: unknown): msg is MutateConfigMessage {
  if (typeof msg !== 'object' || msg === null) return false
  const m = msg as Record<string, unknown>
  return m.action === 'MUTATE_CONFIG' && typeof m.key === 'string' && MUTABLE_KEYS.has(m.key)
}

export async function simulatorRoutes(app: FastifyInstance) {
  // WS /api/v1/simulator/stream?token=<jwt>&moduleId=<uuid>
  app.get('/stream', { websocket: true }, async (socket, req) => {
    const query = req.query as Record<string, string>
    const { token, moduleId } = query

    if (!token) {
      socket.close(1008, 'Missing token')
      return
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    if (error || !user) {
      socket.close(1008, 'Unauthorized')
      return
    }

    // Load or hydrate session — Redis → Postgres → cold start
    const session = await loadOrCreateSession(user.id, moduleId ?? 'default')
    const bucket = new LeakyBucket(50)

    // Send current state immediately so the UI doesn't wait for a mutation
    socket.send(JSON.stringify({
      type: 'STATE_SYNC',
      metrics: session.metrics,
    }))

    socket.on('message', async (raw: Buffer) => {
      let msg: unknown
      try {
        msg = JSON.parse(raw.toString())
      } catch {
        return
      }

      if (!isMutateConfig(msg)) return

      // Apply mutation to infra state
      ;(session.infrastructure_state as unknown as Record<string, unknown>)[msg.key] = msg.value

      // Deterministically recalculate all metrics from the new state
      session.metrics = recalculateMetrics(session.infrastructure_state)

      // Persist to Redis — fire-and-forget, hydration worker handles Postgres
      saveSession(session).catch(err =>
        req.log.error({ err }, '[Simulator] session save failed')
      )

      // Push through leaky bucket — drops intermediate frames under backpressure
      bucket.push({ type: 'STATE_SYNC', metrics: session.metrics }, (data) => {
        if (socket.readyState === socket.OPEN) {
          socket.send(data)
        }
      })
    })

    socket.on('close', () => {
      bucket.destroy()
      req.log.info({ userId: user.id, moduleId, event: 'simulator_disconnected' })
    })
  })
}
