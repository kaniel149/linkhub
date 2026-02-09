'use client'

import { m, useMotionValue, useSpring, useMotionTemplate } from 'motion/react'
import { useEffect, useState, useCallback, useMemo } from 'react'

const PRIMARY = '#FF0000'
const WARM_COLORS = ['#FF0000', '#FF4500', '#FF6347', '#FFD700']

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

/* --- Cursor Spotlight (Mobile --- auto-drift) --- */
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

/* --- Globe Dotted Pattern (SVG world map dots) --- */
function GlobePattern() {
  // Generate dots in a globe/sphere arrangement
  const dots = useMemo(() => {
    const result: { cx: number; cy: number; r: number; opacity: number }[] = []
    const centerX = 500
    const centerY = 500
    const radius = 380

    for (let lat = -80; lat <= 80; lat += 12) {
      const latRad = (lat * Math.PI) / 180
      const y = centerY - radius * Math.sin(latRad)
      const rowRadius = radius * Math.cos(latRad)
      const circumference = 2 * Math.PI * rowRadius
      const dotCount = Math.max(4, Math.floor(circumference / 28))

      for (let i = 0; i < dotCount; i++) {
        const lon = (i / dotCount) * 360 - 180
        const lonRad = (lon * Math.PI) / 180
        const x = centerX + rowRadius * Math.sin(lonRad)
        // Only show front hemisphere (z > 0)
        const z = Math.cos(lonRad)
        if (z > -0.1) {
          result.push({
            cx: x,
            cy: y,
            r: 1.2 + z * 0.8,
            opacity: 0.15 + z * 0.25,
          })
        }
      }
    }
    return result
  }, [])

  return (
    <m.svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid slice"
      animate={{ opacity: [0.04, 0.1, 0.04] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Equator line */}
      <ellipse
        cx="500"
        cy="500"
        rx="380"
        ry="20"
        fill="none"
        stroke={PRIMARY}
        strokeWidth="0.5"
        opacity="0.15"
        strokeDasharray="4 6"
      />
      {/* Globe outline circle */}
      <circle
        cx="500"
        cy="500"
        r="380"
        fill="none"
        stroke={PRIMARY}
        strokeWidth="0.5"
        opacity="0.1"
      />
      {/* Meridian lines */}
      <ellipse
        cx="500"
        cy="500"
        rx="190"
        ry="380"
        fill="none"
        stroke={PRIMARY}
        strokeWidth="0.4"
        opacity="0.08"
      />
      <ellipse
        cx="500"
        cy="500"
        rx="320"
        ry="380"
        fill="none"
        stroke={PRIMARY}
        strokeWidth="0.3"
        opacity="0.06"
      />
      {/* Dots arranged as globe surface */}
      {dots.map((dot, i) => (
        <circle
          key={i}
          cx={dot.cx}
          cy={dot.cy}
          r={dot.r}
          fill={PRIMARY}
          opacity={dot.opacity}
        />
      ))}
    </m.svg>
  )
}

/* --- Animated Gradient Mesh --- */
function GradientMesh() {
  const blobs = [
    { x: '-10%', y: '-10%', w: 750, blur: 180, dur: 16, dx: 90, dy: 50, color: PRIMARY, opacity: 0.07 },
    { x: '70%', y: '60%', w: 550, blur: 140, dur: 12, dx: -70, dy: -40, color: '#8B0000', opacity: 0.05 },
    { x: '30%', y: '40%', w: 500, blur: 120, dur: 14, dx: 50, dy: -60, color: '#FF4500', opacity: 0.04 },
    { x: '80%', y: '-5%', w: 400, blur: 160, dur: 18, dx: -40, dy: 70, color: '#CC0000', opacity: 0.06 },
    { x: '-5%', y: '70%', w: 500, blur: 130, dur: 10, dx: 60, dy: -30, color: '#FFD700', opacity: 0.04 },
    { x: '50%', y: '20%', w: 350, blur: 100, dur: 20, dx: -30, dy: 40, color: '#FF6347', opacity: 0.03 },
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

/* --- Floating Location Pin Particles --- */
function LocationPinParticles() {
  const [isMobile, setIsMobile] = useState(false)
  const [viewH, setViewH] = useState(1000)

  useEffect(() => {
    setIsMobile(window.matchMedia('(pointer: coarse)').matches)
    setViewH(window.innerHeight)
  }, [])

  const count = isMobile ? 10 : 20
  const pins = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        size: 8 + Math.random() * 8,
        duration: 6 + Math.random() * 8,
        delay: Math.random() * 10,
        drift: (Math.random() - 0.5) * 40,
        color: WARM_COLORS[Math.floor(Math.random() * WARM_COLORS.length)],
      })),
    [count],
  )

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pins.map((p) => (
        <m.div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            bottom: -20,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -(viewH + 60)],
            x: [0, p.drift],
            opacity: [0, 0.6, 0.5, 0],
            scale: [0.4, 1, 0.7, 0.2],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeOut',
          }}
        >
          {/* Location pin shape via SVG */}
          <svg
            viewBox="0 0 24 24"
            fill={p.color}
            width={p.size}
            height={p.size}
            opacity={0.5}
          >
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
        </m.div>
      ))}
    </div>
  )
}

/* --- Main Background Component --- */
export function NasBackground() {
  return (
    <div className="fixed inset-0 -z-10" style={{ backgroundColor: '#050505' }}>
      <GradientMesh />
      <GlobePattern />
      <CursorSpotlight />
      <LocationPinParticles />
      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}
