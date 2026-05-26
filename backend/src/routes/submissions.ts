import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { authenticate } from '../middleware/auth'
import { entitlementGuard } from '../middleware/entitlement'

const runBody = z.object({
  module_id: z.string().uuid(),
  stage_index: z.number().int().min(0),
  track_id: z.string().uuid(),
  files: z.array(z.object({
    name: z.string().min(1),
    content: z.string(),
  })).min(1).max(20),
})

export async function submissionsRoutes(app: FastifyInstance) {
  app.post('/run', {
    preHandler: [authenticate, entitlementGuard()],
  }, async (req, reply) => {
    const parsed = runBody.safeParse(req.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'VALIDATION_ERROR', message: parsed.error.flatten() })
    }

    const executionId = randomUUID()

    // Phase 3: push to Redis job queue and boot sandbox VM
    // await jobQueue.push({ executionId, userId: req.user.id, ...parsed.data })

    return reply.status(202).send({
      execution_id: executionId,
      status: 'QUEUED',
    })
  })
}
