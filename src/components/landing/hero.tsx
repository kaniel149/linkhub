'use client'

import { m, useScroll, useTransform, useMotionValue, useSpring } from 'motion/react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { useRef } from 'react'
import {
  staggerContainerVariants,
  fadeUpVariants,
  fadeUpBlurVariants,
  spring,
} from '@/lib/motion'

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
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight"
            >
              <span className="lh-gradient-text">One Link</span>
              <br />
              <span className="text-white">For Everything</span>
            </m.h1>

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
                    Get Started Free
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
                  <Link href="#features">See Features</Link>
                </Button>
              </m.div>
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
 * PhoneMockup
 *
 * Interactive phone preview with animated content.
 */
function PhoneMockup() {
  const links = [
    { title: 'My Website', icon: '🌐' },
    { title: 'YouTube Channel', icon: '📺' },
    { title: 'Instagram', icon: '📷' },
    { title: 'My Shop', icon: '🛒' },
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
              className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 ring-4 ring-white/10 mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            />

            {/* Name */}
            <m.div
              className="text-center mb-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="h-5 w-28 mx-auto bg-white rounded-md" />
            </m.div>

            {/* Bio */}
            <m.div
              className="text-center mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="h-3 w-36 mx-auto bg-zinc-700 rounded" />
            </m.div>

            {/* Links */}
            <div className="space-y-3">
              {links.map((link, i) => (
                <m.div
                  key={link.title}
                  className="h-12 md:h-14 bg-purple-500/20 rounded-xl border border-purple-500/30 flex items-center px-4 gap-3"
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
