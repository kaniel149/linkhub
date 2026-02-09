'use client'

import { m } from 'motion/react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { transition } from '@/lib/motion'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Animated gradient mesh background — very subtle blobs */}
      <div className="absolute inset-0">
        <m.div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0,113,227,0.08) 0%, transparent 70%)',
          }}
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -30, 20, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <m.div
          className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
          }}
          animate={{
            x: [0, -30, 20, 0],
            y: [0, 20, -40, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <m.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0,163,255,0.05) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-5 max-w-[800px] mx-auto flex flex-col items-center">
        {/* Announcement badge */}
        <m.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition.enter, duration: 0.5 }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(0,113,227,0.08)] border border-[rgba(0,113,227,0.2)] text-[13px] text-[#86868B]">
            <span className="text-[14px]">&#10024;</span>
            Now with AI Agent API
          </span>
        </m.div>

        {/* Headline */}
        <m.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition.enter, duration: 0.6, delay: 0.1 }}
          className="text-[40px] md:text-[56px] font-bold text-[#F5F5F7] tracking-[-0.03em] leading-[1.1] mb-5"
        >
          One link for everything
        </m.h1>

        {/* Subtitle */}
        <m.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition.enter, duration: 0.6, delay: 0.25 }}
          className="text-[17px] md:text-[20px] text-[#86868B] max-w-[600px] leading-[1.5] mb-8"
        >
          Create a beautiful page for your links, services, and portfolio.
          Share it with the world in seconds.
        </m.p>

        {/* CTA buttons */}
        <m.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition.enter, duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 items-center justify-center"
        >
          <Button asChild className="h-12 px-8 text-[16px]">
            <Link href="/login">
              Get Started — it&apos;s free
            </Link>
          </Button>
          <Button asChild variant="ghost" className="h-12 px-8 text-[16px] text-[#86868B] hover:text-[#F5F5F7]">
            <Link href="/kaniel">
              See an example
              <ArrowRight className="ml-1.5 w-4 h-4" />
            </Link>
          </Button>
        </m.div>

        {/* Phone mockup */}
        <m.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition.enter, duration: 0.8, delay: 0.6 }}
          className="mt-16"
        >
          <PhoneMockup />
        </m.div>
      </div>
    </section>
  )
}

function PhoneMockup() {
  const links = [
    { title: 'Portfolio', icon: '\uD83C\uDF10', accent: 'rgba(0,113,227,0.15)', border: 'rgba(0,113,227,0.25)' },
    { title: 'GitHub', icon: '\uD83D\uDCBB', accent: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)' },
    { title: 'LinkedIn', icon: '\uD83D\uDCBC', accent: 'rgba(0,113,227,0.12)', border: 'rgba(0,113,227,0.2)' },
    { title: 'Twitter / X', icon: '\uD83D\uDC26', accent: 'rgba(56,189,248,0.12)', border: 'rgba(56,189,248,0.2)' },
  ]

  return (
    <div className="relative mx-auto w-[260px] md:w-[300px]">
      {/* Glow underneath */}
      <div
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[70%] h-24 rounded-full blur-3xl -z-10"
        style={{ background: 'radial-gradient(ellipse, rgba(0,113,227,0.2), transparent 70%)' }}
      />

      {/* Floating animation wrapper */}
      <m.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Phone frame */}
        <div className="relative w-full aspect-[9/19.5] bg-[#111] rounded-[2.5rem] border-[3px] border-[#333] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
          {/* Dynamic Island */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[90px] h-[28px] bg-black rounded-full z-10" />

          {/* Screen content */}
          <div className="absolute inset-[3px] rounded-[2.3rem] bg-gradient-to-b from-[#0a0a0a] to-[#050505] overflow-hidden">
            <div className="pt-14 px-5 pb-6">
              {/* Avatar */}
              <div className="w-[72px] h-[72px] mx-auto rounded-full bg-gradient-to-br from-[#0071E3] to-[#00A3FF] ring-2 ring-white/10 mb-3 flex items-center justify-center text-[20px] font-bold text-white">
                KT
              </div>

              {/* Name */}
              <p className="text-center text-white font-semibold text-[14px]">
                Kaniel Tordjman
              </p>
              <p className="text-center text-[#86868B] text-[11px] mt-0.5 mb-5">
                Developer &amp; Creator
              </p>

              {/* Links */}
              <div className="space-y-2.5">
                {links.map((link) => (
                  <div
                    key={link.title}
                    className="h-[42px] rounded-xl flex items-center px-3.5 gap-2.5"
                    style={{
                      background: link.accent,
                      border: `1px solid ${link.border}`,
                    }}
                  >
                    <span className="text-[14px]">{link.icon}</span>
                    <span className="text-[12px] text-white/90 font-medium">
                      {link.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Powered by */}
              <p className="text-center text-[10px] text-[#48484A] mt-6">
                Powered by LinkHub
              </p>
            </div>
          </div>
        </div>
      </m.div>
    </div>
  )
}
