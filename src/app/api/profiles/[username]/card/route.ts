import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { demoProfile, DEMO_USERNAME } from '@/lib/demo-data'

const BASE_URL = 'https://linkhub-iota-red.vercel.app'

function formatCardResponse(profile: any, username: string) {
  const activeLinks = (profile.links || [])
    .filter((l: any) => l.is_active)
    .sort((a: any, b: any) => a.position - b.position)

  const activeSocials = (profile.social_embeds || [])
    .filter((s: any) => s.is_active)
    .sort((a: any, b: any) => a.position - b.position)

  const socialMap: Record<string, string> = {}
  activeSocials.forEach((s: any) => {
    socialMap[s.platform] = s.embed_url
  })

  const totalClicks = activeLinks.reduce((sum: number, l: any) => sum + (l.click_count || 0), 0)

  return {
    v: '1.0',
    type: 'agent-card',
    identity: {
      name: profile.display_name || profile.username,
      handle: `@${profile.username}`,
      bio: profile.bio || null,
      verified: profile.is_premium || false,
    },
    avatar: profile.avatar_url ? (profile.avatar_url.startsWith('http') ? profile.avatar_url : `${BASE_URL}${profile.avatar_url}`) : null,
    reach: {
      links: activeLinks.length,
      clicks: totalClicks,
    },
    links: activeLinks.map((l: any) => ({
      title: l.title,
      url: l.url,
    })),
    social: socialMap,
    capabilities: ['view_profile', 'view_links', 'view_social'],
    endpoints: {
      profile: `${BASE_URL}/api/profiles/${username}`,
      card: `${BASE_URL}/api/profiles/${username}/card`,
      web: `${BASE_URL}/${username}`,
    },
    updated: profile.updated_at,
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params

  if (username === DEMO_USERNAME) {
    const response = formatCardResponse(demoProfile, username)
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=3600',
        'X-LinkHub-API': 'v1',
        'X-Card-Version': '1.0',
      },
    })
  }

  const supabase = await createClient()
  const { data: profile, error } = await supabase
    .from('profiles')
    .select(`*, links(*), social_embeds(*)`)
    .eq('username', username)
    .single()

  if (error || !profile) {
    return NextResponse.json(
      { error: 'Profile not found', username },
      { status: 404 }
    )
  }

  const response = formatCardResponse(profile, username)
  return NextResponse.json(response, {
    headers: {
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
      'X-LinkHub-API': 'v1',
      'X-Card-Version': '1.0',
    },
  })
}
