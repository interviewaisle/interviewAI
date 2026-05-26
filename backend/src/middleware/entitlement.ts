import type { FastifyRequest, FastifyReply } from 'fastify'
import { sql } from '../db/client'

export function entitlementGuard() {
  return async function (req: FastifyRequest, reply: FastifyReply) {
    const body = req.body as { stage_index?: number } | null
    const stageIndex = body?.stage_index ?? 0

    // Stage 0-1 are free
    if (stageIndex <= 1) return

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
