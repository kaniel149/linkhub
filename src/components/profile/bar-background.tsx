'use client'

import { m, useMotionValue, useSpring, useMotionTemplate } from 'motion/react'
import { useEffect, useState, useCallback, useMemo } from 'react'

const PRIMARY = '#B76E79'
const SPARKLE_COLORS = ['#B76E79', '#D4AF37', '#F5C6CB', '#E8B4B8', '#C9A96E']

/* --- Cursor Spotlight (Desktop) --- */
function DesktopSpotlight() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const smoothX = useSpring(mouseX, { stiffness: 150, damping: 25 })
  const smoothY = useSpring(mouseY, { stiffness: 150, damping: 25 })
  const background = useMotionTemplate`radial-gradient(600px circle at ${smoothX}px ${smoothY}px, ${PRIMARY}14, transparent 70%)`

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    },
    [mouseX, mouseY],
  )

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  return (
    <m.div
      className="absolute inset-0 pointer-events-none"
      style={{ background }}
    />
  )
}

/* --- Cursor Spotlight (Mobile - auto drift) --- */
function MobileSpotlight() {
  return (
    <m.div
      className="absolute inset-0 pointer-events-none"
      animate={{
        background: [
          `radial-gradient(500px circle at 30% 30%, ${PRIMARY}10, transparent 70%)`,
          `radial-gradient(500px circle at 70% 50%, ${PRIMARY}10, transparent 70%)`,
          `radial-gradient(500px circle at 40% 70%, ${PRIMARY}10, transparent 70%)`,
          `radial-gradient(500px circle at 30% 30%, ${PRIMARY}10, transparent 70%)`,
        ],
      }}
      transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

/* --- Cursor Spotlight Wrapper --- */
function CursorSpotlight() {
  const [isMobile, setIsMobile] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setIsMobile(window.matchMedia('(pointer: coarse)').matches)
    setReady(true)
  }, [])

  if (!ready) return null
  return isMobile ? <MobileSpotlight /> : <DesktopSpotlight />
}

/* --- Sparkle / Shimmer Particles --- */
function SparkleParticles() {
  const [isMobile, setIsMobile] = useState(false)
  const [viewH, setViewH] = useState(1000)

  useEffect(() => {
    setIsMobile(window.matchMedia('(pointer: coarse)').matches)
    setViewH(window.innerHeight)
  }, [])

  const count = isMobile ? 18 : 35
  const sparkles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        size: 1.5 + Math.random() * 3.5,
        duration: 4 + Math.random() * 6,
        delay: Math.random() * 10,
        drift: (Math.random() - 0.5) * 80,
        color: SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)],
        startY: Math.random() * 100,
      })),
    [count],
  )

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {sparkles.map((s) => (
        <m.div
          key={s.id}
          className="absolute rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.startY}%`,
            width: s.size,
            height: s.size,
            background: s.color,
            boxShadow: `0 0 ${s.size * 4}px ${s.color}90`,
          }}
          animate={{
            y: [0, -(viewH * 0.3), -(viewH * 0.5)],
            x: [0, s.drift * 0.5, s.drift],
            opacity: [0, 0.95, 0.6, 0],
            scale: [0.3, 1.4, 1, 0.2],
          }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            delay: s.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

/* --- Gradient Mesh (Rose / Gold / Warm) --- */
function GradientMesh() {
  const blobs = [
    { x: '-10%', y: '-10%', w: 750, blur: 180, dur: 16, dx: 90, dy: 60, color: PRIMARY, opacity: 0.08 },
    { x: '70%', y: '60%', w: 600, blur: 150, dur: 13, dx: -70, dy: -50, color: '#D4AF37', opacity: 0.06 },
    { x: '30%', y: '40%', w: 500, blur: 130, dur: 15, dx: 60, dy: -60, color: '#8B5E6B', opacity: 0.05 },
    { x: '80%', y: '-5%', w: 450, blur: 160, dur: 18, dx: -50, dy: 80, color: '#C9A96E', opacity: 0.07 },
    { x: '-5%', y: '70%', w: 550, blur: 140, dur: 11, dx: 70, dy: -40, color: '#A0522D', opacity: 0.05 },
    { x: '50%', y: '20%', w: 400, blur: 120, dur: 20, dx: -40, dy: 50, color: '#F5C6CB', opacity: 0.04 },
  ]

  return (
    <>
      {blobs.map((b, i) => (
        <m.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: b.x,
            top: b.y,
            width: b.w,
            height: b.w,
            background: b.color,
            filter: `blur(${b.blur}px)`,
            opacity: b.opacity,
            mixBlendMode: 'screen',
          }}
          animate={{
            x: [0, b.dx, 0],
            y: [0, b.dy, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: b.dur, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </>
  )
}

/* --- Diagonal Lines (Runway / Fashion Pattern) --- */
function DiagonalLines() {
  return (
    <m.div
      className="absolute inset-0 pointer-events-none"
      animate={{ opacity: [0.015, 0.04, 0.015] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Diagonal runway lines */}
        {Array.from({ length: 12 }, (_, i) => (
          <line
            key={`diag-${i}`}
            x1={i * 100 - 200}
            y1={0}
            x2={i * 100 + 800}
            y2={1000}
            stroke={PRIMARY}
            strokeWidth="0.4"
            opacity={0.3 + (i % 3) * 0.1}
          />
        ))}
        {/* Horizontal accent lines */}
        <line x1="0" y1="250" x2="1000" y2="250" stroke={PRIMARY} strokeWidth="0.3" opacity="0.15" />
        <line x1="0" y1="500" x2="1000" y2="500" stroke={PRIMARY} strokeWidth="0.3" opacity="0.2" />
        <line x1="0" y1="750" x2="1000" y2="750" stroke={PRIMARY} strokeWidth="0.3" opacity="0.15" />
        {/* Diamond accent (runway catwalk marker) */}
        <path
          d="M 500 420 L 530 500 L 500 580 L 470 500 Z"
          fill="none"
          stroke="#D4AF37"
          strokeWidth="0.5"
          opacity="0.2"
        />
        {/* Outer frame lines */}
        <rect
          x="50"
          y="50"
          width="900"
          height="900"
          fill="none"
          stroke={PRIMARY}
          strokeWidth="0.3"
          opacity="0.08"
        />
      </svg>
    </m.div>
  )
}

/* --- Noise Texture --- */
function NoiseTexture() {
  return (
    <div
      className="absolute inset-0 opacity-[0.025]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }}
    />
  )
}

/* --- Main Background Component --- */
export function BarBackground() {
  return (
    <div className="fixed inset-0 -z-10" style={{ backgroundColor: '#050505' }}>
      <GradientMesh />
      <DiagonalLines />
      <CursorSpotlight />
      <SparkleParticles />
      <NoiseTexture />
    </div>
  )
}
