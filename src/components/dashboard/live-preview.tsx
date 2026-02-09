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
  primaryColor: '#0071E3',
  backgroundColor: '#000000',
  buttonStyle: 'solid',
}

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
      <div className="flex items-center gap-2 mb-4 text-[#6E6E73]">
        <Smartphone className="h-4 w-4" />
        <span className="text-[12px] font-medium uppercase tracking-[0.08em]">Live Preview</span>
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
            'bg-black rounded-[3rem]',
            'border-[3px] border-[#1a1a1a]',
            'shadow-[0_20px_50px_rgba(0,0,0,0.6)]',
            'overflow-hidden'
          )}
        >
          {/* Notch / Dynamic Island */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[90px] h-[25px] bg-black rounded-full z-10" />

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
            <div className="relative pt-14 pb-8 px-4">
              <m.div
                variants={staggerContainerFastVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col items-center"
              >
                {/* Avatar */}
                <m.div variants={fadeUpBlurVariants}>
                  <Avatar
                    className="w-20 h-20 ring-2 ring-[rgba(255,255,255,0.08)]"
                    style={{ boxShadow: `0 0 30px ${theme.primaryColor}30` }}
                  >
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="text-xl bg-[var(--lh-surface-3)] text-[#F5F5F7]">
                      {profile?.display_name?.[0] ||
                        profile?.username?.[0]?.toUpperCase() ||
                        '?'}
                    </AvatarFallback>
                  </Avatar>
                </m.div>

                {/* Name */}
                <m.h2
                  variants={fadeUpBlurVariants}
                  className="text-[16px] font-bold text-[#F5F5F7] mt-4"
                >
                  {profile?.display_name || profile?.username || 'Your Name'}
                </m.h2>

                {/* Bio */}
                {profile?.bio && (
                  <m.p
                    variants={fadeUpBlurVariants}
                    className="text-[12px] text-[#86868B] text-center mt-1 px-4"
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
                        <p className="text-[#6E6E73] text-[12px]">No active links</p>
                        <p className="text-[#48484A] text-[11px] mt-1">
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
                    className="text-[11px] text-[#48484A] mt-8"
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
            'mt-6 flex items-center gap-2 px-4 py-2 rounded-full',
            'text-[13px] text-[#0071E3] hover:text-[#0077ED]',
            'bg-[rgba(0,113,227,0.08)] hover:bg-[rgba(0,113,227,0.12)]',
            'transition-colors duration-200'
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open Profile
        </m.a>
      )}
    </div>
  )
}

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

export function LivePreviewSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="flex items-center gap-2 mb-4">
        <div className="h-4 w-4 bg-[var(--lh-surface-3)] rounded animate-pulse" />
        <div className="h-4 w-20 bg-[var(--lh-surface-3)] rounded animate-pulse" />
      </div>

      <div className="relative w-[280px] h-[580px] bg-black rounded-[3rem] border-[3px] border-[#1a1a1a] overflow-hidden">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[90px] h-[25px] bg-black rounded-full" />
        <div className="pt-14 px-4 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-[var(--lh-surface-3)] animate-pulse" />
          <div className="h-5 w-24 bg-[var(--lh-surface-3)] rounded mt-4 animate-pulse" />
          <div className="h-3 w-32 bg-[var(--lh-surface-3)] rounded mt-2 animate-pulse" />
          <div className="w-full mt-6 space-y-2.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-12 w-full bg-[var(--lh-surface-3)] rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
