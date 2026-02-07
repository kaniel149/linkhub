import { ProfileWithLinks, Service } from '@/lib/types/database'

const BASE_URL = 'https://linkhub-iota-red.vercel.app'

interface JsonLdProps {
  profile: ProfileWithLinks
  services?: Service[]
}

export function JsonLd({ profile, services = [] }: JsonLdProps) {
  const activeSocials = profile.social_embeds?.filter(s => s.is_active) || []
  const sameAs = activeSocials.map(s => s.embed_url)
  const activeServices = services.filter(s => s.is_active)

  const makesOffer = activeServices.map(service => ({
    '@type': 'Offer',
    'name': service.title,
    'description': service.description || undefined,
    'price': service.price_amount ?? undefined,
    'priceCurrency': service.price_amount ? service.price_currency : undefined,
    'category': service.category,
    'availability': 'https://schema.org/InStock',
  }))

  const jsonLd: Record<string, any> = {
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
      'makesOffer': makesOffer.length > 0 ? makesOffer : undefined,
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': `${BASE_URL}/${profile.username}`,
      },
    },
  }

  // Add potential action for contact services
  if (activeServices.some(s => ['contact_form', 'request_quote'].includes(s.action_type))) {
    jsonLd.mainEntity.potentialAction = {
      '@type': 'CommunicateAction',
      'target': `${BASE_URL}/${profile.username}`,
      'name': 'Contact',
    }
  }

  const cleanJsonLd = JSON.parse(JSON.stringify(jsonLd))

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(cleanJsonLd, null, 0) }}
    />
  )
}
