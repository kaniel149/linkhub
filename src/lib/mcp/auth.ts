import { createClient, SupabaseClient } from '@supabase/supabase-js'

/**
 * MCP API Key Authentication
 *
 * Validates Bearer tokens in the format `lh_xxx...` against hashed keys
 * stored in the `api_keys` table. Enforces rate limits (per hour) and
 * tracks usage timestamps.
 */

// Lazy-initialised so the module can be imported at build time
// (SUPABASE_SERVICE_ROLE_KEY is only available at runtime on Vercel).
let _supabaseAdmin: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )
  }
  return _supabaseAdmin
}

export interface AuthResult {
  valid: boolean
  profileId?: string
  username?: string
  permissions?: string[]
  error?: string
}

/**
 * Hash a raw API key with SHA-256 for secure lookup.
 */
async function hashKey(rawKey: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(rawKey)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Validate an API key from the Authorization header.
 *
 * Flow:
 *  1. Extract Bearer token
 *  2. Verify `lh_` prefix
 *  3. SHA-256 hash and look up in `api_keys` table
 *  4. Check active status
 *  5. Enforce hourly rate limit via `api_rate_limits` table
 *  6. Record usage (fire-and-forget)
 *  7. Resolve username from `profiles` table
 */
export async function validateApiKey(
  authHeader: string | null
): Promise<AuthResult> {
  if (!authHeader?.startsWith('Bearer ')) {
    return { valid: false, error: 'Missing or invalid Authorization header' }
  }

  const rawKey = authHeader.slice(7)
  if (!rawKey.startsWith('lh_')) {
    return { valid: false, error: 'Invalid key format' }
  }

  const db = getSupabaseAdmin()
  const keyHash = await hashKey(rawKey)

  const { data: apiKey, error } = await db
    .from('api_keys')
    .select('id, profile_id, permissions, rate_limit, is_active')
    .eq('key_hash', keyHash)
    .single()

  if (error || !apiKey) {
    return { valid: false, error: 'Invalid API key' }
  }

  if (!apiKey.is_active) {
    return { valid: false, error: 'API key is deactivated' }
  }

  // Check rate limit: count requests in the last hour
  const windowStart = new Date(Date.now() - 3600000).toISOString()
  const { count } = await db
    .from('api_rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('key_id', apiKey.id)
    .gte('window_start', windowStart)

  if ((count || 0) >= apiKey.rate_limit) {
    return { valid: false, error: 'Rate limit exceeded' }
  }

  // Record usage (fire-and-forget -- don't await in critical path)
  db.from('api_rate_limits')
    .insert({ key_id: apiKey.id })
    .then(() => {})

  db.from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', apiKey.id)
    .then(() => {})

  // Resolve username
  const { data: profile } = await db
    .from('profiles')
    .select('username')
    .eq('id', apiKey.profile_id)
    .single()

  return {
    valid: true,
    profileId: apiKey.profile_id,
    username: profile?.username ?? undefined,
    permissions: apiKey.permissions || ['read'],
  }
}
