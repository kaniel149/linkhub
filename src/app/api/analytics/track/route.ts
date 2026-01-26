import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

function parseUserAgent(ua: string) {
  const isMobile = /Mobile|Android|iPhone/i.test(ua)
  const isTablet = /Tablet|iPad/i.test(ua)
  const deviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'

  let browser = 'unknown'
  if (ua.includes('Chrome')) browser = 'chrome'
  else if (ua.includes('Safari')) browser = 'safari'
  else if (ua.includes('Firefox')) browser = 'firefox'
  else if (ua.includes('Edge')) browser = 'edge'

  return { deviceType, browser }
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  const headersList = await headers()

  const { deviceType, browser } = parseUserAgent(body.userAgent || '')

  // Get country from Vercel headers (or Cloudflare)
  const country = headersList.get('x-vercel-ip-country') ||
                  headersList.get('cf-ipcountry') ||
                  'unknown'

  const { error } = await supabase.from('analytics_events').insert({
    profile_id: body.profileId,
    link_id: body.linkId || null,
    event_type: body.eventType,
    referrer: body.referer || null,
    country,
    device_type: deviceType,
    browser,
  })

  // Also increment click count if it's a link click
  if (body.eventType === 'link_click' && body.linkId) {
    await supabase.rpc('increment_click_count', { link_id: body.linkId })
  }

  if (error) {
    console.error('Analytics error:', error)
  }

  return NextResponse.json({ success: true })
}
