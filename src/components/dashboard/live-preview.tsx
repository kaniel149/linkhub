'use client'

import { m, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  staggerContainerFastVariants,
  fadeUpBlurVariants,
  spring,
} from '@/lib/motion'
import { type Link, type Profile, type Theme } from '@/lib/types/database'
import { ExternalLink, Smartphone } from 'lucide-react'

interface LivePreviewProps {
  profile: Profile | null
  links: Link[]
  theme?: Theme
  className?: string
}

const defaultTheme: Theme = {
  primaryColor: '#a855f7',
  backgroundColor: '#09090b',
  buttonStyle: 'solid',
}

/**
 * LivePreview
 *
 * Real-time phone preview of the user's public profile.
 * Updates automatically as users edit their links.
 *
 * Usage:
 * ```tsx
 * <LivePreview
 *   profile={profile}
 *   links={links}
 *   theme={profile?.theme}
 * />
 * ```
 */
export function LivePreview({
  profile,
  links,
  theme = defaultTheme,
  className,
}: LivePreviewProps) {
  const activeLinks = links.filter((l) => l.is_active)

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 text-zinc-400">
        <Smartphone className="h-4 w-4" />
        <span className="text-sm font-medium">Live Preview</span>
      </div>

      {/* Phone Frame */}
      <m.div
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
      >
        {/* Phone outer frame */}
        <div
          className={cn(
            'relative w-[280px] h-[580px]',
            'bg-zinc-900 rounded-[3rem]',
            'border-4 border-zinc-800',
            'shadow-2xl shadow-black/50',
            'overflow-hidden'
          )}
        >
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-zinc-800 rounded-b-2xl z-10" />

          {/* Screen content */}
          <div
            className="absolute inset-0 overflow-y-auto"
            style={{ backgroundColor: theme.backgroundColor }}
          >
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden">
              <m.div
                className="absolute top-1/4 left-1/4 w-48 h-48 rounded-full blur-3xl"
                style={{ backgroundColor: `${theme.primaryColor}15` }}
                animate={{
                  x: [0, 20, 0],
                  y: [0, 10, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </div>

            {/* Profile content */}
            <div className="relative pt-12 pb-8 px-4">
              <m.div
                variants={staggerContainerFastVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col items-center"
              >
                {/* Avatar */}
                <m.div variants={fadeUpBlurVariants}>
                  <Avatar
                    className="w-20 h-20 ring-4 ring-white/10"
                    style={{ boxShadow: `0 0 30px ${theme.primaryColor}30` }}
                  >
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="text-xl bg-zinc-800 text-white">
                      {profile?.display_name?.[0] ||
                        profile?.username?.[0]?.toUpperCase() ||
                        '?'}
                    </AvatarFallback>
                  </Avatar>
                </m.div>

                {/* Name */}
                <m.h2
                  variants={fadeUpBlurVariants}
                  className="text-lg font-bold text-white mt-4"
                >
                  {profile?.display_name || profile?.username || 'Your Name'}
                </m.h2>

                {/* Bio */}
                {profile?.bio && (
                  <m.p
                    variants={fadeUpBlurVariants}
                    className="text-sm text-zinc-400 text-center mt-1 px-4"
                  >
                    {profile.bio}
                  </m.p>
                )}

                {/* Links */}
                <div className="w-full mt-6 space-y-2.5">
                  <AnimatePresence mode="popLayout">
                    {activeLinks.length > 0 ? (
                      activeLinks.map((link, index) => (
                        <m.div
                          key={link.id}
                          layout
                          variants={fadeUpBlurVariants}
                          initial="hidden"
                          animate="visible"
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{
                            layout: spring.default,
                            delay: index * 0.05,
                          }}
                        >
                          <PreviewLinkButton
                            link={link}
                            primaryColor={theme.primaryColor}
                            style={theme.buttonStyle}
                          />
                        </m.div>
                      ))
                    ) : (
                      <m.div
                        variants={fadeUpBlurVariants}
                        className="text-center py-8"
                      >
                        <p className="text-zinc-500 text-sm">No active links</p>
                        <p className="text-zinc-600 text-xs mt-1">
                          Add links to see them here
                        </p>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Powered by */}
                {!profile?.is_premium && (
                  <m.p
                    variants={fadeUpBlurVariants}
                    className="text-xs text-zinc-600 mt-8"
                  >
                    Powered by LinkHub
                  </m.p>
                )}
              </m.div>
            </div>
          </div>
        </div>

        {/* Reflection effect */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-gradient-to-t from-transparent to-white/5 blur-xl rounded-full" />
      </m.div>

      {/* Visit link button */}
      {profile?.username && (
        <m.a
          href={`/${profile.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'mt-6 flex items-center gap-2 px-4 py-2 rounded-lg',
            'text-sm text-zinc-400 hover:text-white',
            'bg-zinc-800/50 hover:bg-zinc-800',
            'transition-colors'
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ExternalLink className="h-4 w-4" />
          Visit Profile
        </m.a>
      )}
    </div>
  )
}

/**
 * PreviewLinkButton
 *
 * Link button styled for the preview.
 */
interface PreviewLinkButtonProps {
  link: Link
  primaryColor: string
  style?: 'solid' | 'outline' | 'glass' | 'soft'
}

function PreviewLinkButton({
  link,
  primaryColor,
  style = 'solid',
}: PreviewLinkButtonProps) {
  const buttonStyles = {
    solid: {
      backgroundColor: primaryColor,
      color: 'white',
      border: 'none',
    },
    outline: {
      backgroundColor: 'transparent',
      color: primaryColor,
      border: `2px solid ${primaryColor}`,
    },
    glass: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(8px)',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    soft: {
      backgroundColor: `${primaryColor}20`,
      color: primaryColor,
      border: 'none',
    },
  }

  return (
    <m.div
      className="w-full px-4 py-3 rounded-xl text-center text-sm font-medium cursor-pointer"
      style={buttonStyles[style]}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={spring.snappy}
    >
      <span className="flex items-center justify-center gap-2">
        {link.icon && <span>{link.icon}</span>}
        {link.title}
      </span>
    </m.div>
  )
}

/**
 * LivePreviewSkeleton
 *
 * Loading skeleton for LivePreview.
 */
export function LivePreviewSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="flex items-center gap-2 mb-4">
        <div className="h-4 w-4 bg-zinc-800 rounded animate-pulse" />
        <div className="h-4 w-20 bg-zinc-800 rounded animate-pulse" />
      </div>

      <div className="relative w-[280px] h-[580px] bg-zinc-900 rounded-[3rem] border-4 border-zinc-800 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-zinc-800 rounded-b-2xl" />
        <div className="pt-12 px-4 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-zinc-800 animate-pulse" />
          <div className="h-5 w-24 bg-zinc-800 rounded mt-4 animate-pulse" />
          <div className="h-3 w-32 bg-zinc-800 rounded mt-2 animate-pulse" />
          <div className="w-full mt-6 space-y-2.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-12 w-full bg-zinc-800 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
