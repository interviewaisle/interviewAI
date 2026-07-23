import type { FastifyRequest, FastifyReply } from 'fastify'
import { sql } from '../db/client'

export function entitlementGuard() {
  return async function (req: FastifyRequest, reply: FastifyReply) {
    const body = req.body as { module_id?: string } | null
    const moduleId = body?.module_id

    if (!moduleId) {
      return reply.status(400).send({ error: 'VALIDATION_ERROR', message: 'module_id is required' })
    }

    // Look up the module's real stage server-side — never trust a client-supplied
    // stage_index, which lets a spoofed request bypass the Pro gate entirely.
    const [module] = await sql`
      SELECT stage_index FROM modules WHERE id = ${moduleId}
    `

    if (!module) {
      return reply.status(404).send({ error: 'MODULE_NOT_FOUND' })
    }

    // Stage 0-1 are free
    if (module.stage_index <= 1) return

    const [user] = await sql`
      SELECT subscription_status FROM users WHERE id = ${req.user.id}
    `

    if (!user || user.subscription_status !== 'ACTIVE_PRO') {
      // TODO Phase 4: generate real Stripe checkout session
      return reply.status(402).send({
        error: 'PAYMENT_REQUIRED',
        message: 'Stages 2-5 require a Pro subscription.',
        checkout_url: null,
      })
    }
  }
}
