import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProfilePage } from '@/components/profile/profile-page'
import { ProfileWithLinks, Link, SocialEmbed, Service } from '@/lib/types/database'
import { headers } from 'next/headers'
import { AnalyticsTracker } from '@/components/profile/analytics-tracker'
import { JsonLd } from '@/components/profile/json-ld'
import { demoProfile, demoServices, DEMO_USERNAME } from '@/lib/demo-data'
import { deniProfile, deniServices, DENI_USERNAME } from '@/lib/demo-deni'
import { DeniBackground } from '@/components/profile/deni-background'

// All demo usernames (no Supabase needed)
const DEMO_PROFILES: Record<string, { profile: typeof demoProfile; services: typeof demoServices; heroImage?: string; customBackground?: React.ReactNode }> = {
  [DEMO_USERNAME]: { profile: demoProfile, services: demoServices, heroImage: '/demo/hero-banner.jpg' },
  [DENI_USERNAME]: { profile: deniProfile, services: deniServices, customBackground: <DeniBackground /> },
}

interface PageProps {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { username } = await params

  // Demo profiles
  const demo = DEMO_PROFILES[username]
  if (demo) {
    const p = demo.profile
    return {
      title: `${p.display_name} | LinkHub`,
      description: p.bio || `Check out ${p.display_name}'s links`,
      openGraph: {
        title: `${p.display_name} | LinkHub`,
        description: p.bio || '',
        images: p.avatar_url ? [p.avatar_url] : [],
        type: 'profile' as const,
      },
      twitter: {
        card: 'summary_large_image' as const,
        title: `${p.display_name} | LinkHub`,
        description: p.bio || '',
        images: p.avatar_url ? [p.avatar_url] : [],
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

  // Demo profiles — no Supabase needed
  const demoData = DEMO_PROFILES[username]
  if (demoData) {
    return (
      <>
        <JsonLd profile={demoData.profile} services={demoData.services} />
        <ProfilePage
          profile={demoData.profile}
          services={demoData.services}
          isDemo
          heroImage={demoData.heroImage}
          customBackground={demoData.customBackground}
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

  // Fetch services
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('profile_id', profile.id)
    .eq('is_active', true)
    .order('position')

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
      <JsonLd profile={profileWithLinks} services={(services || []) as Service[]} />
      <AnalyticsTracker
        profileId={profile.id}
        userAgent={userAgent}
        referer={referer}
      />
      <ProfilePage
        profile={profileWithLinks}
        services={(services || []) as Service[]}
      />
    </>
  )
}
