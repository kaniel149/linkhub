'use client'

import { m, useInView } from 'motion/react'
import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Sun,
  Activity,
  Zap,
  DollarSign,
  Clock,
  BarChart3,
  FolderOpen,
  Monitor,
  FileText,
  Receipt,
  Bell,
  PieChart,
  Smartphone,
  Brain,
  Shield,
} from 'lucide-react'

// ─── Animated count-up (triggers on scroll into view) ───
function CountUp({
  target,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 2,
  delay = 0,
}: {
  target: number
  prefix?: string
  suffix?: string
  decimals?: number
  duration?: number
  delay?: number
}) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    const timer = setTimeout(() => {
      let start = 0
      const increment = target / (duration * 60)
      const step = () => {
        start += increment
        if (start >= target) {
          setCount(target)
          return
        }
        setCount(decimals > 0 ? parseFloat(start.toFixed(decimals)) : Math.floor(start))
        requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }, delay * 1000)
    return () => clearTimeout(timer)
  }, [isInView, target, duration, delay, decimals])

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{decimals > 0 ? count.toFixed(decimals) : count.toLocaleString()}{suffix}
    </span>
  )
}

// ─── Floating solar particles ───
function SolarParticles() {
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1.5 + Math.random() * 3,
    duration: 5 + Math.random() * 10,
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
            background: '#38bdf8',
            boxShadow: `0 0 ${p.size * 4}px #38bdf890`,
          }}
          animate={{
            y: [0, -25 - Math.random() * 35, 0],
            x: [0, (Math.random() - 0.5) * 25, 0],
            opacity: [0.05, 0.7, 0.05],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// ─── Status badge component ───
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string; dot: string }> = {
    'In Progress': { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-400' },
    'Monitoring': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400' },
    'Pending': { bg: 'bg-orange-500/10', text: 'text-orange-400', dot: 'bg-orange-400' },
    'Active': { bg: 'bg-sky-500/10', text: 'text-sky-400', dot: 'bg-sky-400' },
    'Complete': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  }
  const c = colors[status] || colors['Active']

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  )
}

// ─── Stat card ───
function StatCard({
  icon: Icon,
  label,
  value,
  prefix,
  suffix,
  decimals,
  dotColor,
  delay,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  dotColor: string
  delay: number
}) {
  return (
    <m.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5, ease: [0, 0, 0.2, 1] }}
      className="relative group"
    >
      <div className="relative overflow-hidden rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 hover:bg-white/[0.05] transition-colors duration-300">
        {/* Subtle gradient accent */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px]"
          style={{ background: `linear-gradient(90deg, transparent, ${dotColor}40, transparent)` }}
        />
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dotColor, boxShadow: `0 0 8px ${dotColor}60` }} />
            <span className="text-xs text-white/40 font-medium uppercase tracking-wider">{label}</span>
          </div>
          <Icon className="w-4 h-4 text-white/20" />
        </div>
        <div className="text-2xl font-bold text-white/90">
          <CountUp target={value} prefix={prefix} suffix={suffix} decimals={decimals} delay={delay + 0.3} />
        </div>
      </div>
    </m.div>
  )
}

// ─── Mock sidebar nav items ───
const sidebarItems = [
  { icon: BarChart3, label: 'Dashboard', active: true },
  { icon: FolderOpen, label: 'Projects', active: false },
  { icon: Monitor, label: 'Monitoring', active: false },
  { icon: FileText, label: 'Licensing', active: false },
  { icon: Receipt, label: 'Invoices', active: false },
  { icon: Bell, label: 'Alerts', active: false },
  { icon: PieChart, label: 'Reports', active: false },
]

// ─── Mock project table data ───
const mockProjects = [
  { name: 'Haifa North #12', client: 'Cohen Industries', status: 'In Progress', capacity: '85 kWp', stage: 'Installation' },
  { name: 'Tel Aviv Campus', client: 'Startup Hub Ltd', status: 'Monitoring', capacity: '120 kWp', stage: 'Complete' },
  { name: 'Beer Sheva Array', client: 'Desert Solar Co', status: 'Pending', capacity: '200 kWp', stage: 'Permitting' },
  { name: 'Netanya Rooftop', client: 'Coastal Properties', status: 'Active', capacity: '45 kWp', stage: 'Monitoring' },
]

// ─── Feature card data ───
const features = [
  {
    icon: Activity,
    title: 'Real-time Monitoring',
    description: 'Live dashboards for SolarEdge, Huawei, and Sungrow inverters',
    color: '#38bdf8',
  },
  {
    icon: Shield,
    title: 'IEC Licensing Tracker',
    description: "Track permits through every stage of Israel's regulatory process",
    color: '#a78bfa',
  },
  {
    icon: Receipt,
    title: 'Nipendo Invoice Automation',
    description: 'Auto-generate and submit invoices to the Israel Electric Corporation',
    color: '#34d399',
  },
  {
    icon: Smartphone,
    title: 'WhatsApp Alerts',
    description: 'Instant fault notifications to your phone when production drops',
    color: '#22c55e',
  },
  {
    icon: DollarSign,
    title: 'CFO Analytics',
    description: 'Financial dashboards with revenue tracking and ROI calculations',
    color: '#fbbf24',
  },
  {
    icon: Brain,
    title: 'AI Assistant',
    description: 'Natural language queries across all project data',
    color: '#f472b6',
  },
]

// ─── Tech stack badges ───
const techStack = ['React', 'TypeScript', 'Supabase', 'Vercel', 'Recharts', 'Tailwind CSS']

// ═══════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════

export default function NavitasShowcasePage() {
  const dashboardRef = useRef<HTMLDivElement>(null)
  const dashboardInView = useInView(dashboardRef, { once: true, margin: '-100px' })

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#030712' }}>

      {/* ═══ ANIMATED BACKGROUND ═══ */}
      <div className="fixed inset-0 -z-10" style={{ backgroundColor: '#030712' }}>
        <m.div
          className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full blur-[160px]"
          style={{ background: '#38bdf8', opacity: 0.06 }}
          animate={{ x: [0, 80, 0], y: [0, 50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <m.div
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{ background: '#f59e0b', opacity: 0.04 }}
          animate={{ x: [0, -60, 0], y: [0, -40, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <m.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{ background: 'linear-gradient(135deg, #38bdf840, transparent)' }}
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.03, 0.07, 0.03] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <SolarParticles />
        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* ═══ BACK NAVIGATION ═══ */}
      <m.div
        className="fixed top-5 left-5 z-50"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Link
          href="/kaniel"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] backdrop-blur-xl border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.1] transition-all duration-300 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to profile</span>
        </Link>
      </m.div>

      {/* ═══ HERO SECTION ═══ */}
      <section className="relative pt-28 pb-16 px-4 text-center">
        {/* Sun icon with glow */}
        <m.div
          initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 150, damping: 15, delay: 0.3 }}
          className="relative inline-block mb-6"
        >
          <m.div
            className="absolute inset-0 rounded-full blur-2xl"
            style={{ background: '#f59e0b', opacity: 0.3 }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Sun className="w-10 h-10 text-white" />
          </div>
        </m.div>

        {/* Title with gradient */}
        <m.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.7, ease: [0, 0, 0.2, 1] }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4"
        >
          <m.span
            className="bg-clip-text text-transparent bg-[length:200%_100%]"
            style={{
              backgroundImage: 'linear-gradient(90deg, #ffffff 0%, #38bdf8 30%, #ffffff 50%, #f59e0b 70%, #ffffff 100%)',
            }}
            animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          >
            Navitas Solar CRM
          </m.span>
        </m.h1>

        {/* Tagline */}
        <m.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-lg sm:text-xl text-sky-400/80 font-medium mb-5"
        >
          AI-powered project management for solar energy companies
        </m.p>

        {/* Description */}
        <m.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.6 }}
          className="text-white/40 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base"
        >
          Full CRM for managing the complete solar project lifecycle — from initial lead
          through permitting, installation, and monitoring. Built to handle Israel&apos;s solar
          energy regulatory requirements including IEC licensing and Nipendo invoice automation.
        </m.p>

        {/* Decorative line */}
        <m.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1, duration: 0.8, ease: [0, 0, 0.2, 1] }}
          className="mt-10 mx-auto w-24 h-[1px]"
          style={{ background: 'linear-gradient(90deg, transparent, #38bdf860, transparent)' }}
        />
      </section>

      {/* ═══ MOCK DASHBOARD PREVIEW ═══ */}
      <section ref={dashboardRef} className="relative px-4 pb-20 max-w-6xl mx-auto">
        <m.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={dashboardInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: [0, 0, 0.2, 1] }}
        >
          {/* Browser frame */}
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0a0f1a]/80 backdrop-blur-sm shadow-2xl shadow-black/50">

            {/* Title bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-xs text-white/30 font-mono">
                  navitas-crm.app/dashboard
                </div>
              </div>
              <div className="w-[52px]" /> {/* Spacer for symmetry */}
            </div>

            {/* Dashboard content */}
            <div className="flex min-h-[500px]">

              {/* Sidebar */}
              <div className="hidden md:flex flex-col w-52 border-r border-white/[0.06] bg-white/[0.01] py-4 px-3">
                {/* Logo area */}
                <div className="flex items-center gap-2.5 px-3 mb-6">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Sun className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-white/70">Navitas</span>
                </div>

                {/* Nav items */}
                <nav className="space-y-1">
                  {sidebarItems.map((item, i) => (
                    <m.div
                      key={item.label}
                      initial={{ opacity: 0, x: -15 }}
                      animate={dashboardInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.3 + i * 0.05, duration: 0.4 }}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors duration-200 cursor-default ${
                        item.active
                          ? 'bg-sky-500/10 text-sky-400'
                          : 'text-white/35 hover:text-white/50 hover:bg-white/[0.03]'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                      {item.active && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400" />
                      )}
                    </m.div>
                  ))}
                </nav>
              </div>

              {/* Main content area */}
              <div className="flex-1 p-5 sm:p-6">

                {/* Dashboard header */}
                <m.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={dashboardInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.2 }}
                  className="flex items-center justify-between mb-6"
                >
                  <div>
                    <h2 className="text-lg font-semibold text-white/80">Dashboard</h2>
                    <p className="text-xs text-white/30 mt-0.5">Sunday, Feb 8, 2026</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-emerald-400/70">All systems online</span>
                  </div>
                </m.div>

                {/* Stats row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                  <StatCard icon={Zap} label="Active Projects" value={47} dotColor="#22c55e" delay={0.3} />
                  <StatCard icon={Sun} label="Installed Capacity" value={2840} suffix=" kWp" dotColor="#fbbf24" delay={0.4} />
                  <StatCard icon={DollarSign} label="Monthly Revenue" value={1.2} prefix="$" suffix="M" decimals={1} dotColor="#38bdf8" delay={0.5} />
                  <StatCard icon={Clock} label="Pending Permits" value={12} dotColor="#f97316" delay={0.6} />
                </div>

                {/* Projects table */}
                <m.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={dashboardInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
                >
                  {/* Table header */}
                  <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                    <h3 className="text-sm font-medium text-white/60">Recent Projects</h3>
                    <span className="text-xs text-sky-400/60 cursor-default">View all</span>
                  </div>

                  {/* Column headers */}
                  <div className="hidden sm:grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 px-4 py-2.5 border-b border-white/[0.04] text-xs text-white/25 uppercase tracking-wider font-medium">
                    <span>Project</span>
                    <span>Client</span>
                    <span className="w-24 text-center">Status</span>
                    <span className="w-20 text-right">Capacity</span>
                    <span className="w-24 text-right">Stage</span>
                  </div>

                  {/* Table rows */}
                  {mockProjects.map((project, i) => (
                    <m.div
                      key={project.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={dashboardInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.6 + i * 0.08, duration: 0.4 }}
                      className={`grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto_auto] gap-2 sm:gap-4 items-center px-4 py-3 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors duration-200 ${
                        i % 2 === 0 ? 'bg-white/[0.01]' : ''
                      }`}
                    >
                      <span className="text-sm text-white/70 font-medium">{project.name}</span>
                      <span className="text-sm text-white/40">{project.client}</span>
                      <span className="w-24 flex justify-center">
                        <StatusBadge status={project.status} />
                      </span>
                      <span className="w-20 text-right text-sm text-white/50 font-mono">{project.capacity}</span>
                      <span className="w-24 text-right text-xs text-white/30">{project.stage}</span>
                    </m.div>
                  ))}
                </m.div>
              </div>
            </div>
          </div>
        </m.div>

        {/* Reflection glow under dashboard */}
        <div
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-20 blur-3xl rounded-full"
          style={{ background: 'linear-gradient(90deg, transparent, #38bdf810, #f59e0b08, transparent)' }}
        />
      </section>

      {/* ═══ FEATURES GRID ═══ */}
      <section className="relative px-4 pb-20 max-w-5xl mx-auto">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white/90 mb-3">Key Features</h2>
          <p className="text-white/35 text-sm max-w-lg mx-auto">
            Everything a solar company needs to manage projects, track performance, and streamline operations.
          </p>
        </m.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <m.div
              key={feature.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0, 0, 0.2, 1] }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-colors duration-300 cursor-default"
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(ellipse at 50% 0%, ${feature.color}08, transparent 70%)` }}
              />
              {/* Top accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `linear-gradient(90deg, transparent, ${feature.color}50, transparent)` }}
              />

              <div className="relative">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: `${feature.color}15` }}
                >
                  <feature.icon className="w-5 h-5" style={{ color: feature.color }} />
                </div>
                <h3 className="text-base font-semibold text-white/80 mb-1.5">{feature.title}</h3>
                <p className="text-sm text-white/35 leading-relaxed">{feature.description}</p>
              </div>
            </m.div>
          ))}
        </div>
      </section>

      {/* ═══ TECH STACK ═══ */}
      <section className="relative px-4 pb-20 max-w-3xl mx-auto text-center">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-white/70 mb-6">Built With</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {techStack.map((tech, i) => (
              <m.span
                key={tech}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 20 }}
                whileHover={{ scale: 1.08, y: -2 }}
                className="px-4 py-2 rounded-full text-sm font-medium bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-sky-400 hover:border-sky-400/20 hover:bg-sky-400/[0.06] transition-colors duration-300 cursor-default"
              >
                {tech}
              </m.span>
            ))}
          </div>
        </m.div>

        {/* Decorative line */}
        <m.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0, 0, 0.2, 1] }}
          className="mx-auto w-24 h-[1px] mb-12"
          style={{ background: 'linear-gradient(90deg, transparent, #38bdf840, transparent)' }}
        />
      </section>

      {/* ═══ BOTTOM CTA ═══ */}
      <section className="relative px-4 pb-24 text-center">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href="/kaniel"
            className="group relative inline-flex items-center gap-3 px-7 py-3.5 rounded-full border border-sky-400/20 bg-sky-400/[0.05] hover:bg-sky-400/[0.1] text-white/50 hover:text-white/80 transition-all duration-300 text-sm"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 duration-300" />
            <span>Back to Kaniel&apos;s Profile</span>
          </Link>
        </m.div>

        {/* Bottom glow */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-32 blur-[100px] rounded-full pointer-events-none"
          style={{ background: '#38bdf808' }}
        />
      </section>
    </div>
  )
}
