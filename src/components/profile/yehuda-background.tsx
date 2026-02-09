'use client'

import { m, useMotionValue, useSpring, useMotionTemplate } from 'motion/react'
import { useEffect, useState, useCallback } from 'react'

const PRIMARY = '#3B82F6'
const HEART_COLORS = ['#EF4444', '#F87171', '#FB923C', '#EC4899']

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

/* ─── Halftone Dot Pattern (Comic Book Style) ─── */
function HalftonePattern() {
  const dots: { cx: number; cy: number; r: number }[] = []
  const spacing = 40
  const cols = Math.ceil(1000 / spacing)
  const rows = Math.ceil(1000 / spacing)

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const offsetX = row % 2 === 0 ? 0 : spacing / 2
      dots.push({
        cx: col * spacing + offsetX,
        cy: row * spacing,
        r: 1.5 + Math.random() * 1.5,
      })
    }
  }

  return (
    <m.svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid slice"
      animate={{ opacity: [0.03, 0.07, 0.03] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    >
      {dots.map((dot, i) => (
        <circle
          key={i}
          cx={dot.cx}
          cy={dot.cy}
          r={dot.r}
          fill={PRIMARY}
          opacity="0.5"
        />
      ))}
    </m.svg>
  )
}

/* ─── Animated Gradient Mesh ─── */
function GradientMesh() {
  const blobs = [
    { x: '-10%', y: '-10%', w: 800, blur: 180, dur: 16, dx: 100, dy: 60, color: PRIMARY, opacity: 0.08 },
    { x: '70%', y: '60%', w: 600, blur: 140, dur: 12, dx: -80, dy: -50, color: '#1D4ED8', opacity: 0.06 },
    { x: '30%', y: '40%', w: 500, blur: 120, dur: 14, dx: 60, dy: -70, color: '#6366F1', opacity: 0.05 },
    { x: '80%', y: '-5%', w: 450, blur: 160, dur: 18, dx: -50, dy: 80, color: '#2563EB', opacity: 0.07 },
    { x: '-5%', y: '70%', w: 550, blur: 130, dur: 10, dx: 70, dy: -40, color: '#7C3AED', opacity: 0.04 },
    { x: '50%', y: '20%', w: 350, blur: 100, dur: 20, dx: -40, dy: 50, color: '#0EA5E9', opacity: 0.05 },
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

/* ─── Comic Speed Lines (Diagonal lines that fade in/out) ─── */
function SpeedLines() {
  const lines = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x1: 200 + Math.random() * 600,
    y1: -50,
    length: 200 + Math.random() * 400,
    angle: 25 + Math.random() * 10,
    width: 0.3 + Math.random() * 0.7,
    delay: Math.random() * 8,
    duration: 3 + Math.random() * 4,
  }))

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid slice"
    >
      {lines.map((line) => {
        const rad = (line.angle * Math.PI) / 180
        const x2 = line.x1 + Math.cos(rad) * line.length
        const y2 = line.y1 + Math.sin(rad) * line.length
        return (
          <m.line
            key={line.id}
            x1={line.x1}
            y1={line.y1}
            x2={x2}
            y2={y2}
            stroke={PRIMARY}
            strokeWidth={line.width}
            strokeLinecap="round"
            animate={{ opacity: [0, 0.15, 0.08, 0] }}
            transition={{
              duration: line.duration,
              repeat: Infinity,
              delay: line.delay,
              ease: 'easeInOut',
            }}
          />
        )
      })}
      {/* Additional set from bottom-right */}
      {lines.slice(0, 8).map((line) => {
        const baseX = 600 + Math.random() * 400
        const baseY = 500 + Math.random() * 500
        const rad = ((line.angle + 180) * Math.PI) / 180
        const x2 = baseX + Math.cos(rad) * (line.length * 0.7)
        const y2 = baseY + Math.sin(rad) * (line.length * 0.7)
        return (
          <m.line
            key={`btm-${line.id}`}
            x1={baseX}
            y1={baseY}
            x2={x2}
            y2={y2}
            stroke={PRIMARY}
            strokeWidth={line.width * 0.8}
            strokeLinecap="round"
            animate={{ opacity: [0, 0.1, 0.05, 0] }}
            transition={{
              duration: line.duration + 2,
              repeat: Infinity,
              delay: line.delay + 3,
              ease: 'easeInOut',
            }}
          />
        )
      })}
    </svg>
  )
}

/* ─── Floating Heart Particles (Referencing his couple comics) ─── */
function HeartParticles() {
  const [isMobile, setIsMobile] = useState(false)
  const [viewH, setViewH] = useState(1000)

  useEffect(() => {
    setIsMobile(window.matchMedia('(pointer: coarse)').matches)
    setViewH(window.innerHeight)
  }, [])

  const count = isMobile ? 8 : 16
  const hearts = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    size: 6 + Math.random() * 10,
    duration: 6 + Math.random() * 8,
    delay: Math.random() * 12,
    drift: (Math.random() - 0.5) * 80,
    color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
    rotation: Math.random() * 360,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {hearts.map((h) => (
        <m.div
          key={h.id}
          className="absolute"
          style={{
            left: `${h.x}%`,
            bottom: -20,
            width: h.size,
            height: h.size,
            filter: `drop-shadow(0 0 ${h.size * 0.5}px ${h.color}60)`,
          }}
          animate={{
            y: [0, -(viewH + 60)],
            x: [0, h.drift],
            opacity: [0, 0.7, 0.5, 0],
            rotate: [h.rotation, h.rotation + 180],
            scale: [0.4, 1, 0.8, 0.3],
          }}
          transition={{
            duration: h.duration,
            repeat: Infinity,
            delay: h.delay,
            ease: 'easeOut',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill={h.color}
            width={h.size}
            height={h.size}
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </m.div>
      ))}
    </div>
  )
}

/* ─── Main Background Component ─── */
export function YehudaBackground() {
  return (
    <div className="fixed inset-0 -z-10" style={{ backgroundColor: '#050505' }}>
      <GradientMesh />
      <HalftonePattern />
      <SpeedLines />
      <CursorSpotlight />
      <HeartParticles />
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
