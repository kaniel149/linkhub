'use client'

import { Link, Theme } from '@/lib/types/database'
import { m } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'

interface LinkButtonProps {
  link: Link
  theme: Theme
  primaryColor?: string
  onClick: () => void
  showClicks?: boolean
}

export function LinkButton({ link, theme, primaryColor, onClick, showClicks }: LinkButtonProps) {
  const color = theme?.primaryColor || primaryColor || '#38bdf8'

  return (
    <m.a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => onClick()}
      className="group relative flex items-center w-full rounded-2xl overflow-hidden"
      style={{ fontFamily: theme?.fontFamily || 'inherit' }}
      whileHover={{
        scale: 1.02,
        y: -3,
        transition: { type: 'spring', stiffness: 400, damping: 25 },
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Glass container */}
      <div className="relative flex items-center w-full px-5 py-4 bg-white/[0.04] border border-white/[0.07] backdrop-blur-xl rounded-2xl group-hover:bg-white/[0.08] group-hover:border-white/[0.15] transition-all duration-300">

        {/* Left accent line — animated height on hover */}
        <div
          className="absolute left-0 top-1/2 w-[2.5px] rounded-full transition-all duration-500 -translate-y-1/2 h-0 group-hover:h-[60%] opacity-0 group-hover:opacity-100"
          style={{ background: `linear-gradient(180deg, ${color}00, ${color}, ${color}00)` }}
        />

        {/* Hover glow behind card */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
          style={{ boxShadow: `0 4px 30px ${color}10, 0 0 60px ${color}08` }}
        />

        {/* Icon with bounce */}
        <m.span
          className="text-lg mr-4 flex-shrink-0 grayscale-[30%] group-hover:grayscale-0 transition-all duration-300"
          whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.4 }}
        >
          {link.icon}
        </m.span>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <span className="block text-[14px] font-medium text-white/80 group-hover:text-white transition-colors duration-300 truncate">
            {link.title}
          </span>
        </div>

        {/* Right side — clicks + arrow */}
        <div className="flex items-center gap-2 ml-3 flex-shrink-0">
          {showClicks && link.click_count > 0 && (
            <span className="text-[11px] text-white/20 group-hover:text-white/35 tabular-nums font-mono transition-colors duration-300">
              {link.click_count.toLocaleString()}
            </span>
          )}
          <div className="w-7 h-7 rounded-lg bg-white/[0.04] group-hover:bg-white/[0.1] flex items-center justify-center transition-all duration-300 group-hover:rotate-12">
            <ArrowUpRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/70 transition-all duration-300 group-hover:scale-110" />
          </div>
        </div>

        {/* Bottom glow line */}
        <div
          className="absolute bottom-0 left-4 right-4 h-[1px] opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:left-2 group-hover:right-2"
          style={{ background: `linear-gradient(90deg, transparent, ${color}50, transparent)` }}
        />

        {/* Top subtle glow */}
        <div
          className="absolute top-0 left-8 right-8 h-[1px] opacity-0 group-hover:opacity-60 transition-opacity duration-500"
          style={{ background: `linear-gradient(90deg, transparent, ${color}20, transparent)` }}
        />
      </div>
    </m.a>
  )
}
