export interface WebhookConfig {
  url: string
  secret?: string
  events: string[]  // e.g., ['inquiry.created', 'service.updated']
  method: 'POST' | 'PUT'
  headers?: Record<string, string>
}

export async function sendWebhook(config: WebhookConfig, event: string, payload: unknown): Promise<boolean> {
  try {
    const body = JSON.stringify({ event, timestamp: new Date().toISOString(), data: payload })

    const response = await fetch(config.url, {
      method: config.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-LinkHub-Event': event,
        ...(config.secret ? { 'X-LinkHub-Signature': await signPayload(body, config.secret) } : {}),
        ...config.headers,
      },
      body,
    })
    return response.ok
  } catch {
    return false
  }
}

async function signPayload(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function validateWebhookConfig(config: Partial<WebhookConfig>): string | null {
  if (!config.url) return 'Webhook URL is required'

  try {
    new URL(config.url)
  } catch {
    return 'Invalid webhook URL'
  }

  if (!config.events || config.events.length === 0) {
    return 'At least one event must be selected'
  }

  return null
}

export const WEBHOOK_EVENTS = [
  { value: 'inquiry.created', label: 'New Inquiry', description: 'When a visitor submits a service inquiry' },
  { value: 'inquiry.updated', label: 'Inquiry Updated', description: 'When an inquiry status changes' },
  { value: 'link.clicked', label: 'Link Clicked', description: 'When a visitor clicks a link' },
  { value: 'profile.viewed', label: 'Profile Viewed', description: 'When your profile is viewed' },
  { value: 'service.updated', label: 'Service Updated', description: 'When a service is created or modified' },
] as const
