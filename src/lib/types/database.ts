export interface Theme {
  primaryColor: string
  backgroundColor: string
  fontFamily?: string
  buttonStyle?: 'solid' | 'outline' | 'glass' | 'soft'
}

export interface Profile {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  theme: Theme
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
  platform: 'instagram' | 'tiktok' | 'youtube' | 'spotify' | 'twitter' | 'linkedin' | 'github'
  embed_url: string
  position: number
  is_active: boolean
  created_at: string
}

export interface AnalyticsEvent {
  id: string
  profile_id: string
  link_id: string | null
  event_type: 'page_view' | 'link_click' | 'social_click' | 'agent_visit' | 'agent_api_call'
  referrer: string | null
  country: string | null
  device_type: string | null
  browser: string | null
  created_at: string
}

export interface AgentVisit {
  id: string
  profile_id: string
  agent_identifier: string
  agent_name: string | null
  user_agent: string | null
  endpoint: string
  method: string
  country: string | null
  created_at: string
}

// Service types
export type ServiceCategory = 'consulting' | 'freelance' | 'product' | 'event' | 'education' | 'other'
export type ServicePricing = 'free' | 'fixed' | 'hourly' | 'custom' | 'contact'
export type ServiceActionType = 'book_meeting' | 'contact_form' | 'request_quote' | 'buy_now' | 'external_link'
export type InquiryStatus = 'new' | 'read' | 'replied' | 'archived'
export type InquirySource = 'human' | 'agent'

export interface Service {
  id: string
  profile_id: string
  title: string
  description: string | null
  category: ServiceCategory
  pricing: ServicePricing
  price_amount: number | null
  price_currency: string
  action_type: ServiceActionType
  action_config: Record<string, unknown>
  position: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ServiceInquiry {
  id: string
  service_id: string
  profile_id: string
  sender_name: string
  sender_email: string
  message: string | null
  source: InquirySource
  agent_identifier: string | null
  status: InquiryStatus
  created_at: string
}

// API Key types
export type ApiKeyPermission = 'read' | 'write' | 'inquire'

export interface ApiKey {
  id: string
  profile_id: string
  key_hash: string
  key_prefix: string
  name: string
  permissions: ApiKeyPermission[]
  rate_limit: number
  is_active: boolean
  last_used_at: string | null
  created_at: string
}

export interface ApiKeyDisplay {
  id: string
  name: string
  key_prefix: string
  permissions: ApiKeyPermission[]
  rate_limit: number
  is_active: boolean
  last_used_at: string | null
  created_at: string
}

// Integration types
export type IntegrationProvider = 'calendly' | 'cal_com' | 'stripe' | 'webhook' | 'zapier' | 'google_calendar' | 'payme' | 'lemonsqueezy'

export interface Integration {
  id: string
  profile_id: string
  provider: IntegrationProvider
  name: string
  config: Record<string, unknown>
  is_active: boolean
  connected_at: string
  last_synced_at: string | null
  created_at: string
  updated_at: string
}

export const INTEGRATION_PROVIDER_LABELS: Record<IntegrationProvider, string> = {
  calendly: 'Calendly',
  cal_com: 'Cal.com',
  stripe: 'Stripe',
  webhook: 'Webhook',
  zapier: 'Zapier',
  google_calendar: 'Google Calendar',
  payme: 'PayMe',
  lemonsqueezy: 'LemonSqueezy',
}

export const INTEGRATION_PROVIDER_DESCRIPTIONS: Record<IntegrationProvider, string> = {
  calendly: 'Booking & scheduling',
  cal_com: 'Open-source scheduling',
  stripe: 'Payments & checkout',
  webhook: 'Custom HTTP webhooks',
  zapier: 'Connect 5000+ apps',
  google_calendar: 'Sync your availability',
  payme: 'Israeli payment processing',
  lemonsqueezy: 'Digital product payments',
}

export interface ProfileWithLinks extends Profile {
  links: Link[]
  social_embeds: SocialEmbed[]
}

export interface ProfileWithServices extends ProfileWithLinks {
  services: Service[]
}

// Display helpers
export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  consulting: 'Consulting',
  freelance: 'Freelance',
  product: 'Product',
  event: 'Event',
  education: 'Education',
  other: 'Other',
}

export const SERVICE_PRICING_LABELS: Record<ServicePricing, string> = {
  free: 'Free',
  fixed: 'Fixed Price',
  hourly: 'Hourly Rate',
  custom: 'Custom',
  contact: 'Contact for Pricing',
}

export const SERVICE_ACTION_LABELS: Record<ServiceActionType, string> = {
  book_meeting: 'Book Meeting',
  contact_form: 'Contact',
  request_quote: 'Get Quote',
  buy_now: 'Buy Now',
  external_link: 'Visit',
}

// Plan limits
export const PLAN_LIMITS = {
  free: {
    maxLinks: 5,
    maxSocialEmbeds: 2,
    analyticsRetentionDays: 7,
    customDomain: false,
    removeBranding: false,
    maxServices: 1,
    maxApiKeys: 0,
    maxIntegrations: 0,
    agentAnalytics: false,
    mcpAccess: false,
  },
  premium: {
    maxLinks: Infinity,
    maxSocialEmbeds: Infinity,
    analyticsRetentionDays: 365,
    customDomain: true,
    removeBranding: true,
    maxServices: Infinity,
    maxApiKeys: 5,
    maxIntegrations: 10,
    agentAnalytics: true,
    mcpAccess: true,
  },
} as const

export function getPlanLimits(isPremium: boolean) {
  return isPremium ? PLAN_LIMITS.premium : PLAN_LIMITS.free
}

export function formatPrice(pricing: ServicePricing, amount: number | null, currency: string): string {
  if (pricing === 'free') return 'Free'
  if (pricing === 'contact') return 'Contact for pricing'
  if (pricing === 'custom') return 'Custom pricing'
  if (amount == null) return SERVICE_PRICING_LABELS[pricing]

  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount)

  if (pricing === 'hourly') return `${formatted}/hr`
  return formatted
}
