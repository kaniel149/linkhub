import { getSupabaseAdmin } from './auth'
import { demoProfile, demoServices, DEMO_USERNAME } from '@/lib/demo-data'
import { formatPrice } from '@/lib/types/database'
import type { Service, Link, SocialEmbed } from '@/lib/types/database'

/**
 * MCP Resources
 *
 * Read-only data that agents can browse via `resources/list` and `resources/read`.
 * Each resource maps to a URI pattern like `linkhub://{username}/profile`.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ResourceDefinition {
  uri: string
  name: string
  description: string
  mimeType: string
}

interface ResourceReadResult {
  contents: Array<{ uri: string; mimeType: string; text: string }>
}

// ---------------------------------------------------------------------------
// Resource templates (parameterised by username)
// ---------------------------------------------------------------------------

export function getResourceDefinitions(username: string): ResourceDefinition[] {
  return [
    {
      uri: `linkhub://${username}/profile`,
      name: `${username}'s profile`,
      description:
        'Overview of this user including display name, bio, avatar, and summary statistics.',
      mimeType: 'text/plain',
    },
    {
      uri: `linkhub://${username}/links`,
      name: `${username}'s links`,
      description: 'All active links on this profile, with titles, URLs, and click counts.',
      mimeType: 'text/plain',
    },
    {
      uri: `linkhub://${username}/services`,
      name: `${username}'s services`,
      description:
        'Available services offered by this user, with pricing and action types.',
      mimeType: 'text/plain',
    },
    {
      uri: `linkhub://${username}/social`,
      name: `${username}'s social media`,
      description: 'Social media links and platforms connected to this profile.',
      mimeType: 'text/plain',
    },
  ]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BASE_URL = 'https://linkhub-iota-red.vercel.app'

interface ProfileData {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  is_premium: boolean
  links: Link[]
  social_embeds: SocialEmbed[]
}

async function resolveProfile(username: string): Promise<ProfileData | null> {
  if (username === DEMO_USERNAME) {
    return demoProfile as ProfileData
  }

  const { data: profile, error } = await getSupabaseAdmin()
    .from('profiles')
    .select('*, links(*), social_embeds(*)')
    .eq('username', username)
    .single()

  if (error || !profile) return null
  return profile as unknown as ProfileData
}

async function resolveServices(
  username: string,
  profileId?: string
): Promise<Service[]> {
  if (username === DEMO_USERNAME) {
    return demoServices
  }
  if (!profileId) return []

  const { data: services } = await getSupabaseAdmin()
    .from('services')
    .select('*')
    .eq('profile_id', profileId)
    .eq('is_active', true)
    .order('position')

  return (services as Service[]) || []
}

function resolveAvatarUrl(avatarUrl: string | null): string | null {
  if (!avatarUrl) return null
  if (avatarUrl.startsWith('http')) return avatarUrl
  return `${BASE_URL}${avatarUrl}`
}

// ---------------------------------------------------------------------------
// Resource readers
// ---------------------------------------------------------------------------

export async function readResource(
  uri: string,
  username: string
): Promise<ResourceReadResult | null> {
  // Parse the resource path from the URI
  const match = uri.match(/^linkhub:\/\/([^/]+)\/(.+)$/)
  if (!match) return null

  const [, uriUsername, path] = match

  // Ensure the URI username matches the route username
  if (uriUsername !== username) return null

  switch (path) {
    case 'profile':
      return readProfileResource(username, uri)
    case 'links':
      return readLinksResource(username, uri)
    case 'services':
      return readServicesResource(username, uri)
    case 'social':
      return readSocialResource(username, uri)
    default:
      return null
  }
}

async function readProfileResource(
  username: string,
  uri: string
): Promise<ResourceReadResult | null> {
  const profile = await resolveProfile(username)
  if (!profile) return null

  const activeLinks = profile.links.filter((l) => l.is_active)
  const activeSocials = profile.social_embeds.filter((s) => s.is_active)
  const services = await resolveServices(username, profile.id)

  const text = [
    `${profile.display_name || profile.username}`,
    `@${profile.username}`,
    '',
    profile.bio || '(No bio)',
    '',
    `Avatar: ${resolveAvatarUrl(profile.avatar_url) || 'None'}`,
    `Verified: ${profile.is_premium ? 'Yes' : 'No'}`,
    '',
    'Stats:',
    `  Links: ${activeLinks.length}`,
    `  Social accounts: ${activeSocials.length}`,
    `  Services: ${services.length}`,
    '',
    `Web: ${BASE_URL}/${profile.username}`,
    `API: ${BASE_URL}/api/profiles/${profile.username}`,
  ].join('\n')

  return { contents: [{ uri, mimeType: 'text/plain', text }] }
}

async function readLinksResource(
  username: string,
  uri: string
): Promise<ResourceReadResult | null> {
  const profile = await resolveProfile(username)
  if (!profile) return null

  const activeLinks = profile.links
    .filter((l) => l.is_active)
    .sort((a, b) => a.position - b.position)

  if (activeLinks.length === 0) {
    return {
      contents: [{ uri, mimeType: 'text/plain', text: 'No active links.' }],
    }
  }

  const lines = activeLinks.map(
    (l, i) => `${i + 1}. ${l.icon} ${l.title}\n   ${l.url}\n   Clicks: ${l.click_count}`
  )

  const text = `Links for @${username}\n\n${lines.join('\n\n')}`
  return { contents: [{ uri, mimeType: 'text/plain', text }] }
}

async function readServicesResource(
  username: string,
  uri: string
): Promise<ResourceReadResult | null> {
  const profile = await resolveProfile(username)
  if (!profile) return null

  const services = await resolveServices(username, profile.id)

  if (services.length === 0) {
    return {
      contents: [
        { uri, mimeType: 'text/plain', text: 'No active services.' },
      ],
    }
  }

  const lines = services.map((s, i) => {
    const price = formatPrice(s.pricing, s.price_amount, s.price_currency)
    return [
      `${i + 1}. ${s.title} (${s.category})`,
      `   ${s.description || 'No description'}`,
      `   Price: ${price}`,
      `   Action: ${s.action_type}`,
      `   ID: ${s.id}`,
    ].join('\n')
  })

  const text = `Services offered by @${username}\n\n${lines.join('\n\n')}`
  return { contents: [{ uri, mimeType: 'text/plain', text }] }
}

async function readSocialResource(
  username: string,
  uri: string
): Promise<ResourceReadResult | null> {
  const profile = await resolveProfile(username)
  if (!profile) return null

  const activeSocials = profile.social_embeds
    .filter((s) => s.is_active)
    .sort((a, b) => a.position - b.position)

  if (activeSocials.length === 0) {
    return {
      contents: [
        {
          uri,
          mimeType: 'text/plain',
          text: 'No social accounts connected.',
        },
      ],
    }
  }

  const lines = activeSocials.map(
    (s, i) => `${i + 1}. ${s.platform}: ${s.embed_url}`
  )

  const text = `Social media for @${username}\n\n${lines.join('\n')}`
  return { contents: [{ uri, mimeType: 'text/plain', text }] }
}
