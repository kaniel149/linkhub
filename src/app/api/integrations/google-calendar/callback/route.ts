import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { exchangeGoogleCode } from '@/lib/integrations/google-calendar'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL('/dashboard/integrations?error=google_denied', request.url))
  }

  if (!code) {
    return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/login?redirect=/dashboard/integrations', request.url))
  }

  try {
    const redirectUri = new URL('/api/integrations/google-calendar/callback', request.url).toString()
    const config = await exchangeGoogleCode(code, redirectUri)

    // Check if integration already exists
    const { data: existing } = await supabase
      .from('integrations')
      .select('id')
      .eq('profile_id', user.id)
      .eq('provider', 'google_calendar')
      .limit(1)

    if (existing && existing.length > 0) {
      // Update existing integration
      await supabase
        .from('integrations')
        .update({
          config,
          is_active: true,
          connected_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing[0].id)
        .eq('profile_id', user.id)
    } else {
      // Create new integration
      await supabase
        .from('integrations')
        .insert({
          profile_id: user.id,
          provider: 'google_calendar',
          name: `Google Calendar (${config.email || 'Connected'})`,
          config,
          is_active: true,
          connected_at: new Date().toISOString(),
        })
    }

    return NextResponse.redirect(new URL('/dashboard/integrations?success=google_calendar', request.url))
  } catch (err) {
    console.error('Google Calendar OAuth error:', err)
    return NextResponse.redirect(new URL('/dashboard/integrations?error=google_failed', request.url))
  }
}
