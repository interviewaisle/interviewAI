import Fastify from 'fastify'
import cors from '@fastify/cors'
import websocket from '@fastify/websocket'
import { config } from './config'
import { authRoutes } from './routes/auth'
import { submissionsRoutes } from './routes/submissions'
import { tracksRoutes } from './routes/tracks'
import { simulatorRoutes } from './routes/simulator'
import { startHydrationWorker } from './workers/hydration'

const server = Fastify({ logger: true })

server.register(cors, { origin: config.CORS_ORIGIN, credentials: true })
server.register(websocket)

server.register(authRoutes, { prefix: '/api/v1/auth' })
server.register(submissionsRoutes, { prefix: '/api/v1/submissions' })
server.register(tracksRoutes, { prefix: '/api/v1/tracks' })
server.register(simulatorRoutes, { prefix: '/api/v1/simulator' })

server.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

server.listen({ port: config.PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    server.log.error(err)
    process.exit(1)
  }

  startHydrationWorker()
  server.log.info('Hydration worker started (10s interval)')
})
