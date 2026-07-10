import type { FastifyInstance } from 'fastify'
import { authenticate } from '../middleware/auth'
import { sql } from '../db/client'

export async function tracksRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: authenticate }, async (req, reply) => {
    const tracks = await sql`
      SELECT id, name, description, created_at
      FROM tracks
      ORDER BY created_at ASC
    `
    return reply.send(tracks)
  })

  app.get('/:trackId/progress', { preHandler: authenticate }, async (req, reply) => {
    const { trackId } = req.params as { trackId: string }

    const progress = await sql`
      SELECT
        up.module_id,
        up.completed_at,
        m.stage_index
      FROM user_progress up
      JOIN modules m ON m.id = up.module_id
      WHERE up.user_id = ${req.user.id}
        AND m.track_id = ${trackId}
      ORDER BY m.stage_index ASC
    `

    const completedModules = progress.map(p => p.module_id as string)
    const currentStage = progress.length > 0
      ? Math.max(...progress.map(p => p.stage_index as number)) + 1
      : 0

    return reply.send({ completed_modules: completedModules, current_stage: currentStage })
  })

  app.get('/:trackId/modules', { preHandler: authenticate }, async (req, reply) => {
    const { trackId } = req.params as { trackId: string }

    const modules = await sql`
      SELECT id, track_id, stage_index, tier_type, company_tags, content_payload, created_at
      FROM modules
      WHERE track_id = ${trackId}
      ORDER BY stage_index ASC
    `

    return reply.send(modules)
  })

  // Persist a module completion (idempotent).
  app.post('/:trackId/modules/:moduleId/complete', { preHandler: authenticate }, async (req, reply) => {
    const { moduleId } = req.params as { trackId: string; moduleId: string }
    try {
      await sql`
        INSERT INTO user_progress (user_id, module_id)
        VALUES (${req.user.id}, ${moduleId})
        ON CONFLICT (user_id, module_id) DO NOTHING
      `
      return reply.send({ ok: true, module_id: moduleId })
    } catch (err) {
      app.log.error(err, 'Failed to record completion')
      return reply.status(500).send({ error: 'COMPLETION_FAILED' })
    }
  })
}
