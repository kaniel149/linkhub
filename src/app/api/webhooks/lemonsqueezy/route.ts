import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { validateLemonSqueezyWebhook } from '@/lib/integrations/lemonsqueezy'

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-signature') || ''

  // Validate webhook signature
  const isValid = await validateLemonSqueezyWebhook(rawBody, signature)
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const payload = JSON.parse(rawBody)
  const eventName = request.headers.get('x-event-name') || ''

  // Only process order_created events
  if (eventName !== 'order_created') {
    return NextResponse.json({ received: true })
  }

  const order = payload.data?.attributes
  if (!order) {
    return NextResponse.json({ received: true })
  }

  const storeId = String(payload.data?.relationships?.store?.data?.id || '')

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )

  // Find the integration by store_id in config
  const { data: integrations } = await supabase
    .from('integrations')
    .select('id, profile_id, config')
    .eq('provider', 'lemonsqueezy')
    .eq('is_active', true)

  const integration = integrations?.find(
    (i) => String((i.config as Record<string, unknown>).store_id) === storeId
  )

  if (!integration) {
    return NextResponse.json({ received: true })
  }

  // Record order as a service inquiry
  await supabase.from('service_inquiries').insert({
    profile_id: integration.profile_id,
    service_id: null as unknown as string,
    sender_name: order.user_name || 'LemonSqueezy Customer',
    sender_email: order.user_email || '',
    message: `Order #${order.order_number}: ${order.first_order_item?.product_name || 'Product'} — $${(order.total / 100).toFixed(2)} ${order.currency} (LemonSqueezy)`,
    source: 'human',
    status: 'new',
  })

  // Update last_synced_at
  await supabase
    .from('integrations')
    .update({ last_synced_at: new Date().toISOString() })
    .eq('id', integration.id)

  return NextResponse.json({ received: true })
}
