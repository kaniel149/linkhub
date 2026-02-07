import { ProfileWithLinks } from '@/lib/types/database'

const BASE_URL = 'https://linkhub-iota-red.vercel.app'

interface JsonLdProps {
  profile: ProfileWithLinks
}

export function JsonLd({ profile }: JsonLdProps) {
  const activeSocials = profile.social_embeds?.filter(s => s.is_active) || []

  const sameAs = activeSocials.map(s => s.embed_url)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    'dateCreated': profile.created_at,
    'dateModified': profile.updated_at,
    'mainEntity': {
      '@type': 'Person',
      'name': profile.display_name || profile.username,
      'alternateName': `@${profile.username}`,
      'description': profile.bio || undefined,
      'image': profile.avatar_url ? `${BASE_URL}${profile.avatar_url.startsWith('/') ? '' : '/'}${profile.avatar_url}` : undefined,
      'url': `${BASE_URL}/${profile.username}`,
      'sameAs': sameAs.length > 0 ? sameAs : undefined,
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': `${BASE_URL}/${profile.username}`,
      },
    },
  }

  // Clean undefined values
  const cleanJsonLd = JSON.parse(JSON.stringify(jsonLd))

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(cleanJsonLd, null, 0) }}
    />
  )
}
