import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProfilePage } from '@/components/profile/profile-page'
import { ProfileWithLinks, Link, SocialEmbed } from '@/lib/types/database'
import { headers } from 'next/headers'
import { AnalyticsTracker } from '@/components/profile/analytics-tracker'

interface PageProps {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, bio')
    .eq('username', username)
    .single()

  if (!profile) {
    return { title: 'Not Found' }
  }

  return {
    title: `${profile.display_name || username} | LinkHub`,
    description: profile.bio || `Check out ${profile.display_name || username}'s links`,
  }
}

export default async function UserPage({ params }: PageProps) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      links(*),
      social_embeds(*)
    `)
    .eq('username', username)
    .single()

  if (!profile) {
    notFound()
  }

  // Sort links by position
  const profileWithLinks: ProfileWithLinks = {
    ...profile,
    links: ((profile.links || []) as Link[]).sort((a, b) => a.position - b.position),
    social_embeds: ((profile.social_embeds || []) as SocialEmbed[]).sort((a, b) => a.position - b.position),
  }

  // Get request info for analytics
  const headersList = await headers()
  const userAgent = headersList.get('user-agent') || ''
  const referer = headersList.get('referer') || ''

  return (
    <>
      <AnalyticsTracker
        profileId={profile.id}
        userAgent={userAgent}
        referer={referer}
      />
      <ProfilePage
        profile={profileWithLinks}
        onLinkClick={() => {}}
      />
    </>
  )
}
