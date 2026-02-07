import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { demoProfile, DEMO_USERNAME } from '@/lib/demo-data'
import { detectAgent } from '@/lib/agent-detection'

const BASE_URL = 'https://linkhub-iota-red.vercel.app'

function formatProfileResponse(profile: any, username: string) {
  const activeLinks = (profile.links || [])
    .filter((l: any) => l.is_active)
    .sort((a: any, b: any) => a.position - b.position)
    .map((l: any, i: number) => ({
      title: l.title,
      url: l.url,
      icon: l.icon,
      position: i,
    }))

  const activeSocials = (profile.social_embeds || [])
    .filter((s: any) => s.is_active)
    .sort((a: any, b: any) => a.position - b.position)
    .map((s: any) => ({
      platform: s.platform,
      url: s.embed_url,
    }))

  return {
    username: profile.username,
    display_name: profile.display_name,
    bio: profile.bio,
    avatar_url: profile.avatar_url ? (profile.avatar_url.startsWith('http') ? profile.avatar_url : `${BASE_URL}${profile.avatar_url}`) : null,
    theme: {
      primary_color: profile.theme?.primaryColor,
      background_color: profile.theme?.backgroundColor,
    },
    is_verified: profile.is_premium || false,
    links: activeLinks,
    social: activeSocials,
    stats: {
      link_count: activeLinks.length,
      social_count: activeSocials.length,
    },
    _meta: {
      self: `${BASE_URL}/api/profiles/${username}`,
      card: `${BASE_URL}/api/profiles/${username}/card`,
      web: `${BASE_URL}/${username}`,
      llms_txt: `${BASE_URL}/llms.txt`,
      openapi: `${BASE_URL}/api/openapi.json`,
    },
  }
}

/**
 * Track agent visit (fire-and-forget, non-blocking)
 */
async function trackAgentVisit(
  profileId: string,
  username: string,
  request: NextRequest
) {
  try {
    const userAgent = request.headers.get('user-agent') || ''
    const agent = detectAgent(userAgent)

    if (!agent.isAgent) return

    const country =
      request.headers.get('x-vercel-ip-country') ||
      request.headers.get('cf-ipcountry') ||
      null

    const supabase = await createClient()
    await supabase.from('agent_visits').insert({
      profile_id: profileId,
      agent_identifier: agent.identifier,
      agent_name: agent.name,
      user_agent: userAgent.slice(0, 500),
      endpoint: `/api/profiles/${username}`,
      method: 'GET',
      country,
    })
  } catch {
    // Fire and forget - don't break the response
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params

  // Demo profile
  if (username === DEMO_USERNAME) {
    const response = formatProfileResponse(demoProfile, username)
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=3600',
        'X-LinkHub-API': 'v1',
      },
    })
  }

  // Real profile from Supabase
  const supabase = await createClient()
  const { data: profile, error } = await supabase
    .from('profiles')
    .select(`
      *,
      links(*),
      social_embeds(*)
    `)
    .eq('username', username)
    .single()

  if (error || !profile) {
    return NextResponse.json(
      { error: 'Profile not found', username },
      { status: 404 }
    )
  }

  // Track agent visits (fire-and-forget)
  trackAgentVisit(profile.id, username, request)

  const response = formatProfileResponse(profile, username)
  return NextResponse.json(response, {
    headers: {
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
      'X-LinkHub-API': 'v1',
    },
  })
}
