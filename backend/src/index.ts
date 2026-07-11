import Fastify from 'fastify'
import cors from '@fastify/cors'
import websocket from '@fastify/websocket'
import { config } from './config'
import { sql } from './db/client'
import { authRoutes } from './routes/auth'
import { submissionsRoutes } from './routes/submissions'
import { tracksRoutes } from './routes/tracks'
import { simulatorRoutes } from './routes/simulator'
import { interviewRoutes } from './routes/interview'
import { profileRoutes } from './routes/profile'
import { startHydrationWorker } from './workers/hydration'

const server = Fastify({ logger: true })

const allowedOrigins = config.CORS_ORIGIN.split(',').map((o) => o.trim())
// Allow the configured origins plus any Vercel URL for this project (production
// alias + per-deployment preview URLs). Safe because auth is a Bearer token in
// localStorage, not a cookie — a foreign origin can't read it cross-site.
server.register(cors, {
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
      return cb(null, true)
    }
    cb(new Error('Not allowed by CORS'), false)
  },
  credentials: true,
})
server.register(websocket)

server.register(authRoutes, { prefix: '/api/v1/auth' })
server.register(submissionsRoutes, { prefix: '/api/v1/submissions' })
server.register(tracksRoutes, { prefix: '/api/v1/tracks' })
server.register(simulatorRoutes, { prefix: '/api/v1/simulator' })
server.register(interviewRoutes, { prefix: '/api/v1/interview' })
server.register(profileRoutes, { prefix: '/api/v1/profile' })

server.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

server.get('/health/db', async (_req, reply) => {
  try {
    await sql`SELECT 1`
    return { status: 'ok', database: 'connected' }
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string }
    server.log.error({ code: e.code, message: e.message }, 'DB health check failed')
    return reply.status(500).send({ status: 'error', code: e.code, message: e.message })
  }
})

server.listen({ port: config.PORT, host: '0.0.0.0' }, async (err) => {
  if (err) {
    server.log.error(err)
    process.exit(1)
  }

  // Verify DB connection on startup
  try {
    await sql`SELECT 1`
    server.log.info('Database connection OK')
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string }
    server.log.error({ code: e.code, message: e.message }, 'DATABASE CONNECTION FAILED — check DATABASE_URL in .env')
  }

  startHydrationWorker()
  server.log.info('Hydration worker started (10s interval)')
})
