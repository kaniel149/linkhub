import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { createCalendarEvent, type GoogleCalendarConfig } from '@/lib/integrations/google-calendar'

// Public endpoint — no auth required
// Visitors book a meeting slot
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { username, service_id, start, end, name, email, message, add_meet } = body

  if (!username || !start || !end || !name || !email) {
    return NextResponse.json(
      { error: 'username, start, end, name, and email are required' },
      { status: 400 }
    )
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
  }

  // Use service role to read/write across users
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )

  // Find user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name')
    .eq('username', username)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Find their Google Calendar integration
  const { data: integration } = await supabase
    .from('integrations')
    .select('config')
    .eq('profile_id', profile.id)
    .eq('provider', 'google_calendar')
    .eq('is_active', true)
    .single()

  if (!integration) {
    return NextResponse.json({ error: 'Calendar not connected' }, { status: 404 })
  }

  try {
    const config = integration.config as unknown as GoogleCalendarConfig

    // Create calendar event
    const event = await createCalendarEvent(config, {
      summary: `Meeting with ${name}`,
      description: message || `Booked via LinkHub by ${name} (${email})`,
      start,
      end,
      attendee_email: email,
      attendee_name: name,
      add_meet: add_meet !== false, // default true
    })

    // Also create a service inquiry if service_id was provided
    if (service_id) {
      await supabase.from('service_inquiries').insert({
        service_id,
        profile_id: profile.id,
        sender_name: name,
        sender_email: email,
        message: message || `Booked meeting: ${start}`,
        source: 'human',
      })
    }

    return NextResponse.json({
      success: true,
      event_id: event.id,
      calendar_link: event.htmlLink,
      meet_link: event.hangoutLink || null,
    }, { status: 201 })
  } catch (err) {
    console.error('Calendar booking error:', err)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
