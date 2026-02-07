import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getPlanLimits, type ApiKeyPermission } from '@/lib/types/database'

function generateApiKey(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return `lh_${hex}`
}

async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(key)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: keys, error } = await supabase
    .from('api_keys')
    .select('id, name, key_prefix, permissions, rate_limit, is_active, last_used_at, created_at')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ keys: keys || [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check plan limits
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_premium')
    .eq('id', user.id)
    .single()
  const limits = getPlanLimits(profile?.is_premium || false)

  if (limits.maxApiKeys === 0) {
    return NextResponse.json(
      { error: 'API keys are a premium feature. Upgrade to Pro to create API keys.' },
      { status: 403 }
    )
  }

  const { count } = await supabase
    .from('api_keys')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', user.id)

  if ((count || 0) >= limits.maxApiKeys) {
    return NextResponse.json(
      { error: `API key limit reached (${limits.maxApiKeys}). Delete an existing key to create a new one.` },
      { status: 403 }
    )
  }

  const body = await request.json()
  const { name, permissions, rate_limit } = body

  if (!name || !name.trim()) {
    return NextResponse.json({ error: 'Key name is required' }, { status: 400 })
  }

  // Validate permissions
  const validPermissions: ApiKeyPermission[] = ['read', 'write', 'inquire']
  const perms: ApiKeyPermission[] = Array.isArray(permissions)
    ? permissions.filter((p: string) => validPermissions.includes(p as ApiKeyPermission))
    : ['read']

  if (perms.length === 0) {
    return NextResponse.json({ error: 'At least one permission is required' }, { status: 400 })
  }

  // Validate rate limit
  const validRateLimits = [50, 100, 500, 1000]
  const rateLimit = validRateLimits.includes(rate_limit) ? rate_limit : 100

  // Generate key
  const fullKey = generateApiKey()
  const keyHash = await hashKey(fullKey)
  const keyPrefix = fullKey.substring(0, 8) + '...'

  const { data: apiKey, error } = await supabase
    .from('api_keys')
    .insert({
      profile_id: user.id,
      key_hash: keyHash,
      key_prefix: keyPrefix,
      name: name.trim(),
      permissions: perms,
      rate_limit: rateLimit,
      is_active: true,
    })
    .select('id, name, key_prefix, permissions, rate_limit, is_active, last_used_at, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Return the full key ONCE - this is the only time the user sees it
  return NextResponse.json({ key: apiKey, full_key: fullKey }, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { id, name, is_active, permissions, rate_limit } = body
  if (!id) return NextResponse.json({ error: 'API key ID is required' }, { status: 400 })

  const updates: Record<string, unknown> = {}

  if (name !== undefined) updates.name = name.trim()
  if (is_active !== undefined) updates.is_active = is_active
  if (permissions !== undefined) {
    const validPermissions: ApiKeyPermission[] = ['read', 'write', 'inquire']
    const perms = Array.isArray(permissions)
      ? permissions.filter((p: string) => validPermissions.includes(p as ApiKeyPermission))
      : undefined
    if (perms && perms.length > 0) updates.permissions = perms
  }
  if (rate_limit !== undefined) {
    const validRateLimits = [50, 100, 500, 1000]
    if (validRateLimits.includes(rate_limit)) updates.rate_limit = rate_limit
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 })
  }

  const { data: apiKey, error } = await supabase
    .from('api_keys')
    .update(updates)
    .eq('id', id)
    .eq('profile_id', user.id)
    .select('id, name, key_prefix, permissions, rate_limit, is_active, last_used_at, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ key: apiKey })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'API key ID is required' }, { status: 400 })

  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('id', id)
    .eq('profile_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
