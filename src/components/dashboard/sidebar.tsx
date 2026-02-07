'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Link2, Palette, Share2, BarChart3, Briefcase, Settings, LogOut, Key } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navigation = [
  { name: 'Links', href: '/dashboard', icon: Link2 },
  { name: 'Appearance', href: '/dashboard/appearance', icon: Palette },
  { name: 'Social', href: '/dashboard/social', icon: Share2 },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Services', href: '/dashboard/services', icon: Briefcase },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

const developerNavigation = [
  { name: 'API Keys', href: '/dashboard/api-keys', icon: Key },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900 border-r border-gray-800">
      <div className="flex h-16 items-center px-6 border-b border-gray-800">
        <Link href="/dashboard" className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          LinkHub
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-6">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </div>

        {/* Developer Section */}
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Developer
          </p>
          {developerNavigation.map((item) => {
            const isActive = pathname.startsWith(item.href)

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  )
}
