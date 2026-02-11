'use client'

import { m, useMotionValue, useSpring, useScroll, useTransform, useMotionTemplate } from 'motion/react'
import { useEffect, useState, useCallback } from 'react'

const PRIMARY = '#E03A3E'
const EMBER_COLORS = ['#E03A3E', '#FF6B35', '#FFD700']

/* ─── Cursor Spotlight (Desktop) ─── */
function DesktopSpotlight() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const smoothX = useSpring(mouseX, { stiffness: 150, damping: 25 })
  const smoothY = useSpring(mouseY, { stiffness: 150, damping: 25 })
  const background = useMotionTemplate`radial-gradient(600px circle at ${smoothX}px ${smoothY}px, ${PRIMARY}12, transparent 70%)`

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

/* ─── Cursor Spotlight (Mobile — auto-drift) ─── */
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

/* ─── Cursor Spotlight Wrapper ─── */
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

/* ─── Giant Jersey #8 Watermark ─── */
function JerseyWatermark() {
  const { scrollY } = useScroll()
  const watermarkY = useTransform(scrollY, [0, 1000], [0, -200])

  return (
    <m.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
      style={{ y: watermarkY }}
    >
      <m.span
        className="font-black bg-clip-text text-transparent bg-[length:200%_200%] leading-none"
        style={{
          fontSize: '50vh',
          backgroundImage: `linear-gradient(135deg, ${PRIMARY}18 0%, ${PRIMARY}0A 30%, ${PRIMARY}14 50%, ${PRIMARY}08 70%, ${PRIMARY}10 100%)`,
          opacity: 1,
        }}
        animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      >
        8
      </m.span>
    </m.div>
  )
}

/* ─── Animated Gradient Mesh ─── */
function GradientMesh() {
  const blobs = [
    { x: '-10%', y: '-10%', w: 800, blur: 180, dur: 16, dx: 100, dy: 60, color: PRIMARY, opacity: 0.12 },
    { x: '70%', y: '60%', w: 600, blur: 140, dur: 12, dx: -80, dy: -50, color: '#8B0000', opacity: 0.09 },
    { x: '30%', y: '40%', w: 500, blur: 120, dur: 14, dx: 60, dy: -70, color: '#FF6B35', opacity: 0.07 },
    { x: '80%', y: '-5%', w: 450, blur: 160, dur: 18, dx: -50, dy: 80, color: PRIMARY, opacity: 0.10 },
    { x: '-5%', y: '70%', w: 550, blur: 130, dur: 10, dx: 70, dy: -40, color: '#4A0404', opacity: 0.08 },
    { x: '50%', y: '20%', w: 350, blur: 100, dur: 20, dx: -40, dy: 50, color: '#DC143C', opacity: 0.06 },
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
            scale: [1, 1.25, 1],
          }}
          transition={{ duration: b.dur, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </>
  )
}

/* ─── Rising Ember Particles ─── */
function EmberParticles() {
  const [isMobile, setIsMobile] = useState(false)
  const [viewH, setViewH] = useState(1000)

  useEffect(() => {
    setIsMobile(window.matchMedia('(pointer: coarse)').matches)
    setViewH(window.innerHeight)
  }, [])

  const count = isMobile ? 15 : 30
  const embers = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    size: 2 + Math.random() * 4,
    duration: 3 + Math.random() * 5,
    delay: Math.random() * 8,
    drift: (Math.random() - 0.5) * 60,
    color: EMBER_COLORS[Math.floor(Math.random() * EMBER_COLORS.length)],
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {embers.map((e) => (
        <m.div
          key={e.id}
          className="absolute rounded-full"
          style={{
            left: `${e.x}%`,
            bottom: -10,
            width: e.size,
            height: e.size,
            background: e.color,
            boxShadow: `0 0 ${e.size * 4}px ${e.color}80`,
          }}
          animate={{
            y: [0, -(viewH + 50)],
            x: [0, e.drift],
            opacity: [0, 0.9, 0.7, 0],
            scale: [0.5, 1.2, 0.8, 0.3],
          }}
          transition={{
            duration: e.duration,
            repeat: Infinity,
            delay: e.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}

/* ─── Pulsing Court-Line Pattern ─── */
function CourtLines() {
  return (
    <m.svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid slice"
      animate={{ opacity: [0.04, 0.12, 0.04] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Free-throw circle */}
      <circle
        cx="500"
        cy="750"
        r="120"
        fill="none"
        stroke={PRIMARY}
        strokeWidth="1"
        opacity="0.5"
      />
      {/* 3-point arc */}
      <path
        d="M 250 1000 Q 250 500 500 450 Q 750 500 750 1000"
        fill="none"
        stroke={PRIMARY}
        strokeWidth="0.8"
        opacity="0.3"
      />
      {/* Center circle */}
      <circle
        cx="500"
        cy="300"
        r="80"
        fill="none"
        stroke={PRIMARY}
        strokeWidth="0.6"
        opacity="0.25"
      />
      {/* Half-court line */}
      <line
        x1="0"
        y1="500"
        x2="1000"
        y2="500"
        stroke={PRIMARY}
        strokeWidth="0.5"
        opacity="0.15"
      />
    </m.svg>
  )
}

/* ─── Main Background Component ─── */
export function DeniBackground() {
  return (
    <div className="fixed inset-0 -z-10" style={{ backgroundColor: '#050505' }}>
      <GradientMesh />
      <CourtLines />
      <JerseyWatermark />
      <CursorSpotlight />
      <EmberParticles />
      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}
