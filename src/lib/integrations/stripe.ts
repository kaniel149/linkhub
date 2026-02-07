export interface StripeConfig {
  account_id?: string
  publishable_key?: string
  payment_links?: string[]
}

export function getStripeConnectUrl(redirectUri: string): string {
  const clientId = process.env.STRIPE_CLIENT_ID || ''
  return `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${clientId}&scope=read_write&redirect_uri=${encodeURIComponent(redirectUri)}`
}

export async function exchangeStripeCode(code: string): Promise<StripeConfig> {
  const clientSecret = process.env.STRIPE_SECRET_KEY || ''

  if (!clientSecret) {
    throw new Error('Stripe integration not yet configured')
  }

  const response = await fetch('https://connect.stripe.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_secret: clientSecret,
      code,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to exchange Stripe authorization code')
  }

  const data = await response.json()
  return {
    account_id: data.stripe_user_id,
    publishable_key: data.stripe_publishable_key,
  }
}
