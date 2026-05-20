import Redis from 'ioredis'
import { config } from '../config'

export const redis = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  enableReadyCheck: true,
})

redis.on('error', (err: Error) => {
  console.error('[Redis] connection error:', err.message)
})
