'use client'

import { m } from 'motion/react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { fadeUpVariants, spring } from '@/lib/motion'
import { type LucideIcon, Link2, BarChart3, Settings, FileText } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
  variant?: 'default' | 'links' | 'analytics' | 'settings'
}

const variantConfig = {
  default: {
    icon: FileText,
    gradient: 'from-zinc-500 to-zinc-600',
  },
  links: {
    icon: Link2,
    gradient: 'from-purple-500 to-pink-500',
  },
  analytics: {
    icon: BarChart3,
    gradient: 'from-blue-500 to-cyan-500',
  },
  settings: {
    icon: Settings,
    gradient: 'from-orange-500 to-amber-500',
  },
}

/**
 * EmptyState
 *
 * Animated empty state component for when there's no content to display.
 * Features a floating icon animation and staggered content reveal.
 *
 * Usage:
 * ```tsx
 * <EmptyState
 *   variant="links"
 *   title="No links yet"
 *   description="Add your first link to start building your profile"
 *   actionLabel="Add Your First Link"
 *   onAction={() => setIsAdding(true)}
 * />
 * ```
 */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
  variant = 'default',
}: EmptyStateProps) {
  const config = variantConfig[variant]
  const Icon = icon || config.icon

  return (
    <m.div
      initial="hidden"
      animate="visible"
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className
      )}
    >
      {/* Animated Icon Container */}
      <m.div
        className="relative mb-6"
        variants={fadeUpVariants}
        transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
      >
        {/* Glow effect */}
        <m.div
          className={cn(
            'absolute inset-0 rounded-full bg-gradient-to-br opacity-20 blur-2xl',
            config.gradient
          )}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Icon background */}
        <m.div
          className={cn(
            'relative flex items-center justify-center w-20 h-20 rounded-2xl',
            'bg-gradient-to-br shadow-lg',
            config.gradient
          )}
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Icon className="w-10 h-10 text-white" strokeWidth={1.5} />
        </m.div>
      </m.div>

      {/* Title */}
      <m.h3
        className="text-xl font-semibold text-zinc-100 mb-2"
        variants={fadeUpVariants}
        transition={{ duration: 0.5, delay: 0.1, ease: [0, 0, 0.2, 1] }}
      >
        {title}
      </m.h3>

      {/* Description */}
      {description && (
        <m.p
          className="text-zinc-400 max-w-sm mb-6"
          variants={fadeUpVariants}
          transition={{ duration: 0.5, delay: 0.2, ease: [0, 0, 0.2, 1] }}
        >
          {description}
        </m.p>
      )}

      {/* Action Button */}
      {actionLabel && onAction && (
        <m.div
          variants={fadeUpVariants}
          transition={{ duration: 0.5, delay: 0.3, ease: [0, 0, 0.2, 1] }}
        >
          <m.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={spring.default}
          >
            <Button
              onClick={onAction}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
              size="lg"
            >
              {actionLabel}
            </Button>
          </m.div>
        </m.div>
      )}
    </m.div>
  )
}

/**
 * EmptyStateLinks
 *
 * Pre-configured empty state for the links page.
 */
export function EmptyStateLinks({
  onAction,
  className,
}: {
  onAction?: () => void
  className?: string
}) {
  return (
    <EmptyState
      variant="links"
      title="No links yet"
      description="Add your first link to start building your profile. Your visitors will see these links on your public page."
      actionLabel="Add Your First Link"
      onAction={onAction}
      className={className}
    />
  )
}

/**
 * EmptyStateAnalytics
 *
 * Pre-configured empty state for the analytics page.
 */
export function EmptyStateAnalytics({ className }: { className?: string }) {
  return (
    <EmptyState
      variant="analytics"
      title="No analytics data yet"
      description="Share your profile link to start collecting visitor data. Analytics will appear here once you have some traffic."
      className={className}
    />
  )
}
