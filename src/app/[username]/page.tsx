import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProfilePage } from '@/components/profile/profile-page'
import { ProfileWithLinks, Link, SocialEmbed } from '@/lib/types/database'
import { headers } from 'next/headers'
import { AnalyticsTracker } from '@/components/profile/analytics-tracker'
import { JsonLd } from '@/components/profile/json-ld'
import { demoProfile, DEMO_USERNAME } from '@/lib/demo-data'

interface PageProps {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { username } = await params

  // Demo profile
  if (username === DEMO_USERNAME) {
    return {
      title: `${demoProfile.display_name} | LinkHub`,
      description: demoProfile.bio || `Check out ${demoProfile.display_name}'s links`,
      openGraph: {
        title: `${demoProfile.display_name} | LinkHub`,
        description: demoProfile.bio || '',
        images: ['/demo/og-image.png'],
        type: 'profile',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${demoProfile.display_name} | LinkHub`,
        description: demoProfile.bio || '',
        images: ['/demo/og-image.png'],
      },
    }
  }

  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, bio, avatar_url')
    .eq('username', username)
    .single()

  if (!profile) {
    return { title: 'Not Found' }
  }

  return {
    title: `${profile.display_name || username} | LinkHub`,
    description: profile.bio || `Check out ${profile.display_name || username}'s links`,
    openGraph: {
      title: `${profile.display_name || username} | LinkHub`,
      description: profile.bio || '',
      images: profile.avatar_url ? [profile.avatar_url] : [],
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title: `${profile.display_name || username} | LinkHub`,
      description: profile.bio || '',
    },
  }
}

export default async function UserPage({ params }: PageProps) {
  const { username } = await params

  // Demo profile - no Supabase needed
  if (username === DEMO_USERNAME) {
    return (
      <>
        <JsonLd profile={demoProfile} />
        <ProfilePage
          profile={demoProfile}
          isDemo
        />
      </>
    )
  }

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
      <JsonLd profile={profileWithLinks} />
      <AnalyticsTracker
        profileId={profile.id}
        userAgent={userAgent}
        referer={referer}
      />
      <ProfilePage
        profile={profileWithLinks}
      />
    </>
  )
}
