'use client'

import { m, useScroll, useTransform } from 'motion/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { spring } from '@/lib/motion'

interface NavbarProps {
  className?: string
}

/**
 * Navbar
 *
 * Scroll-aware navigation bar with animated background transition.
 * Transparent at top, becomes solid with blur on scroll.
 *
 * Usage:
 * ```tsx
 * <Navbar />
 * ```
 */
export function Navbar({ className }: NavbarProps) {
  const { scrollY } = useScroll()

  // Background opacity based on scroll
  const backgroundOpacity = useTransform(scrollY, [0, 100], [0, 0.85])
  const borderOpacity = useTransform(scrollY, [0, 100], [0, 0.1])
  const blur = useTransform(scrollY, [0, 100], [0, 12])

  return (
    <m.header
      className={cn(
        'fixed top-0 left-0 right-0 z-50',
        'transition-colors',
        className
      )}
      style={{
        backgroundColor: useTransform(
          backgroundOpacity,
          (opacity) => `rgba(0, 0, 0, ${opacity})`
        ),
        backdropFilter: useTransform(blur, (b) => `blur(${b}px)`),
        borderBottom: useTransform(
          borderOpacity,
          (opacity) => `1px solid rgba(255, 255, 255, ${opacity})`
        ),
      }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <m.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/"
              className="text-xl md:text-2xl font-bold lh-gradient-text"
            >
              LinkHub
            </Link>
          </m.div>

          {/* Desktop Navigation */}
          <m.div
            className="hidden md:flex items-center gap-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
            <NavLink href="#testimonials">Testimonials</NavLink>
          </m.div>

          {/* CTA Buttons */}
          <m.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <m.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={spring.snappy}
            >
              <Button
                variant="ghost"
                className="text-zinc-400 hover:text-white hidden sm:flex"
                asChild
              >
                <Link href="/login">Sign In</Link>
              </Button>
            </m.div>

            <m.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={spring.snappy}
            >
              <Button
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25"
                asChild
              >
                <Link href="/login">Get Started</Link>
              </Button>
            </m.div>
          </m.div>
        </div>
      </nav>
    </m.header>
  )
}

/**
 * NavLink
 *
 * Animated navigation link with hover effect.
 */
function NavLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <m.a
      href={href}
      className="relative text-sm font-medium text-zinc-400 hover:text-white transition-colors"
      whileHover="hover"
    >
      {children}
      <m.span
        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
        initial={{ scaleX: 0, opacity: 0 }}
        variants={{
          hover: { scaleX: 1, opacity: 1 },
        }}
        transition={spring.snappy}
      />
    </m.a>
  )
}
