import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createPayMePaymentLink, type PayMeConfig } from '@/lib/integrations/payme'
import { createLemonSqueezyCheckout, type LemonSqueezyConfig } from '@/lib/integrations/lemonsqueezy'

// Public endpoint — no auth required
// Visitors use this to initiate a payment for a service
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { username, service_id } = body

  if (!username || !service_id) {
    return NextResponse.json(
      { error: 'username and service_id are required' },
      { status: 400 }
    )
  }

  // Use service role to read across users (public endpoint)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )

  // Find user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name, username')
    .eq('username', username)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Find the service
  const { data: service } = await supabase
    .from('services')
    .select('*')
    .eq('id', service_id)
    .eq('profile_id', profile.id)
    .eq('is_active', true)
    .single()

  if (!service) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 })
  }

  if (!service.price_amount || service.price_amount <= 0) {
    return NextResponse.json(
      { error: 'Service does not have a valid price' },
      { status: 400 }
    )
  }

  // Look up user's active payment integrations (PayMe first, then LemonSqueezy)
  const { data: integrations } = await supabase
    .from('integrations')
    .select('provider, config')
    .eq('profile_id', profile.id)
    .in('provider', ['payme', 'lemonsqueezy'])
    .eq('is_active', true)

  if (!integrations || integrations.length === 0) {
    return NextResponse.json(
      { error: 'No payment provider configured' },
      { status: 400 }
    )
  }

  const paymeIntegration = integrations.find((i) => i.provider === 'payme')
  const lemonIntegration = integrations.find((i) => i.provider === 'lemonsqueezy')

  const origin = request.nextUrl.origin
  const callbackUrl = `${origin}/${username}?payment=success&service=${service_id}`

  try {
    // Try PayMe first
    if (paymeIntegration) {
      const config = paymeIntegration.config as unknown as PayMeConfig

      const payment_url = createPayMePaymentLink(config, {
        amount: service.price_amount,
        currency: service.price_currency || 'ILS',
        description: service.title,
        callback_url: callbackUrl,
      })

      return NextResponse.json({
        payment_url,
        provider: 'payme',
      })
    }

    // Fall back to LemonSqueezy
    if (lemonIntegration) {
      const config = lemonIntegration.config as unknown as LemonSqueezyConfig
      const actionConfig = service.action_config as Record<string, string> | null
      const variantId = actionConfig?.variant_id

      if (!variantId) {
        return NextResponse.json(
          { error: 'Service is missing LemonSqueezy variant configuration' },
          { status: 400 }
        )
      }

      const payment_url = await createLemonSqueezyCheckout(config, {
        variant_id: variantId,
        custom_data: {
          username,
          service_id,
        },
      })

      return NextResponse.json({
        payment_url,
        provider: 'lemonsqueezy',
      })
    }

    // Should not reach here given the check above, but just in case
    return NextResponse.json(
      { error: 'No payment provider configured' },
      { status: 400 }
    )
  } catch (err) {
    console.error('Payment link creation error:', err)
    return NextResponse.json(
      { error: 'Failed to create payment link' },
      { status: 500 }
    )
  }
}
