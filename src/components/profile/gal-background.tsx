'use client'

import { m, useMotionValue, useSpring, useScroll, useTransform, useMotionTemplate } from 'motion/react'
import { useEffect, useState, useCallback } from 'react'

const PRIMARY = '#D4AF37'
const SPARKLE_COLORS = ['#D4AF37', '#F5E6A3', '#C9A84C', '#FFFACD', '#B8860B']

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

/* --- Cursor Spotlight (Mobile -- auto-drift) --- */
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

/* --- Star / Sparkle Particles --- */
function SparkleParticles() {
  const [isMobile, setIsMobile] = useState(false)
  const [viewH, setViewH] = useState(1000)

  useEffect(() => {
    setIsMobile(window.matchMedia('(pointer: coarse)').matches)
    setViewH(window.innerHeight)
  }, [])

  const count = isMobile ? 18 : 35
  const sparkles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    size: 2 + Math.random() * 5,
    duration: 4 + Math.random() * 6,
    delay: Math.random() * 10,
    drift: (Math.random() - 0.5) * 50,
    color: SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)],
    isStar: Math.random() > 0.6,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {sparkles.map((s) =>
        s.isStar ? (
          <m.svg
            key={s.id}
            className="absolute"
            width={s.size * 3}
            height={s.size * 3}
            viewBox="0 0 24 24"
            style={{
              left: `${s.x}%`,
              bottom: -10,
            }}
            animate={{
              y: [0, -(viewH + 50)],
              x: [0, s.drift],
              opacity: [0, 0.85, 0.6, 0],
              rotate: [0, 180],
              scale: [0.4, 1.1, 0.7, 0.2],
            }}
            transition={{
              duration: s.duration,
              repeat: Infinity,
              delay: s.delay,
              ease: 'easeOut',
            }}
          >
            <path
              d="M12 2L14.09 8.26L20.18 8.64L15.54 12.74L16.91 18.86L12 15.7L7.09 18.86L8.46 12.74L3.82 8.64L9.91 8.26L12 2Z"
              fill={s.color}
              opacity="0.9"
            />
          </m.svg>
        ) : (
          <m.div
            key={s.id}
            className="absolute rounded-full"
            style={{
              left: `${s.x}%`,
              bottom: -10,
              width: s.size,
              height: s.size,
              background: s.color,
              boxShadow: `0 0 ${s.size * 4}px ${s.color}90`,
            }}
            animate={{
              y: [0, -(viewH + 50)],
              x: [0, s.drift],
              opacity: [0, 0.9, 0.65, 0],
              scale: [0.5, 1.3, 0.8, 0.2],
            }}
            transition={{
              duration: s.duration,
              repeat: Infinity,
              delay: s.delay,
              ease: 'easeOut',
            }}
          />
        ),
      )}
    </div>
  )
}

/* --- Film Reel / Cinematic Overlay --- */
function CinematicOverlay() {
  return (
    <m.svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid slice"
      animate={{ opacity: [0.02, 0.06, 0.02] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Film strip perforations — left side */}
      {Array.from({ length: 12 }, (_, i) => (
        <rect
          key={`perf-l-${i}`}
          x="15"
          y={30 + i * 80}
          width="18"
          height="28"
          rx="3"
          fill="none"
          stroke={PRIMARY}
          strokeWidth="0.5"
          opacity="0.3"
        />
      ))}
      {/* Film strip perforations — right side */}
      {Array.from({ length: 12 }, (_, i) => (
        <rect
          key={`perf-r-${i}`}
          x="967"
          y={30 + i * 80}
          width="18"
          height="28"
          rx="3"
          fill="none"
          stroke={PRIMARY}
          strokeWidth="0.5"
          opacity="0.3"
        />
      ))}
      {/* Film strip border lines */}
      <line x1="40" y1="0" x2="40" y2="1000" stroke={PRIMARY} strokeWidth="0.3" opacity="0.15" />
      <line x1="960" y1="0" x2="960" y2="1000" stroke={PRIMARY} strokeWidth="0.3" opacity="0.15" />
      {/* Crosshair / aspect ratio markers */}
      <circle cx="500" cy="500" r="60" fill="none" stroke={PRIMARY} strokeWidth="0.4" opacity="0.12" />
      <line x1="470" y1="500" x2="530" y2="500" stroke={PRIMARY} strokeWidth="0.3" opacity="0.15" />
      <line x1="500" y1="470" x2="500" y2="530" stroke={PRIMARY} strokeWidth="0.3" opacity="0.15" />
      {/* Star / Hollywood walk of fame star */}
      <path
        d="M500 150 L512 186 L550 186 L519 208 L530 245 L500 224 L470 245 L481 208 L450 186 L488 186 Z"
        fill="none"
        stroke={PRIMARY}
        strokeWidth="0.5"
        opacity="0.15"
      />
    </m.svg>
  )
}

/* --- Giant Star Watermark --- */
function StarWatermark() {
  const { scrollY } = useScroll()
  const watermarkY = useTransform(scrollY, [0, 1000], [0, -180])

  return (
    <m.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
      style={{ y: watermarkY }}
    >
      <m.svg
        width="50vh"
        height="50vh"
        viewBox="0 0 100 100"
        className="opacity-100"
        style={{
          width: '50vh',
          height: '50vh',
        }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
      >
        <defs>
          <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <m.stop
              offset="0%"
              stopColor={PRIMARY}
              animate={{ stopOpacity: [0.04, 0.08, 0.04] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <m.stop
              offset="50%"
              stopColor="#F5E6A3"
              animate={{ stopOpacity: [0.02, 0.06, 0.02] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            />
            <m.stop
              offset="100%"
              stopColor={PRIMARY}
              animate={{ stopOpacity: [0.05, 0.09, 0.05] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            />
          </linearGradient>
        </defs>
        <path
          d="M50 5 L61 35 L95 38 L70 58 L77 92 L50 75 L23 92 L30 58 L5 38 L39 35 Z"
          fill="url(#starGrad)"
        />
      </m.svg>
    </m.div>
  )
}

/* --- Animated Gradient Mesh --- */
function GradientMesh() {
  const blobs = [
    { x: '-10%', y: '-10%', w: 800, blur: 180, dur: 16, dx: 100, dy: 60, color: PRIMARY, opacity: 0.07 },
    { x: '70%', y: '60%', w: 600, blur: 140, dur: 12, dx: -80, dy: -50, color: '#8B6914', opacity: 0.05 },
    { x: '30%', y: '40%', w: 500, blur: 120, dur: 14, dx: 60, dy: -70, color: '#F5E6A3', opacity: 0.04 },
    { x: '80%', y: '-5%', w: 450, blur: 160, dur: 18, dx: -50, dy: 80, color: PRIMARY, opacity: 0.06 },
    { x: '-5%', y: '70%', w: 550, blur: 130, dur: 10, dx: 70, dy: -40, color: '#4A3A10', opacity: 0.05 },
    { x: '50%', y: '20%', w: 350, blur: 100, dur: 20, dx: -40, dy: 50, color: '#C9A84C', opacity: 0.04 },
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

/* --- Main Background Component --- */
export function GalBackground() {
  return (
    <div className="fixed inset-0 -z-10" style={{ backgroundColor: '#050505' }}>
      <GradientMesh />
      <CinematicOverlay />
      <StarWatermark />
      <CursorSpotlight />
      <SparkleParticles />
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
