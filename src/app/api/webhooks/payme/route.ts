import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { validatePayMeWebhook } from '@/lib/integrations/payme'

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-payme-signature') || ''

  // Validate webhook signature
  const isValid = await validatePayMeWebhook(rawBody, signature)
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const payload = JSON.parse(rawBody)
  const {
    sale_status,
    sale_payme_id,
    seller_payme_id,
    sale_price,
    buyer_email,
    buyer_name,
    product_name,
  } = payload

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )

  // Find the integration by seller_id in config
  const { data: integrations } = await supabase
    .from('integrations')
    .select('id, profile_id, config')
    .eq('provider', 'payme')
    .eq('is_active', true)

  const integration = integrations?.find(
    (i) => (i.config as Record<string, unknown>).seller_id === seller_payme_id
  )

  if (!integration) {
    // Not our seller, acknowledge anyway
    return NextResponse.json({ received: true })
  }

  // Record payment as a service inquiry
  if (sale_status === 'completed' || sale_status === 'success') {
    await supabase.from('service_inquiries').insert({
      profile_id: integration.profile_id,
      service_id: null as unknown as string, // payment not tied to a specific service
      sender_name: buyer_name || 'PayMe Customer',
      sender_email: buyer_email || '',
      message: `Payment received: ${(sale_price || 0) / 100} ILS for "${product_name}" (PayMe ID: ${sale_payme_id})`,
      source: 'human',
      status: 'new',
    })
  }

  // Update last_synced_at
  await supabase
    .from('integrations')
    .update({ last_synced_at: new Date().toISOString() })
    .eq('id', integration.id)

  return NextResponse.json({ received: true })
}
