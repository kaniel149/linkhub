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
import { nasProfile, nasServices, NAS_USERNAME } from '@/lib/demo-nas'
import { barProfile, barServices, BAR_USERNAME } from '@/lib/demo-bar'
import { galProfile, galServices, GAL_USERNAME } from '@/lib/demo-gal'
import { DeniBackground } from '@/components/profile/deni-background'
import { DeniStats, DeniAllStarBadge } from '@/components/profile/deni-stats'
import { NasBackground } from '@/components/profile/nas-background'
import { BarBackground } from '@/components/profile/bar-background'
import { GalBackground } from '@/components/profile/gal-background'
import { yehudaProfile, yehudaServices, YEHUDA_USERNAME } from '@/lib/demo-yehuda'
import { YehudaBackground } from '@/components/profile/yehuda-background'

// All demo usernames (no Supabase needed)
const DEMO_PROFILES: Record<string, { profile: typeof demoProfile; services: typeof demoServices; heroImage?: string; canvasVideo?: string; canvasImages?: string[]; customBackground?: React.ReactNode; badge?: React.ReactNode; statsSection?: React.ReactNode }> = {
  [DEMO_USERNAME]: {
    profile: demoProfile,
    services: demoServices,
    canvasImages: [
      '/demo/hero-banner.jpg',
      '/demo/hero-800.png',
      '/demo/clean-800.png',
      '/demo/hero-banner.jpg',
    ],
  },
  [DENI_USERNAME]: {
    profile: deniProfile,
    services: deniServices,
    canvasVideo: '/demo/deni/canvas-dunk-trimmed.mp4',
    canvasImages: [
      '/demo/deni/drive-vs-lakers.jpg',
      '/demo/deni/fastbreak-vs-lakers.jpg',
      '/demo/deni/warmup-energy.jpg',
      '/demo/deni/drive-vs-lakers.jpg',
    ],
    customBackground: <DeniBackground />,
    badge: <DeniAllStarBadge />,
    statsSection: <DeniStats />,
  },
  [NAS_USERNAME]: {
    profile: nasProfile,
    services: nasServices,
    canvasImages: [
      '/demo/nas/action-1.jpg',
      '/demo/nas/action-2.jpg',
      '/demo/nas/action-3.jpg',
      '/demo/nas/action-1.jpg',
    ],
    customBackground: <NasBackground />,
  },
  [BAR_USERNAME]: {
    profile: barProfile,
    services: barServices,
    canvasImages: [
      '/demo/bar/action-1.jpg',
      '/demo/bar/action-2.jpg',
      '/demo/bar/action-3.jpg',
      '/demo/bar/action-1.jpg',
    ],
    customBackground: <BarBackground />,
  },
  [GAL_USERNAME]: {
    profile: galProfile,
    services: galServices,
    canvasImages: [
      '/demo/gal/action-1.jpg',
      '/demo/gal/action-2.jpg',
      '/demo/gal/action-3.jpg',
      '/demo/gal/action-1.jpg',
    ],
    customBackground: <GalBackground />,
  },
  [YEHUDA_USERNAME]: {
    profile: yehudaProfile,
    services: yehudaServices,
    canvasImages: [
      '/demo/yehuda/action-1.jpg',
      '/demo/yehuda/action-2.jpg',
      '/demo/yehuda/action-3.jpg',
      '/demo/yehuda/action-1.jpg',
    ],
    customBackground: <YehudaBackground />,
  },
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
          canvasVideo={demoData.canvasVideo}
          canvasImages={demoData.canvasImages}
          customBackground={demoData.customBackground}
          badge={demoData.badge}
          statsSection={demoData.statsSection}
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
