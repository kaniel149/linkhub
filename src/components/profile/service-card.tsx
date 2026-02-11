'use client'

import { Service, formatPrice, SERVICE_CATEGORY_LABELS, SERVICE_ACTION_LABELS } from '@/lib/types/database'
import { Theme } from '@/lib/types/database'
import { m } from 'motion/react'
import { ArrowRight, Calendar, MessageCircle, FileText, ShoppingCart, ExternalLink } from 'lucide-react'

interface ServiceCardProps {
  service: Service
  theme: Theme
  onContact: (service: Service) => void
  onBooking?: (service: Service) => void
  onPayment?: (service: Service) => void
}

const actionIcons: Record<string, typeof Calendar> = {
  book_meeting: Calendar,
  contact_form: MessageCircle,
  request_quote: FileText,
  buy_now: ShoppingCart,
  external_link: ExternalLink,
}

export function ServiceCard({ service, theme, onContact, onBooking, onPayment }: ServiceCardProps) {
  const Icon = actionIcons[service.action_type] || MessageCircle
  const priceDisplay = formatPrice(service.pricing, service.price_amount, service.price_currency)

  const handleClick = () => {
    if (service.action_type === 'book_meeting' && onBooking) {
      onBooking(service)
    } else if (service.action_type === 'buy_now' && onPayment) {
      onPayment(service)
    } else if (service.action_type === 'external_link' && service.action_config?.url) {
      window.open(service.action_config.url as string, '_blank')
    } else {
      onContact(service)
    }
  }

  return (
    <m.div
      whileHover={{ scale: 1.01, y: -1 }}
      whileTap={{ scale: 0.99 }}
      className="group relative rounded-[16px] overflow-hidden cursor-pointer"
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
      onClick={handleClick}
    >
      {/* Gradient left accent bar */}
      <div
        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
        style={{
          background: `linear-gradient(to bottom, ${theme.primaryColor}, ${theme.primaryColor}30)`,
        }}
      />

      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-[16px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: `0 0 25px ${theme.primaryColor}15, inset 0 0 25px ${theme.primaryColor}08` }}
      />

      <div className="px-5 py-4">
        {/* Top row: category + price */}
        <div className="flex items-center justify-between mb-2.5">
          <span
            className="text-[10px] uppercase tracking-[0.08em] font-medium px-2 py-0.5 rounded-full"
            style={{
              color: theme.primaryColor,
              background: `${theme.primaryColor}20`,
            }}
          >
            {SERVICE_CATEGORY_LABELS[service.category]}
          </span>
          {priceDisplay && (
            <span
              className="text-base font-bold"
              style={{ color: theme.primaryColor }}
            >
              {priceDisplay}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-[#F5F5F7] font-semibold text-[15px] mb-1 group-hover:text-white transition-colors duration-200">
          {service.title}
        </h3>

        {/* Description */}
        {service.description && (
          <p className="text-[#86868B] text-[13px] leading-relaxed line-clamp-2 mb-3">
            {service.description}
          </p>
        )}

        {/* CTA button — pill with fill on hover */}
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 group-hover:opacity-100 opacity-80 relative overflow-hidden"
          style={{
            color: theme.primaryColor,
            border: `1px solid ${theme.primaryColor}30`,
          }}
        >
          {/* Fill background on hover */}
          <div
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{ background: `${theme.primaryColor}20` }}
          />
          <Icon className="w-3.5 h-3.5 relative z-[1]" />
          <span className="relative z-[1]">{SERVICE_ACTION_LABELS[service.action_type]}</span>
          <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200 relative z-[1]" />
        </div>
      </div>
    </m.div>
  )
}
