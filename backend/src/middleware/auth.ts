import type { FastifyRequest, FastifyReply } from 'fastify'
import type { User } from '@supabase/supabase-js'
import { supabaseAdmin } from '../lib/supabase'

export async function authenticate(req: FastifyRequest, reply: FastifyReply) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'UNAUTHORIZED', message: 'Missing Bearer token' })
  }

  const token = authHeader.slice(7)
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

  if (error || !user) {
    return reply.status(401).send({ error: 'UNAUTHORIZED', message: 'Invalid or expired token' })
  }

  req.user = user
}

declare module 'fastify' {
  interface FastifyRequest {
    user: User
  }
}
