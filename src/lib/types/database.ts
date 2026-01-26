export interface Profile {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  theme: {
    primaryColor: string
    backgroundColor: string
    fontFamily: string
  }
  is_premium: boolean
  custom_domain: string | null
  created_at: string
  updated_at: string
}

export interface Link {
  id: string
  profile_id: string
  title: string
  url: string
  icon: string
  position: number
  is_active: boolean
  click_count: number
  created_at: string
  updated_at: string
}

export interface SocialEmbed {
  id: string
  profile_id: string
  platform: 'instagram' | 'tiktok' | 'youtube' | 'spotify' | 'twitter'
  embed_url: string
  position: number
  is_active: boolean
  created_at: string
}

export interface AnalyticsEvent {
  id: string
  profile_id: string
  link_id: string | null
  event_type: 'page_view' | 'link_click' | 'social_click'
  referrer: string | null
  country: string | null
  device_type: string | null
  browser: string | null
  created_at: string
}

export interface ProfileWithLinks extends Profile {
  links: Link[]
  social_embeds: SocialEmbed[]
}

// Plan limits
export const PLAN_LIMITS = {
  free: {
    maxLinks: 5,
    maxSocialEmbeds: 2,
    analyticsRetentionDays: 7,
    customDomain: false,
    removeBranding: false,
  },
  premium: {
    maxLinks: Infinity,
    maxSocialEmbeds: Infinity,
    analyticsRetentionDays: 365,
    customDomain: true,
    removeBranding: true,
  },
} as const

export function getPlanLimits(isPremium: boolean) {
  return isPremium ? PLAN_LIMITS.premium : PLAN_LIMITS.free
}
