'use client'

import { m, useScroll, useTransform, AnimatePresence } from 'motion/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

export function Navbar() {
  const { scrollY } = useScroll()
  const [mobileOpen, setMobileOpen] = useState(false)

  const backgroundOpacity = useTransform(scrollY, [0, 80], [0, 0.8])
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 0.06])
  const blur = useTransform(scrollY, [0, 80], [0, 20])

  return (
    <>
      <m.header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          backgroundColor: useTransform(
            backgroundOpacity,
            (opacity) => `rgba(0, 0, 0, ${opacity})`
          ),
          backdropFilter: useTransform(blur, (b) => `blur(${b}px)`),
          WebkitBackdropFilter: useTransform(blur, (b) => `blur(${b}px)`),
          borderBottom: useTransform(
            borderOpacity,
            (opacity) => `1px solid rgba(255, 255, 255, ${opacity})`
          ),
        }}
      >
        <nav className="max-w-[1200px] mx-auto px-5 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link
              href="/"
              className="text-[20px] font-bold lh-gradient-text"
            >
              LinkHub
            </Link>

            {/* Center nav links — desktop */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-[14px] text-[#86868B] hover:text-[#F5F5F7] transition-colors duration-300"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-[14px] text-[#86868B] hover:text-[#F5F5F7] transition-colors duration-300"
              >
                Pricing
              </a>
            </div>

            {/* Right buttons — desktop */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-[#86868B] hover:text-[#F5F5F7]"
                asChild
              >
                <Link href="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/login">Get Started</Link>
              </Button>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 text-[#86868B] hover:text-[#F5F5F7] transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </nav>
      </m.header>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <m.div
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-5 p-2 text-[#86868B] hover:text-[#F5F5F7] transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>

            <nav className="flex flex-col items-center gap-8">
              <m.a
                href="#features"
                onClick={() => setMobileOpen(false)}
                className="text-[28px] font-semibold text-[#F5F5F7]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Features
              </m.a>
              <m.a
                href="#pricing"
                onClick={() => setMobileOpen(false)}
                className="text-[28px] font-semibold text-[#F5F5F7]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                Pricing
              </m.a>
              <m.div
                className="flex flex-col items-center gap-4 mt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button variant="ghost" size="lg" asChild>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    Log in
                  </Link>
                </Button>
                <Button size="lg" asChild>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </m.div>
            </nav>
          </m.div>
        )}
      </AnimatePresence>
    </>
  )
}
