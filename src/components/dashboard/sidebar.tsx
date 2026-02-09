'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, Palette, Share2, BarChart3, Briefcase, Settings, LogOut, Key, Plug } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { m, AnimatePresence } from 'motion/react'

const navigation = [
  { name: 'Links', href: '/dashboard', icon: Home },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Services', href: '/dashboard/services', icon: Briefcase },
  { name: 'Social', href: '/dashboard/social', icon: Share2 },
  { name: 'Appearance', href: '/dashboard/appearance', icon: Palette },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

const developerNavigation = [
  { name: 'API Keys', href: '/dashboard/api-keys', icon: Key },
  { name: 'Integrations', href: '/dashboard/integrations', icon: Plug },
]

interface SidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const sidebarContent = (
    <div className="flex h-full w-60 flex-col bg-[#000000] border-r border-[rgba(255,255,255,0.06)]">
      {/* Logo */}
      <div className="flex h-14 items-center px-5">
        <Link
          href="/dashboard"
          className="text-lg font-bold lh-gradient-text tracking-tight"
          onClick={onMobileClose}
        >
          LinkHub
        </Link>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 py-2 space-y-5 overflow-y-auto">
        <div className="space-y-0.5">
          {navigation.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  'flex items-center gap-3 rounded-[var(--lh-radius-pill)] px-3.5 py-2 text-[13px] font-medium transition-all duration-200',
                  isActive
                    ? 'bg-[rgba(0,113,227,0.1)] text-[#0071E3]'
                    : 'text-[#86868B] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#F5F5F7]'
                )}
              >
                <item.icon className="h-[18px] w-[18px]" />
                {item.name}
              </Link>
            )
          })}
        </div>

        {/* Divider */}
        <div className="h-px bg-[rgba(255,255,255,0.06)]" />

        {/* Developer Section */}
        <div className="space-y-0.5">
          <p className="px-3.5 mb-2 text-[11px] font-semibold text-[#48484A] uppercase tracking-[0.08em]">
            Developer
          </p>
          {developerNavigation.map((item) => {
            const isActive = pathname.startsWith(item.href)

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  'flex items-center gap-3 rounded-[var(--lh-radius-pill)] px-3.5 py-2 text-[13px] font-medium transition-all duration-200',
                  isActive
                    ? 'bg-[rgba(0,113,227,0.1)] text-[#0071E3]'
                    : 'text-[#86868B] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#F5F5F7]'
                )}
              >
                <item.icon className="h-[18px] w-[18px]" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom - Logout */}
      <div className="p-3 border-t border-[rgba(255,255,255,0.06)]">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-[var(--lh-radius-pill)] px-3.5 py-2 text-[13px] font-medium text-[#86868B] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#F5F5F7] transition-all duration-200"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Log Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        {sidebarContent}
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={onMobileClose}
            />
            <m.div
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="fixed inset-y-0 left-0 z-50 md:hidden"
            >
              {sidebarContent}
            </m.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
