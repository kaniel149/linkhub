'use client'

import { m, useInView } from 'motion/react'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

// ═══════════════════════════════════════════════════════════
// CONSTANTS & MOCK DATA
// ═══════════════════════════════════════════════════════════

const PURPLE = '#8b5cf6'
const BG = '#030712'

const TASKS = [
  { text: 'Review solar project proposals', done: true },
  { text: 'Send Nipendo invoices', done: true },
  { text: 'Team standup at 10:00', inProgress: true },
  { text: 'Finalize Lavi deployment', done: false },
  { text: 'Write LinkedIn post', done: false },
]

const CALENDAR_EVENTS = [
  { time: '10:00', title: 'Team Standup', detail: 'Google Meet' },
  { time: '13:00', title: 'Client Demo', detail: 'Solar Project' },
  { time: '16:00', title: 'School Pickup', emoji: '\uD83D\uDE97' },
]

const SOCIAL_INTEL = [
  { icon: '\uD83D\uDCE1', platform: 'Reddit', text: '3 new discussions about solar CRM' },
  { icon: '\uD83D\uDC26', platform: 'Twitter', text: 'Trending "AI agents for business"' },
  { icon: '\uD83D\uDCF8', platform: 'Instagram', text: 'Competitor posted new reel' },
]

const FEATURES = [
  {
    emoji: '\uD83C\uDF99\uFE0F',
    title: 'Morning Briefing',
    description: 'AI-generated daily news podcast via NotebookLM, auto-sent to WhatsApp every morning.',
  },
  {
    emoji: '\u231A',
    title: 'Whoop Health Sync',
    description: 'Recovery, sleep, strain data imported and analyzed daily for performance optimization.',
  },
  {
    emoji: '\uD83D\uDCDD',
    title: 'Knowledge Capture',
    description: 'Quick notes and ideas captured via voice or text, stored and indexed in Obsidian.',
  },
  {
    emoji: '\uD83D\uDCC5',
    title: 'Calendar Intelligence',
    description: 'Smart scheduling with context from all connected systems and priorities.',
  },
  {
    emoji: '\uD83D\uDCE1',
    title: 'Social Intelligence',
    description: 'Automated scanning of Reddit, Twitter, Instagram for market insights and trends.',
  },
  {
    emoji: '\uD83E\uDD16',
    title: 'AI Agent Orchestration',
    description: 'Multiple specialized agents working together autonomously to handle daily operations.',
  },
]

const TECH_STACK = [
  'Python',
  'Node.js',
  'NotebookLM',
  'Whoop API',
  'Obsidian',
  'ElevenLabs',
  'WhatsApp',
]

const RECOVERY_WEEK = [62, 78, 85, 71, 90, 87, 82]

// ═══════════════════════════════════════════════════════════
// UTILITY COMPONENTS
// ═══════════════════════════════════════════════════════════

function CountUp({
  target,
  suffix = '',
  duration = 2,
  delay = 0,
}: {
  target: number
  suffix?: string
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
        setCount(Math.floor(start))
        requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }, delay * 1000)
    return () => clearTimeout(timer)
  }, [isInView, target, duration, delay])

  return (
    <span ref={ref} className="tabular-nums">
      {count}
      {suffix}
    </span>
  )
}

function AudioWaveform() {
  const bars = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    height: 8 + Math.random() * 24,
    delay: i * 0.05,
    duration: 0.4 + Math.random() * 0.5,
  }))

  return (
    <div className="flex items-end gap-[2px] h-8">
      {bars.map((bar) => (
        <m.div
          key={bar.id}
          className="w-[3px] rounded-full"
          style={{ background: `linear-gradient(to top, ${PURPLE}60, ${PURPLE})` }}
          animate={{
            height: [bar.height * 0.3, bar.height, bar.height * 0.5, bar.height * 0.8, bar.height * 0.3],
          }}
          transition={{
            duration: bar.duration,
            repeat: Infinity,
            delay: bar.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

function FloatingParticles() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 2.5,
    duration: 6 + Math.random() * 10,
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
            background: PURPLE,
            boxShadow: `0 0 ${p.size * 4}px ${PURPLE}80`,
          }}
          animate={{
            y: [0, -20 - Math.random() * 30, 0],
            x: [0, (Math.random() - 0.5) * 20, 0],
            opacity: [0.05, 0.6, 0.05],
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

// ═══════════════════════════════════════════════════════════
// WIDGET COMPONENTS
// ═══════════════════════════════════════════════════════════

function WidgetCard({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <m.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        delay,
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      className={`relative rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-md p-5 overflow-hidden group ${className}`}
    >
      {/* Subtle hover glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${PURPLE}08, transparent 70%)`,
        }}
      />
      {/* Top accent line */}
      <div
        className="absolute top-0 left-4 right-4 h-[1px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${PURPLE}30, transparent)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </m.div>
  )
}

function MorningBriefingWidget() {
  return (
    <WidgetCard delay={0.1}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{'\uD83C\uDF99\uFE0F'}</span>
        <h3 className="text-sm font-semibold text-white/90">Morning Briefing</h3>
      </div>
      <p className="text-xs text-white/40 mb-1">Today&apos;s Briefing &mdash; Feb 8, 2026</p>
      <p className="text-xs text-white/55 leading-relaxed mb-4 line-clamp-2">
        Tech stocks rise, Solar panel costs drop 12%, IEC announces new grid connection policy changes...
      </p>
      <AudioWaveform />
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <m.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/80 border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
            style={{ background: `${PURPLE}15` }}
          >
            <span>{'\u25B6'}</span> Play
          </m.button>
          <span className="text-[10px] text-white/30">4:32</span>
        </div>
      </div>
      <p className="text-[10px] text-white/20 mt-3 italic">
        Auto-generated daily via NotebookLM
      </p>
    </WidgetCard>
  )
}

function HealthWidget() {
  const maxBar = Math.max(...RECOVERY_WEEK)

  return (
    <WidgetCard delay={0.2}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">{'\u2764\uFE0F'}</span>
        <h3 className="text-sm font-semibold text-white/90">Health & Recovery</h3>
      </div>

      {/* Recovery score — big number */}
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-3xl font-bold text-emerald-400">
          <CountUp target={87} suffix="%" duration={1.5} delay={0.5} />
        </span>
        <span className="text-xs text-emerald-400/60">Recovery</span>
        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
          {'\uD83D\uDFE2'} Green
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <p className="text-[10px] text-white/30 mb-0.5">{'\u2764\uFE0F'} Resting HR</p>
          <p className="text-sm font-semibold text-white/80">52 <span className="text-[10px] text-white/30">bpm</span></p>
        </div>
        <div>
          <p className="text-[10px] text-white/30 mb-0.5">{'\uD83D\uDE34'} Sleep</p>
          <p className="text-sm font-semibold text-white/80">7h 23m</p>
          <p className="text-[10px] text-white/25">Score: 84</p>
        </div>
        <div>
          <p className="text-[10px] text-white/30 mb-0.5">{'\uD83D\uDD25'} Strain</p>
          <p className="text-sm font-semibold text-white/80">12.4</p>
        </div>
      </div>

      {/* Week's recovery bar chart */}
      <p className="text-[10px] text-white/25 mb-2">This Week</p>
      <div className="flex items-end gap-1.5 h-10">
        {RECOVERY_WEEK.map((val, i) => (
          <m.div
            key={i}
            className="flex-1 rounded-sm"
            style={{
              background:
                val >= 80
                  ? 'rgba(52, 211, 153, 0.6)'
                  : val >= 66
                    ? 'rgba(251, 191, 36, 0.5)'
                    : 'rgba(239, 68, 68, 0.5)',
            }}
            initial={{ height: 0 }}
            whileInView={{ height: `${(val / maxBar) * 100}%` }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 + i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <span key={i} className="flex-1 text-center text-[8px] text-white/15">
            {d}
          </span>
        ))}
      </div>
    </WidgetCard>
  )
}

function TasksWidget() {
  const doneCount = TASKS.filter((t) => t.done).length

  return (
    <WidgetCard delay={0.3}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">{'\u2705'}</span>
          <h3 className="text-sm font-semibold text-white/90">Today&apos;s Tasks</h3>
        </div>
        <span className="text-[10px] text-white/30 px-2 py-0.5 rounded-full bg-white/[0.04]">
          {doneCount}/{TASKS.length}
        </span>
      </div>

      <div className="space-y-2.5">
        {TASKS.map((task, i) => (
          <m.div
            key={i}
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-2.5"
          >
            <div
              className="w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0"
              style={{
                borderColor: task.done
                  ? 'rgba(52, 211, 153, 0.5)'
                  : task.inProgress
                    ? `${PURPLE}50`
                    : 'rgba(255, 255, 255, 0.1)',
                background: task.done
                  ? 'rgba(52, 211, 153, 0.15)'
                  : task.inProgress
                    ? `${PURPLE}10`
                    : 'transparent',
              }}
            >
              {task.done && (
                <svg className="w-2.5 h-2.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {task.inProgress && (
                <m.div
                  className="w-2 h-2 rounded-full"
                  style={{ background: PURPLE }}
                  animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </div>
            <span
              className={`text-xs leading-tight ${
                task.done
                  ? 'text-white/30 line-through'
                  : task.inProgress
                    ? 'text-white/70'
                    : 'text-white/50'
              }`}
            >
              {task.text}
            </span>
            {task.inProgress && (
              <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400/70 border border-violet-500/20">
                in progress
              </span>
            )}
          </m.div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
        <m.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${PURPLE}, #34d399)`,
          }}
          initial={{ width: 0 }}
          whileInView={{ width: `${(doneCount / TASKS.length) * 100}%` }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </WidgetCard>
  )
}

function CalendarWidget() {
  return (
    <WidgetCard delay={0.15} className="lg:col-span-1">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">{'\uD83D\uDCC5'}</span>
        <h3 className="text-sm font-semibold text-white/90">Calendar</h3>
        <span className="ml-auto text-[10px] text-white/25">Next up</span>
      </div>

      <div className="space-y-3">
        {CALENDAR_EVENTS.map((evt, i) => (
          <m.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-start gap-3"
          >
            <div className="flex flex-col items-center">
              <span className="text-xs font-mono font-semibold text-white/70">{evt.time}</span>
              {i < CALENDAR_EVENTS.length - 1 && (
                <div className="w-[1px] h-6 mt-1 bg-white/[0.06]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/70 font-medium">
                {evt.title} {evt.emoji || ''}
              </p>
              {evt.detail && (
                <p className="text-[10px] text-white/30 mt-0.5">{evt.detail}</p>
              )}
            </div>
            {i === 0 && (
              <m.div
                className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                style={{ background: PURPLE }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </m.div>
        ))}
      </div>
    </WidgetCard>
  )
}

function SocialIntelWidget() {
  return (
    <WidgetCard delay={0.25} className="lg:col-span-1">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">{'\uD83D\uDCE1'}</span>
        <h3 className="text-sm font-semibold text-white/90">Social Intelligence</h3>
      </div>

      <div className="space-y-3">
        {SOCIAL_INTEL.map((item, i) => (
          <m.div
            key={i}
            initial={{ opacity: 0, x: 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-start gap-2.5"
          >
            <span className="text-sm flex-shrink-0 mt-0.5">{item.icon}</span>
            <div>
              <p className="text-[10px] text-white/30 font-medium">{item.platform}</p>
              <p className="text-xs text-white/55">{item.text}</p>
            </div>
          </m.div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center gap-1.5">
        <m.div
          className="w-1.5 h-1.5 rounded-full bg-emerald-400/60"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span className="text-[10px] text-white/20">Last scan: 2 hours ago</span>
      </div>
    </WidgetCard>
  )
}

// ═══════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════

export default function KanielOSPage() {
  return (
    <div className="min-h-screen relative" style={{ backgroundColor: BG }}>
      {/* ═══ ANIMATED BACKGROUND ═══ */}
      <div className="fixed inset-0 -z-10" style={{ backgroundColor: BG }}>
        {/* Glow orbs */}
        <m.div
          className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full blur-[160px]"
          style={{ background: PURPLE, opacity: 0.06 }}
          animate={{ x: [0, 80, 0], y: [0, 50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <m.div
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{ background: PURPLE, opacity: 0.04 }}
          animate={{ x: [0, -60, 0], y: [0, -40, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <m.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px]"
          style={{
            background: `radial-gradient(circle, ${PURPLE}25, transparent 60%)`,
          }}
          animate={{ scale: [0.8, 1.15, 0.8], opacity: [0.03, 0.07, 0.03] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <FloatingParticles />
        {/* Noise overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* ═══ BACK NAVIGATION ═══ */}
      <m.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="fixed top-5 left-5 z-50"
      >
        <Link
          href="/kaniel"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] backdrop-blur-xl border border-white/[0.08] text-white/50 hover:text-white/80 hover:bg-white/[0.1] transition-all duration-300 text-sm"
        >
          <span>{'\u2190'}</span> Back to profile
        </Link>
      </m.div>

      {/* ═══ CONTENT ═══ */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        {/* ─── HERO SECTION ─── */}
        <m.div
          className="text-center mb-16 sm:mb-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Brain emoji with breathing glow */}
          <m.div className="relative inline-block mb-6">
            {/* Glow behind emoji */}
            <m.div
              className="absolute inset-0 rounded-full blur-2xl"
              style={{ background: PURPLE, opacity: 0.3 }}
              animate={{
                scale: [0.8, 1.3, 0.8],
                opacity: [0.15, 0.4, 0.15],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <m.span
              className="relative text-6xl sm:text-7xl block"
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.3,
                type: 'spring',
                stiffness: 200,
                damping: 15,
              }}
            >
              {'\uD83E\uDDE0'}
            </m.span>
          </m.div>

          {/* Title */}
          <m.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7, ease: [0, 0, 0.2, 1] }}
          >
            <m.span
              className="bg-clip-text text-transparent bg-[length:200%_100%]"
              style={{
                backgroundImage: `linear-gradient(90deg, #ffffff 0%, ${PURPLE} 30%, #ffffff 50%, ${PURPLE} 70%, #ffffff 100%)`,
              }}
              animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            >
              Kaniel OS
            </m.span>
          </m.h1>

          {/* Tagline */}
          <m.p
            className="text-lg sm:text-xl text-white/60 font-medium mb-4"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.6 }}
          >
            A personal life operating system powered by AI agents
          </m.p>

          {/* Description */}
          <m.p
            className="max-w-2xl mx-auto text-sm sm:text-base text-white/35 leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            An integrated system of AI agents that handle the daily operational overhead of
            life &mdash; from morning news briefings to health tracking, task management, and
            social media intelligence. Less time managing, more time living.
          </m.p>
        </m.div>

        {/* ─── COMMAND CENTER ─── */}
        <m.div
          className="mb-16 sm:mb-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Window frame */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] overflow-hidden">
            {/* Title bar */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.04] bg-white/[0.02]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                <div className="w-3 h-3 rounded-full bg-green-400/60" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-2 px-4 py-1 rounded-md bg-white/[0.03] text-[11px] text-white/25 font-mono">
                  <m.div
                    className="w-1.5 h-1.5 rounded-full bg-emerald-400/70"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  kaniel-os://command-center
                </div>
              </div>
              <div className="w-12" /> {/* Spacer for symmetry */}
            </div>

            {/* Dashboard content */}
            <div className="p-4 sm:p-6">
              {/* Top row — 3 widgets */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <MorningBriefingWidget />
                <HealthWidget />
                <TasksWidget />
              </div>

              {/* Bottom row — 2 widgets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CalendarWidget />
                <SocialIntelWidget />
              </div>
            </div>
          </div>
        </m.div>

        {/* ─── FEATURES GRID ─── */}
        <m.div
          className="mb-16 sm:mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
        >
          <m.h2
            className="text-center text-2xl sm:text-3xl font-bold text-white/90 mb-3"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            How it works
          </m.h2>
          <m.p
            className="text-center text-sm text-white/30 mb-10 max-w-lg mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            A constellation of specialized AI agents, each handling a different aspect of daily
            life.
          </m.p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feature, i) => (
              <m.div
                key={i}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  delay: i * 0.08,
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{
                  y: -6,
                  transition: { duration: 0.25 },
                }}
                className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 group overflow-hidden cursor-default"
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at 50% 0%, ${PURPLE}0a, transparent 70%)`,
                  }}
                />

                <m.span
                  className="text-3xl block mb-3"
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {feature.emoji}
                </m.span>
                <h3 className="text-sm font-semibold text-white/85 mb-2">{feature.title}</h3>
                <p className="text-xs text-white/40 leading-relaxed">{feature.description}</p>
              </m.div>
            ))}
          </div>
        </m.div>

        {/* ─── TECH STACK ─── */}
        <m.div
          className="mb-16 sm:mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-center text-xs text-white/25 uppercase tracking-widest mb-5 font-medium">
            Built with
          </h3>
          <div className="flex flex-wrap justify-center gap-2.5">
            {TECH_STACK.map((tech, i) => (
              <m.span
                key={tech}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  delay: i * 0.06,
                  type: 'spring',
                  stiffness: 300,
                  damping: 20,
                }}
                whileHover={{
                  scale: 1.08,
                  y: -2,
                  transition: { duration: 0.2 },
                }}
                className="px-4 py-2 rounded-full text-xs font-medium border border-white/[0.08] bg-white/[0.03] text-white/50 hover:text-white/70 hover:border-white/15 transition-colors cursor-default"
              >
                {tech}
              </m.span>
            ))}
          </div>
        </m.div>

        {/* ─── BOTTOM CTA ─── */}
        <m.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Link href="/kaniel">
            <m.span
              className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full border text-sm text-white/50 hover:text-white/80 transition-all duration-300 cursor-pointer"
              style={{
                borderColor: `${PURPLE}25`,
                background: `linear-gradient(135deg, ${PURPLE}08, transparent)`,
              }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <span>{'\u2190'}</span>
              Back to Kaniel&apos;s Profile
            </m.span>
          </Link>
        </m.div>
      </div>
    </div>
  )
}
