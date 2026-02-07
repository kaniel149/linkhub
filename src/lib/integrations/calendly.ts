export interface CalendlyConfig {
  access_token?: string
  refresh_token?: string
  organization_uri?: string
  scheduling_url?: string
}

export function getCalendlyAuthUrl(redirectUri: string): string {
  const clientId = process.env.CALENDLY_CLIENT_ID || ''
  return `https://auth.calendly.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}`
}

export async function exchangeCalendlyCode(code: string, redirectUri: string): Promise<CalendlyConfig> {
  const clientId = process.env.CALENDLY_CLIENT_ID || ''
  const clientSecret = process.env.CALENDLY_CLIENT_SECRET || ''

  if (!clientId || !clientSecret) {
    throw new Error('Calendly integration not yet configured')
  }

  const response = await fetch('https://auth.calendly.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to exchange Calendly authorization code')
  }

  const data = await response.json()
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    organization_uri: data.organization,
  }
}

export function getCalendlySchedulingUrl(config: CalendlyConfig): string | null {
  return config.scheduling_url || null
}
