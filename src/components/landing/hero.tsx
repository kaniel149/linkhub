'use client'

import { m, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, ChevronDown, Eye } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'
import {
  staggerContainerVariants,
  fadeUpVariants,
  fadeUpBlurVariants,
  spring,
} from '@/lib/motion'

const ROTATING_WORDS = ['Creators', 'Developers', 'Entrepreneurs', 'Artists', 'Musicians']
const ROTATION_INTERVAL = 2500

const STATS = [
  { label: 'Creators', target: 10000, suffix: '+', prefix: '' },
  { label: 'Links', target: 500000, suffix: '+', prefix: '' },
  { label: 'Clicks', target: 2000000, suffix: '+', prefix: '' },
]

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`
  return n.toString()
}

export function Hero() {
  const containerRef = useRef<HTMLElement>(null)
  const { scrollY } = useScroll()

  // Parallax effects
  const textY = useTransform(scrollY, [0, 500], [0, -100])
  const textOpacity = useTransform(scrollY, [0, 300], [1, 0])
  const phoneY = useTransform(scrollY, [0, 500], [0, -150])
  const phoneScale = useTransform(scrollY, [0, 300], [1, 0.95])

  // Mouse tracking for 3D effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [5, -5]), {
    stiffness: 300,
    damping: 30,
  })
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-5, 5]), {
    stiffness: 300,
    damping: 30,
  })

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      mouseX.set(e.clientX - centerX)
      mouseY.set(e.clientY - centerY)
    }
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-purple-950/20 to-zinc-950" />

      {/* Animated gradient orb */}
      <m.div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <m.div
            key={i}
            className="absolute w-1 h-1 bg-purple-500/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Text content with parallax */}
        <m.div style={{ y: textY, opacity: textOpacity }}>
          <m.div
            variants={staggerContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <m.div
              variants={fadeUpVariants}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
              </span>
              <span className="text-sm text-purple-300">
                Join 10,000+ creators
              </span>
            </m.div>

            {/* Headline */}
            <m.h1
              variants={fadeUpBlurVariants}
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-4 tracking-tight"
            >
              <span className="text-white">All Your Links.</span>
              <br />
              <span className="lh-gradient-text">One Stunning Page.</span>
            </m.h1>

            {/* Rotating text */}
            <m.div
              variants={fadeUpVariants}
              className="mb-8"
            >
              <RotatingText />
            </m.div>

            {/* Subheadline */}
            <m.p
              variants={fadeUpVariants}
              className="text-lg md:text-xl text-zinc-400 mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              Create a beautiful page with all your links. Share it everywhere.
              Track clicks and grow your audience.
            </m.p>

            {/* CTA Buttons */}
            <m.div
              variants={fadeUpVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <m.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={spring.snappy}
              >
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 shadow-lg shadow-purple-500/25 h-12 text-base"
                >
                  <Link href="/login">
                    Create Your Page — Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </m.div>

              <m.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={spring.snappy}
              >
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white h-12 text-base"
                >
                  <Link href="/kaniel">
                    <Eye className="mr-2 h-5 w-5" />
                    See Demo
                  </Link>
                </Button>
              </m.div>
            </m.div>

            {/* Animated Stats */}
            <m.div variants={fadeUpVariants} className="mt-12">
              <AnimatedStats />
            </m.div>
          </m.div>
        </m.div>

        {/* Phone mockup with 3D effect */}
        <m.div
          style={{
            y: phoneY,
            scale: phoneScale,
            rotateX,
            rotateY,
            transformPerspective: 1000,
          }}
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0, 0, 0.2, 1] }}
          className="mt-16 md:mt-20"
        >
          <PhoneMockup />
        </m.div>
      </div>

      {/* Scroll indicator */}
      <m.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <m.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2 text-zinc-500"
        >
          <span className="text-xs uppercase tracking-wider">Scroll</span>
          <ChevronDown className="h-4 w-4" />
        </m.div>
      </m.div>
    </section>
  )
}

/**
 * RotatingText
 *
 * Cycles through audience types with a slide-up animation.
 */
function RotatingText() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % ROTATING_WORDS.length)
    }, ROTATION_INTERVAL)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex items-center justify-center gap-2 text-xl md:text-2xl text-zinc-400">
      <span>Built for</span>
      <span className="relative inline-block w-[180px] h-[1.4em] overflow-hidden text-left">
        <AnimatePresence mode="wait">
          <m.span
            key={ROTATING_WORDS[index]}
            className="absolute left-0 font-semibold lh-gradient-text"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ duration: 0.35, ease: [0, 0, 0.2, 1] }}
          >
            {ROTATING_WORDS[index]}
          </m.span>
        </AnimatePresence>
      </span>
    </div>
  )
}

/**
 * AnimatedStats
 *
 * Count-up stats that animate when they scroll into view.
 */
function AnimatedStats() {
  const ref = useRef<HTMLDivElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)
  const [counts, setCounts] = useState(STATS.map(() => 0))

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [hasAnimated])

  useEffect(() => {
    if (!hasAnimated) return

    const duration = 2000
    const steps = 60
    const interval = duration / steps

    let step = 0
    const timer = setInterval(() => {
      step++
      const progress = step / steps
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)

      setCounts(STATS.map((stat) => Math.round(stat.target * eased)))

      if (step >= steps) clearInterval(timer)
    }, interval)

    return () => clearInterval(timer)
  }, [hasAnimated])

  return (
    <div
      ref={ref}
      className="flex items-center justify-center gap-8 md:gap-12"
    >
      {STATS.map((stat, i) => (
        <div key={stat.label} className="flex items-center gap-2">
          {i > 0 && (
            <div className="w-px h-8 bg-zinc-800 mr-2 md:mr-4" />
          )}
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-white">
              {stat.prefix}
              {formatNumber(counts[i])}
              {stat.suffix}
            </div>
            <div className="text-xs md:text-sm text-zinc-500">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * PhoneMockup
 *
 * Interactive phone preview showing a mini demo profile.
 */
function PhoneMockup() {
  const links = [
    { title: 'Portfolio', icon: '🌐', color: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30' },
    { title: 'GitHub', icon: '💻', color: 'from-zinc-500/20 to-zinc-400/20', border: 'border-zinc-500/30' },
    { title: 'LinkedIn', icon: '💼', color: 'from-blue-600/20 to-blue-400/20', border: 'border-blue-600/30' },
    { title: 'Twitter / X', icon: '🐦', color: 'from-sky-500/20 to-sky-400/20', border: 'border-sky-500/30' },
  ]

  return (
    <div className="relative mx-auto w-[280px] md:w-[320px] h-[580px] md:h-[640px]">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/20 to-pink-500/20 blur-3xl -z-10 scale-110" />

      {/* Phone frame */}
      <div className="relative w-full h-full bg-zinc-900 rounded-[3rem] border-4 border-zinc-800 shadow-2xl shadow-black/50 overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-zinc-900 rounded-b-2xl z-10 flex items-center justify-center">
          <div className="w-16 h-4 bg-zinc-800 rounded-full" />
        </div>

        {/* Screen content */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-900 to-purple-950/30">
          {/* Animated background blob */}
          <m.div
            className="absolute top-20 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, 20, 0],
              y: [0, -10, 0],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Profile content */}
          <div className="relative pt-14 px-6">
            {/* Avatar */}
            <m.div
              className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 ring-4 ring-white/10 mb-3 flex items-center justify-center text-2xl md:text-3xl font-bold text-white"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            >
              KT
            </m.div>

            {/* Name */}
            <m.div
              className="text-center mb-0.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-white font-semibold text-sm md:text-base">Kaniel Tordjman</p>
            </m.div>

            {/* Bio */}
            <m.div
              className="text-center mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <p className="text-zinc-500 text-xs">Developer & Creator</p>
            </m.div>

            {/* Links */}
            <div className="space-y-3">
              {links.map((link, i) => (
                <m.div
                  key={link.title}
                  className={`h-12 md:h-14 bg-gradient-to-r ${link.color} rounded-xl border ${link.border} flex items-center px-4 gap-3`}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                >
                  <span className="text-lg">{link.icon}</span>
                  <span className="text-sm text-white font-medium">
                    {link.title}
                  </span>
                </m.div>
              ))}
            </div>

            {/* Powered by */}
            <m.p
              className="text-center text-xs text-zinc-600 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
            >
              Powered by LinkHub
            </m.p>
          </div>
        </div>
      </div>

      {/* Reflection */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-6 bg-gradient-to-t from-transparent to-white/5 blur-xl rounded-full" />
    </div>
  )
}
