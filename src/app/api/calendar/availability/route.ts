import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { getAvailableSlots, type GoogleCalendarConfig } from '@/lib/integrations/google-calendar'

// Public endpoint — no auth required
// Visitors use this to see available booking slots
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get('username')
  const date = searchParams.get('date') // YYYY-MM-DD
  const duration = parseInt(searchParams.get('duration') || '30', 10)

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 })
  }

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Valid date (YYYY-MM-DD) is required' }, { status: 400 })
  }

  if (duration < 15 || duration > 480) {
    return NextResponse.json({ error: 'Duration must be between 15 and 480 minutes' }, { status: 400 })
  }

  // Use service role to read across users
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )

  // Find user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
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
    const slots = await getAvailableSlots(config, date, duration)

    return NextResponse.json({
      username,
      date,
      duration,
      slots,
    })
  } catch (err) {
    console.error('Calendar availability error:', err)
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 })
  }
}
