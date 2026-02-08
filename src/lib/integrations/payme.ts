export interface PayMeConfig {
  seller_id: string
  api_key: string
  test_mode?: boolean
}

interface PaymentLinkParams {
  amount: number
  currency: string
  description: string
  callback_url: string
  buyer_email?: string
  buyer_name?: string
}

const PAYME_API = 'https://ng.paymeservice.com/api'
const PAYME_SANDBOX_API = 'https://preprod.paymeservice.com/api'

export function createPayMePaymentLink(
  config: PayMeConfig,
  params: PaymentLinkParams
): string {
  const baseUrl = config.test_mode ? PAYME_SANDBOX_API : PAYME_API
  const query = new URLSearchParams({
    seller_payme_id: config.seller_id,
    sale_price: String(Math.round(params.amount * 100)), // amount in agorot
    currency: params.currency || 'ILS',
    product_name: params.description,
    sale_callback_url: params.callback_url,
    sale_type: 'sale',
    language: 'en',
    ...(params.buyer_email ? { buyer_email: params.buyer_email } : {}),
    ...(params.buyer_name ? { buyer_name: params.buyer_name } : {}),
  })
  return `${baseUrl}/generate-sale?${query.toString()}`
}

export async function validatePayMeWebhook(
  payload: string,
  signature: string
): Promise<boolean> {
  // PayMe sends a notification_token in the callback
  // Verify by checking the sale status with PayMe API
  // The signature is the seller's API key hash
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(process.env.PAYME_WEBHOOK_SECRET || ''),
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

export async function getPayMeSaleStatus(
  config: PayMeConfig,
  saleId: string
): Promise<{ status: string; amount: number }> {
  const baseUrl = config.test_mode ? PAYME_SANDBOX_API : PAYME_API

  const response = await fetch(`${baseUrl}/get-sales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      seller_payme_id: config.seller_id,
      sale_payme_id: saleId,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch PayMe sale status')
  }

  const data = await response.json()
  return {
    status: data.items?.[0]?.sale_status || 'unknown',
    amount: (data.items?.[0]?.sale_price || 0) / 100,
  }
}
