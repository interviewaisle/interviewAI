import { createClient } from '@supabase/supabase-js'
import { config } from '../config'

// Service role client — bypasses RLS, never expose to client
export const supabaseAdmin = createClient(
  config.SUPABASE_URL,
  config.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)
