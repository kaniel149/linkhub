export interface LemonSqueezyConfig {
  api_key: string
  store_id: string
  test_mode?: boolean
}

interface CheckoutParams {
  variant_id: string
  email?: string
  custom_data?: Record<string, string>
}

const LEMON_API = 'https://api.lemonsqueezy.com/v1'

export async function createLemonSqueezyCheckout(
  config: LemonSqueezyConfig,
  params: CheckoutParams
): Promise<string> {
  const response = await fetch(`${LEMON_API}/checkouts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.api_key}`,
      'Content-Type': 'application/vnd.api+json',
      Accept: 'application/vnd.api+json',
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email: params.email,
            custom: params.custom_data || {},
          },
          test_mode: config.test_mode || false,
        },
        relationships: {
          store: {
            data: { type: 'stores', id: config.store_id },
          },
          variant: {
            data: { type: 'variants', id: params.variant_id },
          },
        },
      },
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Failed to create LemonSqueezy checkout: ${err}`)
  }

  const data = await response.json()
  return data.data.attributes.url
}

export async function validateLemonSqueezyWebhook(
  payload: string,
  signature: string
): Promise<boolean> {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || ''
  if (!secret) return false

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  const computed = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return computed === signature
}
