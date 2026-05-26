import postgres from 'postgres'
import { config } from '../config'

export const sql = postgres(config.DATABASE_URL, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  // Supabase transaction pooler requires this
  prepare: false,
})
