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
}

export function LinkButton({ link, theme, onClick, showClicks }: LinkButtonProps) {
  return (
    <m.a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => onClick()}
      className="group relative flex items-center w-full h-14 rounded-[16px] overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        fontFamily: theme?.fontFamily || 'inherit',
      }}
      whileHover={{
        scale: 1.02,
        borderColor: 'rgba(255,255,255,0.15)',
        transition: { type: 'spring', stiffness: 400, damping: 30 },
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-[16px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: `0 0 30px ${theme.primaryColor}08, inset 0 0 30px ${theme.primaryColor}05` }}
      />

      {/* Icon */}
      <span className="text-[20px] ml-5 mr-3 flex-shrink-0">
        {link.icon}
      </span>

      {/* Title — centered */}
      <span className="flex-1 text-[15px] font-medium text-[#F5F5F7] truncate">
        {link.title}
      </span>

      {/* Right side */}
      <div className="flex items-center gap-2 mr-4 flex-shrink-0">
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
