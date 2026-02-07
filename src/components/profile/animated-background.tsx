'use client'

import { m } from 'motion/react'

interface AnimatedBackgroundProps {
  primaryColor: string
  backgroundColor: string
}

export function AnimatedBackground({ primaryColor, backgroundColor }: AnimatedBackgroundProps) {
  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden"
      style={{ backgroundColor }}
    >
      {/* Primary gradient orbs */}
      <m.div
        className="absolute -top-1/3 -left-1/4 w-[600px] h-[600px] rounded-full opacity-20 blur-[100px]"
        style={{ background: primaryColor }}
        animate={{
          x: [0, 60, 0],
          y: [0, 40, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <m.div
        className="absolute -bottom-1/3 -right-1/4 w-[500px] h-[500px] rounded-full opacity-15 blur-[80px]"
        style={{ background: primaryColor }}
        animate={{
          x: [0, -50, 0],
          y: [0, -30, 0],
          scale: [1.1, 1, 1.1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Secondary accent orb */}
      <m.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full opacity-[0.08] blur-[60px]"
        style={{ background: `linear-gradient(135deg, ${primaryColor}, transparent)` }}
        animate={{
          rotate: [0, 360],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Subtle noise texture */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '128px 128px',
      }} />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.04]" />

      {/* Top-down gradient fade */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${backgroundColor}00 0%, ${backgroundColor}40 50%, ${backgroundColor}cc 100%)`,
        }}
      />
    </div>
  )
}
