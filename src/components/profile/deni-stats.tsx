'use client'

import { useEffect, useRef } from 'react'
import { m, useMotionValue, useSpring } from 'motion/react'

// ─── Animated Number Display ───
function AnimatedNumber({ value, decimals = 1 }: { value: number; decimals?: number }) {
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, { stiffness: 80, damping: 20 })
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    motionValue.set(value)
  }, [motionValue, value])

  useEffect(() => {
    const unsubscribe = springValue.on('change', (v) => {
      if (ref.current) {
        ref.current.textContent = v.toFixed(decimals)
      }
    })
    return unsubscribe
  }, [springValue, decimals])

  return <span ref={ref}>0</span>
}

// ─── NBA Stats Strip ───
interface DeniStatsProps {
  primaryColor?: string
}

export function DeniStats({ primaryColor = '#E03A3E' }: DeniStatsProps) {
  const stats = [
    { value: 25.5, label: 'PPG', decimals: 1 },
    { value: 7.2, label: 'RPG', decimals: 1 },
    { value: 6.7, label: 'APG', decimals: 1 },
  ]

  return (
    <m.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5, ease: [0, 0, 0.2, 1] }}
      className="w-full rounded-[16px] overflow-hidden mb-5"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex items-center justify-around py-4 px-3">
        {stats.map((stat, i) => (
          <div key={stat.label} className="flex flex-col items-center relative">
            <span
              className="text-[28px] sm:text-[32px] font-bold text-[#F5F5F7]"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              <AnimatedNumber value={stat.value} decimals={stat.decimals} />
            </span>
            <span className="text-[11px] uppercase tracking-[0.1em] text-[#6E6E73] mt-0.5 font-medium">
              {stat.label}
            </span>
            {/* Red underline glow */}
            <div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-full"
              style={{
                background: primaryColor,
                boxShadow: `0 0 8px ${primaryColor}80, 0 0 16px ${primaryColor}40`,
              }}
            />
            {/* Divider between stats */}
            {i < stats.length - 1 && (
              <div className="absolute right-[-28px] sm:right-[-36px] top-1/2 -translate-y-1/2 w-[1px] h-8 bg-white/[0.06]" />
            )}
          </div>
        ))}
      </div>
    </m.div>
  )
}

// ─── 2026 ALL-STAR Badge ───
interface DeniAllStarBadgeProps {
  primaryColor?: string
}

export function DeniAllStarBadge({ primaryColor = '#E03A3E' }: DeniAllStarBadgeProps) {
  return (
    <m.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.25, type: 'spring', stiffness: 300, damping: 20 }}
      className="relative mb-2"
    >
      {/* Outer wrapper — rotating gradient border via overflow-hidden + oversized rotating gradient */}
      <div className="relative rounded-full overflow-hidden p-[1.5px]">
        {/* Rotating conic gradient */}
        <m.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-[-100%]"
          style={{
            background: `conic-gradient(from 0deg, ${primaryColor}, #FFD700, ${primaryColor}80, #FFD700, ${primaryColor})`,
          }}
        />
        {/* Inner content */}
        <div
          className="relative rounded-full px-4 py-1.5 flex items-center gap-1.5"
          style={{
            background: 'rgba(5,5,5,0.85)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <span className="text-[12px]">⭐</span>
          <span
            className="text-[11px] font-bold uppercase tracking-[0.12em]"
            style={{
              color: '#FFD700',
              textShadow: '0 0 10px rgba(255,215,0,0.4), 0 0 20px rgba(255,215,0,0.2)',
            }}
          >
            2026 NBA ALL-STAR
          </span>
          <span className="text-[12px]">⭐</span>
        </div>
      </div>

      {/* Pulse glow overlay */}
      <m.div
        className="absolute inset-0 rounded-full pointer-events-none"
        animate={{
          boxShadow: [
            `0 0 10px ${primaryColor}30, 0 0 20px #FFD70015`,
            `0 0 20px ${primaryColor}50, 0 0 40px #FFD70025`,
            `0 0 10px ${primaryColor}30, 0 0 20px #FFD70015`,
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </m.div>
  )
}
