export interface GoogleCalendarConfig {
  access_token?: string
  refresh_token?: string
  token_expiry?: string
  calendar_id?: string
  email?: string
}

export interface TimeSlot {
  start: string
  end: string
}

export interface CalendarEvent {
  summary: string
  description?: string
  start: string // ISO 8601
  end: string   // ISO 8601
  attendee_email: string
  attendee_name?: string
  add_meet?: boolean
}

const GOOGLE_OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const CALENDAR_API = 'https://www.googleapis.com/calendar/v3'

export function getGoogleCalendarAuthUrl(redirectUri: string): string {
  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID || ''
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly',
    access_type: 'offline',
    prompt: 'consent',
  })
  return `${GOOGLE_OAUTH_URL}?${params.toString()}`
}

export async function exchangeGoogleCode(code: string, redirectUri: string): Promise<GoogleCalendarConfig> {
  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID || ''
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET || ''

  if (!clientId || !clientSecret) {
    throw new Error('Google Calendar integration not yet configured')
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to exchange Google authorization code')
  }

  const data = await response.json()
  const expiry = new Date(Date.now() + data.expires_in * 1000).toISOString()

  // Fetch user email and primary calendar
  const userInfo = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${data.access_token}` },
  })
  const user = userInfo.ok ? await userInfo.json() : {}

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    token_expiry: expiry,
    calendar_id: 'primary',
    email: user.email,
  }
}

export async function refreshGoogleToken(config: GoogleCalendarConfig): Promise<GoogleCalendarConfig> {
  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID || ''
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET || ''

  if (!config.refresh_token) {
    throw new Error('No refresh token available')
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: config.refresh_token,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to refresh Google token')
  }

  const data = await response.json()
  return {
    ...config,
    access_token: data.access_token,
    token_expiry: new Date(Date.now() + data.expires_in * 1000).toISOString(),
  }
}

async function getValidToken(config: GoogleCalendarConfig): Promise<GoogleCalendarConfig> {
  if (config.token_expiry && new Date(config.token_expiry) < new Date()) {
    return refreshGoogleToken(config)
  }
  return config
}

export async function getAvailableSlots(
  config: GoogleCalendarConfig,
  date: string, // YYYY-MM-DD
  durationMinutes: number
): Promise<TimeSlot[]> {
  const validConfig = await getValidToken(config)
  const calendarId = validConfig.calendar_id || 'primary'

  const dayStart = new Date(`${date}T09:00:00`)
  const dayEnd = new Date(`${date}T18:00:00`)

  // Query FreeBusy
  const response = await fetch(`${CALENDAR_API}/freeBusy`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${validConfig.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      timeMin: dayStart.toISOString(),
      timeMax: dayEnd.toISOString(),
      items: [{ id: calendarId }],
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch calendar availability')
  }

  const data = await response.json()
  const busySlots: { start: string; end: string }[] =
    data.calendars?.[calendarId]?.busy || []

  // Generate available slots
  const slots: TimeSlot[] = []
  let cursor = dayStart.getTime()
  const slotDuration = durationMinutes * 60 * 1000

  while (cursor + slotDuration <= dayEnd.getTime()) {
    const slotStart = cursor
    const slotEnd = cursor + slotDuration

    const overlaps = busySlots.some((busy) => {
      const busyStart = new Date(busy.start).getTime()
      const busyEnd = new Date(busy.end).getTime()
      return slotStart < busyEnd && slotEnd > busyStart
    })

    if (!overlaps) {
      slots.push({
        start: new Date(slotStart).toISOString(),
        end: new Date(slotEnd).toISOString(),
      })
    }

    cursor += 30 * 60 * 1000 // 30-minute increments
  }

  return slots
}

export async function createCalendarEvent(
  config: GoogleCalendarConfig,
  event: CalendarEvent
): Promise<{ id: string; htmlLink: string; hangoutLink?: string }> {
  const validConfig = await getValidToken(config)
  const calendarId = validConfig.calendar_id || 'primary'

  const eventBody: Record<string, unknown> = {
    summary: event.summary,
    description: event.description || '',
    start: { dateTime: event.start },
    end: { dateTime: event.end },
    attendees: [
      { email: event.attendee_email, displayName: event.attendee_name },
    ],
  }

  if (event.add_meet) {
    eventBody.conferenceData = {
      createRequest: {
        requestId: crypto.randomUUID(),
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    }
  }

  const params = new URLSearchParams({
    sendUpdates: 'all',
    ...(event.add_meet ? { conferenceDataVersion: '1' } : {}),
  })

  const response = await fetch(
    `${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${validConfig.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventBody),
    }
  )

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Failed to create calendar event: ${err}`)
  }

  const created = await response.json()
  return {
    id: created.id,
    htmlLink: created.htmlLink,
    hangoutLink: created.hangoutLink,
  }
}
