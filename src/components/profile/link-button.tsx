'use client'

import { Link, Theme } from '@/lib/types/database'
import { m } from 'motion/react'
import { ArrowRight } from 'lucide-react'

interface LinkButtonProps {
  link: Link
  theme: Theme
  primaryColor?: string
  onClick: () => void
  showClicks?: boolean
  featured?: boolean
}

export function LinkButton({ link, theme, onClick, showClicks, featured }: LinkButtonProps) {
  return (
    <m.a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => onClick()}
      className={`group relative flex items-center w-full ${featured ? 'min-h-16' : 'min-h-14'} rounded-[16px] overflow-hidden`}
      style={{
        background: featured ? 'transparent' : 'rgba(255,255,255,0.05)',
        border: featured ? 'none' : '1px solid rgba(255,255,255,0.08)',
        fontFamily: theme?.fontFamily || 'inherit',
      }}
      whileHover={{
        scale: 1.02,
        transition: { type: 'spring', stiffness: 400, damping: 30 },
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Featured: animated gradient border + sparkle */}
      {featured && (
        <>
          {/* Rotating gradient border layer */}
          <div className="absolute inset-0 rounded-[16px] overflow-hidden pointer-events-none">
            <m.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-[-100%]"
              style={{
                background: `conic-gradient(from 0deg, ${theme.primaryColor}, #FFD700, ${theme.primaryColor}80, #FFD700, ${theme.primaryColor})`,
              }}
            />
          </div>
          {/* Inner background (hides gradient except at border edge) */}
          <div
            className="absolute inset-[1.5px] rounded-[14.5px] pointer-events-none"
            style={{ background: 'rgba(8,8,8,0.92)' }}
          />
          {/* Corner sparkle */}
          <m.div
            className="absolute top-2.5 right-3 text-[10px] pointer-events-none z-[3]"
            style={{ color: '#FFD700' }}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.5, 1, 0.5],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            ✦
          </m.div>
        </>
      )}

      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-[16px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: `0 0 30px ${theme.primaryColor}15, inset 0 0 30px ${theme.primaryColor}10` }}
      />

      {/* Icon */}
      <span className="text-[20px] ml-5 mr-3 flex-shrink-0 relative z-[2]">
        {link.icon}
      </span>

      {/* Title */}
      <span className="flex-1 text-[15px] font-medium text-[#F5F5F7] line-clamp-2 py-2 relative z-[2]">
        {link.title}
      </span>

      {/* Right side */}
      <div className="flex items-center gap-2 mr-4 flex-shrink-0 relative z-[2]">
        {showClicks && link.click_count > 0 && (
          <span className="text-[11px] text-[#6E6E73] tabular-nums">
            {link.click_count.toLocaleString()}
          </span>
        )}
        <ArrowRight className="w-4 h-4 text-[#6E6E73] group-hover:text-[#86868B] transition-colors duration-200" />
      </div>
    </m.a>
  )
}
