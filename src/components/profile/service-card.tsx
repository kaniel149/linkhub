'use client'

import { Service, formatPrice, SERVICE_CATEGORY_LABELS, SERVICE_ACTION_LABELS } from '@/lib/types/database'
import { Theme } from '@/lib/types/database'
import { m } from 'motion/react'
import { ArrowRight, Calendar, MessageCircle, FileText, ShoppingCart, ExternalLink } from 'lucide-react'

interface ServiceCardProps {
  service: Service
  theme: Theme
  onContact: (service: Service) => void
}

const actionIcons: Record<string, typeof Calendar> = {
  book_meeting: Calendar,
  contact_form: MessageCircle,
  request_quote: FileText,
  buy_now: ShoppingCart,
  external_link: ExternalLink,
}

export function ServiceCard({ service, theme, onContact }: ServiceCardProps) {
  const Icon = actionIcons[service.action_type] || MessageCircle
  const priceDisplay = formatPrice(service.pricing, service.price_amount, service.price_currency)

  const handleClick = () => {
    if (service.action_type === 'external_link' && service.action_config?.url) {
      window.open(service.action_config.url as string, '_blank')
    } else {
      onContact(service)
    }
  }

  return (
    <m.div
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.99 }}
      className="group relative rounded-2xl overflow-hidden cursor-pointer"
      style={{
        background: `linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))`,
        backdropFilter: 'blur(20px)',
        border: `1px solid rgba(255,255,255,0.06)`,
      }}
      onClick={handleClick}
    >
      {/* Left accent */}
      <m.div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
        style={{ background: theme.primaryColor, opacity: 0.3 }}
        whileHover={{ opacity: 1 }}
      />

      <div className="px-5 py-4">
        {/* Top row: category + price */}
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full"
            style={{
              color: theme.primaryColor,
              background: `${theme.primaryColor}15`,
              border: `1px solid ${theme.primaryColor}20`,
            }}
          >
            {SERVICE_CATEGORY_LABELS[service.category]}
          </span>
          <span className="text-xs text-white/40 font-medium">{priceDisplay}</span>
        </div>

        {/* Title */}
        <h3 className="text-white/90 font-semibold text-sm mb-1 group-hover:text-white transition-colors">
          {service.title}
        </h3>

        {/* Description */}
        {service.description && (
          <p className="text-white/40 text-xs leading-relaxed line-clamp-2 mb-3">
            {service.description}
          </p>
        )}

        {/* CTA */}
        <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: `${theme.primaryColor}cc` }}>
          <Icon className="w-3.5 h-3.5" />
          <span>{SERVICE_ACTION_LABELS[service.action_type]}</span>
          <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </m.div>
  )
}
