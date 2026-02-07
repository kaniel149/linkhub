import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getPlanLimits, type IntegrationProvider } from '@/lib/types/database'

const VALID_PROVIDERS: IntegrationProvider[] = ['calendly', 'cal_com', 'stripe', 'webhook', 'zapier']

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: integrations } = await supabase
    .from('integrations')
    .select('*')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ integrations: integrations || [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check plan limits
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_premium')
    .eq('id', user.id)
    .single()

  const limits = getPlanLimits(profile?.is_premium || false)

  if (limits.maxIntegrations === 0) {
    return NextResponse.json(
      { error: 'Integrations require a Pro plan. Upgrade to connect external services.' },
      { status: 403 }
    )
  }

  const { count } = await supabase
    .from('integrations')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', user.id)

  if ((count || 0) >= limits.maxIntegrations) {
    return NextResponse.json(
      { error: `Integration limit reached (${limits.maxIntegrations}). Remove an existing integration first.` },
      { status: 403 }
    )
  }

  const body = await request.json()
  const { provider, name, config } = body

  if (!provider || !VALID_PROVIDERS.includes(provider)) {
    return NextResponse.json({ error: 'Invalid integration provider' }, { status: 400 })
  }

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Integration name is required' }, { status: 400 })
  }

  // Check for duplicate provider
  const { data: existing } = await supabase
    .from('integrations')
    .select('id')
    .eq('profile_id', user.id)
    .eq('provider', provider)
    .limit(1)

  if (existing && existing.length > 0) {
    return NextResponse.json(
      { error: `You already have a ${provider} integration. Configure the existing one instead.` },
      { status: 409 }
    )
  }

  const { data: integration, error } = await supabase
    .from('integrations')
    .insert({
      profile_id: user.id,
      provider,
      name: name.trim(),
      config: config || {},
      is_active: true,
      connected_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ integration }, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { id, ...updates } = body
  if (!id) return NextResponse.json({ error: 'Integration ID is required' }, { status: 400 })

  // Only allow updating specific fields
  const allowedUpdates: Record<string, unknown> = {}
  if ('name' in updates) allowedUpdates.name = updates.name
  if ('config' in updates) allowedUpdates.config = updates.config
  if ('is_active' in updates) allowedUpdates.is_active = updates.is_active
  if ('last_synced_at' in updates) allowedUpdates.last_synced_at = updates.last_synced_at

  allowedUpdates.updated_at = new Date().toISOString()

  const { data: integration, error } = await supabase
    .from('integrations')
    .update(allowedUpdates)
    .eq('id', id)
    .eq('profile_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ integration })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Integration ID is required' }, { status: 400 })

  const { error } = await supabase
    .from('integrations')
    .delete()
    .eq('id', id)
    .eq('profile_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
