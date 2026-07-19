import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { supabaseAdmin } from '../lib/supabase'
import { authenticate } from '../middleware/auth'
import { sql } from '../db/client'

const signupBody = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const loginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const updateMeBody = z.object({
  display_name: z.string().trim().min(1).max(50),
})

const changePasswordBody = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function authRoutes(app: FastifyInstance) {
  app.post('/signup', async (req, reply) => {
    const parsed = signupBody.safeParse(req.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'VALIDATION_ERROR', message: parsed.error.flatten() })
    }
    const { email, password } = parsed.data

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (error) {
      return reply.status(400).send({ error: 'SIGNUP_FAILED', message: error.message })
    }

    // Mirror user into our users table so we can store subscription status
    await sql`
      INSERT INTO users (id, email)
      VALUES (${data.user.id}, ${data.user.email!})
      ON CONFLICT (id) DO NOTHING
    `

    return reply.status(201).send({ user_id: data.user.id })
  })

  app.post('/login', async (req, reply) => {
    const parsed = loginBody.safeParse(req.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'VALIDATION_ERROR', message: parsed.error.flatten() })
    }
    const { email, password } = parsed.data

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password })

    if (error) {
      return reply.status(401).send({ error: 'LOGIN_FAILED', message: error.message })
    }

    return reply.send({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
    })
  })

  // Returns the authenticated user's profile from our users table
  app.get('/me', { preHandler: authenticate }, async (req, reply) => {
    const [user] = await sql`
      SELECT id, email, display_name, subscription_status, created_at
      FROM users
      WHERE id = ${req.user.id}
    `

    if (!user) {
      return reply.status(404).send({ error: 'USER_NOT_FOUND' })
    }

    return reply.send(user)
  })

  app.patch('/me', { preHandler: authenticate }, async (req, reply) => {
    const parsed = updateMeBody.safeParse(req.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'VALIDATION_ERROR', message: parsed.error.flatten() })
    }

    const [user] = await sql`
      UPDATE users
      SET display_name = ${parsed.data.display_name}
      WHERE id = ${req.user.id}
      RETURNING id, email, display_name, subscription_status, created_at
    `

    if (!user) {
      return reply.status(404).send({ error: 'USER_NOT_FOUND' })
    }

    return reply.send(user)
  })

  app.post('/me/password', { preHandler: authenticate }, async (req, reply) => {
    const parsed = changePasswordBody.safeParse(req.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'VALIDATION_ERROR', message: parsed.error.flatten() })
    }
    const { current_password, new_password } = parsed.data
    if (!req.user.email) {
      return reply.status(400).send({ error: 'NO_EMAIL', message: 'Account has no email on file.' })
    }

    const { error: verifyError } = await supabaseAdmin.auth.signInWithPassword({
      email: req.user.email,
      password: current_password,
    })
    if (verifyError) {
      return reply.status(401).send({ error: 'INVALID_PASSWORD', message: 'Current password is incorrect.' })
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(req.user.id, {
      password: new_password,
    })
    if (updateError) {
      return reply.status(400).send({ error: 'PASSWORD_UPDATE_FAILED', message: updateError.message })
    }

    return reply.send({ ok: true })
  })
}
