'use client'

import { m, useInView } from 'motion/react'
import Link from 'next/link'
import { useRef, useEffect, useState, useCallback } from 'react'

// ═══════════════════════════════════════════════════════════
// LAVI DISTRIBUTION SYSTEM — PROJECT SHOWCASE
// ═══════════════════════════════════════════════════════════

const AMBER = '#f59e0b'
const AMBER_DIM = 'rgba(245, 158, 11, 0.15)'
const BG = '#030712'

// ─── Count-Up Hook ─────────────────────────────────────────
function useCountUp(target: number, duration: number = 1800, inView: boolean = false) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView) return
    let start = 0
    const startTime = performance.now()

    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setValue(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
    return () => { start = 0 }
  }, [target, duration, inView])

  return value
}

// ─── Floating Particles ────────────────────────────────────
function FloatingParticles() {
  const particles = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 3,
    dur: 5 + Math.random() * 10,
    delay: Math.random() * 5,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <m.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: AMBER,
            boxShadow: `0 0 ${p.size * 4}px ${AMBER}60`,
          }}
          animate={{
            y: [0, -25 - Math.random() * 35, 0],
            x: [0, (Math.random() - 0.5) * 25, 0],
            opacity: [0.05, 0.7, 0.05],
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// ─── Route Stop Item ───────────────────────────────────────
interface RouteStop {
  name: string
  time: string
  status: 'completed' | 'current' | 'upcoming'
}

function RouteStopRow({ stop, index }: { stop: RouteStop; index: number }) {
  const icons: Record<string, string> = {
    completed: '\u2705',
    current: '\uD83D\uDE9A',
    upcoming: '\u23F3',
  }
  const colors: Record<string, string> = {
    completed: 'text-green-400',
    current: 'text-amber-400',
    upcoming: 'text-zinc-500',
  }
  const bgColors: Record<string, string> = {
    completed: 'bg-green-500/10 border-green-500/20',
    current: 'bg-amber-500/10 border-amber-500/30',
    upcoming: 'bg-zinc-800/50 border-zinc-700/30',
  }

  return (
    <m.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6 + index * 0.15, duration: 0.4 }}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border ${bgColors[stop.status]} ${stop.status === 'current' ? 'ring-1 ring-amber-500/30' : ''}`}
    >
      <span className="text-sm">{icons[stop.status]}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium truncate ${colors[stop.status]}`}>
          {stop.name}
        </p>
      </div>
      <span className={`text-[10px] tabular-nums ${stop.status === 'upcoming' ? 'text-zinc-600' : 'text-zinc-400'}`}>
        {stop.time}
      </span>
      {stop.status === 'current' && (
        <m.div
          className="w-1.5 h-1.5 rounded-full bg-amber-400"
          animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </m.div>
  )
}

// ─── Phone Frame (Driver App) ──────────────────────────────
function PhoneFrame() {
  const stops: RouteStop[] = [
    { name: 'Cafe Aroma Dizengoff', time: '08:15', status: 'completed' },
    { name: 'Super Market Ramat Gan', time: '08:45', status: 'completed' },
    { name: 'Restaurant Hasharon', time: '09:20', status: 'current' },
    { name: 'Bakery Tel Aviv', time: '09:50', status: 'upcoming' },
  ]

  return (
    <div className="relative mx-auto" style={{ width: 280 }}>
      {/* Phone shell */}
      <div className="relative rounded-[2.5rem] border-[3px] border-zinc-700 bg-zinc-900 p-2 shadow-2xl shadow-black/60">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-zinc-900 rounded-b-2xl z-10 flex items-center justify-center">
          <div className="w-14 h-3 rounded-full bg-zinc-800 mt-0.5" />
        </div>

        {/* Screen */}
        <div className="rounded-[2rem] overflow-hidden bg-[#0a0f1a]">
          {/* Status bar area */}
          <div className="h-8" />

          {/* Top bar */}
          <div className="px-4 pb-2 flex items-center gap-2">
            <span className="text-base">{'\uD83D\uDE9A'}</span>
            <div>
              <p className="text-[11px] font-semibold text-white">Today&apos;s Route</p>
              <p className="text-[9px] text-zinc-500">Gush Dan</p>
            </div>
          </div>

          {/* Driver info */}
          <div className="mx-4 mb-3 px-3 py-2 rounded-xl bg-zinc-800/60 border border-zinc-700/40">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center text-[11px] font-bold text-amber-400">
                YK
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-[11px] font-medium text-white">Yossi K.</p>
                  <m.div
                    className="w-1.5 h-1.5 rounded-full bg-green-400"
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <p className="text-[9px] text-zinc-500">12 stops &bull; 3 completed &bull; 2h 15m left</p>
              </div>
            </div>
          </div>

          {/* Route progress bar */}
          <div className="mx-4 mb-3">
            <div className="flex justify-between text-[9px] text-zinc-500 mb-1">
              <span>Progress</span>
              <span className="text-amber-400 font-medium">25%</span>
            </div>
            <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
              <m.div
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${AMBER}, #fb923c)` }}
                initial={{ width: '0%' }}
                animate={{ width: '25%' }}
                transition={{ delay: 0.8, duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Stops list */}
          <div className="px-4 space-y-1.5 pb-3">
            {stops.map((stop, i) => (
              <RouteStopRow key={i} stop={stop} index={i} />
            ))}
          </div>

          {/* Bottom nav */}
          <div className="border-t border-zinc-800 bg-[#0a0f1a] px-2 py-2 flex justify-around">
            {[
              { icon: '\uD83D\uDDFA\uFE0F', label: 'Route', active: true },
              { icon: '\uD83D\uDCE6', label: 'Loading', active: false },
              { icon: '\u2705', label: 'Delivery', active: false },
              { icon: '\u21A9\uFE0F', label: 'Returns', active: false },
            ].map((tab) => (
              <div key={tab.label} className="flex flex-col items-center gap-0.5">
                <span className="text-xs">{tab.icon}</span>
                <span className={`text-[8px] font-medium ${tab.active ? 'text-amber-400' : 'text-zinc-600'}`}>
                  {tab.label}
                </span>
                {tab.active && (
                  <div className="w-3 h-0.5 rounded-full bg-amber-400 mt-0.5" />
                )}
              </div>
            ))}
          </div>

          {/* Home indicator */}
          <div className="flex justify-center py-2">
            <div className="w-24 h-1 rounded-full bg-zinc-700" />
          </div>
        </div>
      </div>

      {/* Ambient glow */}
      <div
        className="absolute -inset-6 -z-10 rounded-[3rem] blur-3xl opacity-20"
        style={{ background: `radial-gradient(circle, ${AMBER}40, transparent 70%)` }}
      />
    </div>
  )
}

// ─── Desktop Frame (Manager Dashboard) ─────────────────────
function DesktopFrame() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })

  const drivers = useCountUp(20, 1600, inView)
  const deliveries = useCountUp(156, 1800, inView)
  const onTime = useCountUp(94, 1400, inView)
  const alerts = useCountUp(3, 1000, inView)

  const driverCards = [
    { name: 'Yossi K.', route: 'Route A', progress: '3/12 stops', status: 'On Track', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', dot: 'bg-green-400' },
    { name: 'David M.', route: 'Route B', progress: '7/15 stops', status: 'Delayed', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', dot: 'bg-amber-400' },
    { name: 'Sarah L.', route: 'Route C', progress: '12/12 stops', status: 'Complete', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20', dot: 'bg-sky-400' },
  ]

  return (
    <div ref={ref} className="relative w-full max-w-[560px] mx-auto">
      {/* Desktop shell */}
      <div className="rounded-xl border border-zinc-700/60 bg-zinc-900 shadow-2xl shadow-black/60 overflow-hidden">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800/80 border-b border-zinc-700/40">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-[10px] font-medium text-zinc-400">Lavi &mdash; Manager Dashboard</span>
          </div>
          <div className="w-12" />
        </div>

        {/* Dashboard content */}
        <div className="p-4 bg-[#0a0f1a]">
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[
              { label: 'Drivers Active', value: drivers, icon: '\uD83D\uDE9A', accent: 'text-amber-400' },
              { label: 'Deliveries Today', value: deliveries, icon: '\uD83D\uDCE6', accent: 'text-green-400' },
              { label: 'On Time', value: `${onTime}%`, icon: '\u23F1\uFE0F', accent: 'text-sky-400' },
              { label: 'Alerts', value: alerts, icon: '\u26A0\uFE0F', accent: 'text-red-400' },
            ].map((stat) => (
              <m.div
                key={stat.label}
                className="rounded-lg bg-zinc-800/50 border border-zinc-700/30 p-2.5 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <span className="text-sm block mb-1">{stat.icon}</span>
                <p className={`text-lg font-bold tabular-nums ${stat.accent}`}>{stat.value}</p>
                <p className="text-[8px] text-zinc-500 mt-0.5">{stat.label}</p>
              </m.div>
            ))}
          </div>

          {/* Drivers section */}
          <div className="mb-1">
            <p className="text-[10px] font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Live Driver Status</p>
          </div>

          <div className="space-y-2">
            {driverCards.map((d, i) => (
              <m.div
                key={d.name}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border ${d.bg}`}
                initial={{ opacity: 0, x: 20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.5 + i * 0.12, duration: 0.4 }}
              >
                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-300">
                  {d.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white">{d.name}</p>
                  <p className="text-[9px] text-zinc-500">{d.route} &bull; {d.progress}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${d.dot}`} />
                  <span className={`text-[10px] font-medium ${d.color}`}>{d.status}</span>
                </div>
              </m.div>
            ))}
          </div>

          {/* Mini chart placeholder */}
          <div className="mt-4 rounded-lg bg-zinc-800/30 border border-zinc-700/20 p-3">
            <p className="text-[9px] text-zinc-500 mb-2">Deliveries Today (Hourly)</p>
            <div className="flex items-end gap-1 h-12">
              {[3, 7, 12, 18, 24, 22, 15, 8].map((v, i) => (
                <m.div
                  key={i}
                  className="flex-1 rounded-sm"
                  style={{
                    background: `linear-gradient(to top, ${AMBER}80, ${AMBER}30)`,
                  }}
                  initial={{ height: 0 }}
                  animate={inView ? { height: `${(v / 24) * 100}%` } : {}}
                  transition={{ delay: 0.8 + i * 0.08, duration: 0.5, ease: 'easeOut' }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[7px] text-zinc-600">06:00</span>
              <span className="text-[7px] text-zinc-600">14:00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ambient glow */}
      <div
        className="absolute -inset-8 -z-10 rounded-2xl blur-3xl opacity-15"
        style={{ background: `radial-gradient(circle, ${AMBER}30, transparent 70%)` }}
      />
    </div>
  )
}

// ─── Feature Card ──────────────────────────────────────────
interface FeatureCardProps {
  icon: string
  title: string
  description: string
  index: number
}

function FeatureCard({ icon, title, description, index }: FeatureCardProps) {
  return (
    <m.div
      className="group relative rounded-xl bg-zinc-900/80 border border-zinc-800/60 p-5 cursor-default transition-colors hover:border-amber-500/30 hover:bg-zinc-900"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.08, duration: 0.45, ease: [0, 0, 0.2, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: `inset 0 1px 0 0 rgba(245, 158, 11, 0.1), 0 0 40px rgba(245, 158, 11, 0.05)` }}
      />

      <span className="text-2xl block mb-3">{icon}</span>
      <h3 className="text-sm font-semibold text-white mb-1.5">{title}</h3>
      <p className="text-xs leading-relaxed text-zinc-400">{description}</p>
    </m.div>
  )
}

// ─── Tech Badge ────────────────────────────────────────────
function TechBadge({ name, index }: { name: string; index: number }) {
  return (
    <m.span
      className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-medium border bg-zinc-900/60 border-zinc-700/50 text-zinc-300 hover:border-amber-500/40 hover:text-amber-300 transition-colors cursor-default"
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 + index * 0.06, duration: 0.3 }}
    >
      {name}
    </m.span>
  )
}

// ═══════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════

export default function LaviShowcasePage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const devicesRef = useRef<HTMLDivElement>(null)
  const devicesInView = useInView(devicesRef, { once: true, margin: '-80px' })

  const features = [
    { icon: '\uD83D\uDDFA\uFE0F', title: 'Route Optimization', description: 'AI-planned delivery routes that minimize driving time and fuel consumption for every shift.' },
    { icon: '\uD83D\uDCE6', title: 'Loading Verification', description: 'Scan and verify cargo contents before departure to ensure every order is accounted for.' },
    { icon: '\u270D\uFE0F', title: 'Digital Signatures', description: 'Capture proof of delivery with on-screen signatures directly on the driver\'s phone.' },
    { icon: '\uD83D\uDCCA', title: 'Real-time Tracking', description: 'Live driver locations and delivery status visible to managers at a glance.' },
    { icon: '\uD83D\uDCE5', title: 'Excel Import', description: 'Bulk upload daily orders from spreadsheets with automatic route assignment and validation.' },
    { icon: '\uD83D\uDCF4', title: 'Offline Mode', description: 'Drivers keep working without internet. Data syncs automatically when connectivity returns.' },
  ]

  const techStack = ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'PWA', 'Socket.io']

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: BG }}>
      <FloatingParticles />

      {/* ─── Back Navigation ─── */}
      <m.div
        className="fixed top-5 left-5 z-50"
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <Link
          href="/kaniel"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium text-zinc-300 bg-zinc-900/70 border border-zinc-700/50 backdrop-blur-md hover:border-amber-500/40 hover:text-amber-300 transition-all duration-200"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to profile
        </Link>
      </m.div>

      {/* ─── Hero Section ─── */}
      <section ref={heroRef} className="relative pt-28 pb-16 px-6 text-center">
        {/* Radial ambient glow behind hero */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] -z-0 blur-[100px] opacity-20"
          style={{ background: `radial-gradient(circle, ${AMBER}, transparent 70%)` }}
        />

        <m.div
          className="relative z-10 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Lion emoji */}
          <m.div
            className="text-7xl mb-6"
            initial={{ opacity: 0, scale: 0.6, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
          >
            {'\uD83E\uDD81'}
          </m.div>

          {/* Title */}
          <m.h1
            className="text-5xl sm:text-6xl font-extrabold mb-4 bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(135deg, ${AMBER}, #fb923c, ${AMBER})`,
              backgroundSize: '200% 200%',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: 0,
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              opacity: { duration: 0.5, delay: 0.2 },
              y: { duration: 0.5, delay: 0.2 },
              backgroundPosition: { duration: 6, repeat: Infinity, ease: 'linear' },
            }}
          >
            Lavi
          </m.h1>

          {/* Tagline */}
          <m.p
            className="text-lg sm:text-xl font-medium text-zinc-200 mb-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
          >
            Smart distribution &amp; delivery management system
          </m.p>

          {/* Description */}
          <m.p
            className="text-sm leading-relaxed text-zinc-400 max-w-lg mx-auto"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
          >
            Mobile-first PWA for managing food distribution fleets. Drivers get an optimized
            route app with loading verification and digital signatures. Managers get a
            real-time dashboard with route planning, import tools, and delivery analytics.
          </m.p>

          {/* Divider line */}
          <m.div
            className="mx-auto mt-10 h-px max-w-xs"
            style={{ background: `linear-gradient(90deg, transparent, ${AMBER}40, transparent)` }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.7 }}
          />
        </m.div>
      </section>

      {/* ─── Device Preview Section ─── */}
      <section ref={devicesRef} className="relative py-12 px-6">
        <m.div
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
        >
          {/* Section label */}
          <m.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-amber-400/80 mb-2">
              Live Preview
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Two apps, one system
            </h2>
            <p className="text-xs text-zinc-500 mt-2 max-w-md mx-auto">
              Drivers see their mobile route app. Managers see the real-time operations dashboard.
            </p>
          </m.div>

          {/* Devices grid */}
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-10 lg:gap-14">
            {/* Phone - slides from left */}
            <m.div
              className="flex flex-col items-center gap-4"
              initial={{ opacity: 0, x: -60 }}
              animate={devicesInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, ease: [0, 0, 0.2, 1], delay: 0.1 }}
            >
              <PhoneFrame />
              <div className="text-center mt-2">
                <p className="text-xs font-semibold text-amber-400">Driver App</p>
                <p className="text-[10px] text-zinc-500">Mobile PWA</p>
              </div>
            </m.div>

            {/* Desktop - slides from right */}
            <m.div
              className="flex flex-col items-center gap-4 flex-1 max-w-[560px]"
              initial={{ opacity: 0, x: 60 }}
              animate={devicesInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, ease: [0, 0, 0.2, 1], delay: 0.25 }}
            >
              <DesktopFrame />
              <div className="text-center mt-2">
                <p className="text-xs font-semibold text-amber-400">Manager Dashboard</p>
                <p className="text-[10px] text-zinc-500">Desktop Web App</p>
              </div>
            </m.div>
          </div>
        </m.div>
      </section>

      {/* ─── Features Grid ─── */}
      <section className="relative py-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Section label */}
          <m.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-amber-400/80 mb-2">
              Capabilities
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Built for the field
            </h2>
          </m.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} description={f.description} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Tech Stack ─── */}
      <section className="relative py-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <m.p
            className="text-[11px] uppercase tracking-[0.2em] font-semibold text-amber-400/80 mb-5"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
          >
            Tech Stack
          </m.p>

          <div className="flex flex-wrap justify-center gap-2.5">
            {techStack.map((tech, i) => (
              <TechBadge key={tech} name={tech} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Divider ─── */}
      <div className="max-w-xs mx-auto">
        <m.div
          className="h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${AMBER}30, transparent)` }}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        />
      </div>

      {/* ─── Bottom CTA ─── */}
      <section className="relative py-16 px-6 text-center">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm text-zinc-500 mb-5">
            This is a project showcase. No real customer data is displayed.
          </p>
          <Link
            href="/kaniel"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 hover:border-amber-500/50 transition-all duration-200"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Kaniel&apos;s Profile
          </Link>
        </m.div>
      </section>

      {/* ─── Footer spacer ─── */}
      <div className="h-8" />
    </div>
  )
}
