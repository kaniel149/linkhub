import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getPlanLimits } from '@/lib/types/database'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: services } = await supabase
    .from('services')
    .select('*, service_inquiries(count)')
    .eq('profile_id', user.id)
    .order('position')

  return NextResponse.json({ services: services || [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check plan limits
  const { data: profile } = await supabase.from('profiles').select('is_premium').eq('id', user.id).single()
  const limits = getPlanLimits(profile?.is_premium || false)

  const { count } = await supabase.from('services').select('*', { count: 'exact', head: true }).eq('profile_id', user.id)
  if ((count || 0) >= limits.maxServices) {
    return NextResponse.json({ error: 'Service limit reached. Upgrade to Pro for unlimited services.' }, { status: 403 })
  }

  const body = await request.json()
  const { title, description, category, pricing, price_amount, price_currency, action_type, action_config } = body

  if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

  // Get next position
  const { data: lastService } = await supabase.from('services').select('position').eq('profile_id', user.id).order('position', { ascending: false }).limit(1).single()
  const nextPosition = (lastService?.position ?? -1) + 1

  const { data: service, error } = await supabase
    .from('services')
    .insert({
      profile_id: user.id,
      title,
      description: description || null,
      category: category || 'other',
      pricing: pricing || 'contact',
      price_amount: price_amount ?? null,
      price_currency: price_currency || 'USD',
      action_type: action_type || 'contact_form',
      action_config: action_config || {},
      position: nextPosition,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ service }, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { id, ...updates } = body
  if (!id) return NextResponse.json({ error: 'Service ID is required' }, { status: 400 })

  const { data: service, error } = await supabase
    .from('services')
    .update(updates)
    .eq('id', id)
    .eq('profile_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ service })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Service ID is required' }, { status: 400 })

  const { error } = await supabase.from('services').delete().eq('id', id).eq('profile_id', user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
