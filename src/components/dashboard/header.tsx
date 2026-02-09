'use client'

import { Profile } from '@/lib/types/database'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ExternalLink, Copy, Menu } from 'lucide-react'
import { toast } from 'sonner'

interface HeaderProps {
  profile: Profile
  onMobileMenuToggle?: () => void
}

export function Header({ profile, onMobileMenuToggle }: HeaderProps) {
  const profileUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${profile.username}`

  const copyLink = () => {
    navigator.clipboard.writeText(profileUrl)
    toast.success('Link copied to clipboard!')
  }

  return (
    <header className="flex h-14 items-center justify-between bg-transparent px-4 md:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-[#86868B]"
          onClick={onMobileMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {/* View Profile pill button */}
        <Button
          variant="outline"
          size="sm"
          asChild
          className="hidden sm:inline-flex"
        >
          <a href={profileUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3.5 w-3.5" />
            View Profile
          </a>
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={copyLink}
          className="text-[#86868B] hover:text-[#F5F5F7]"
        >
          <Copy className="h-3.5 w-3.5" />
        </Button>

        {/* Profile avatar */}
        <div className="flex items-center gap-2.5 ml-1">
          <span className="text-[13px] text-[#86868B] hidden sm:inline">{profile.display_name}</span>
          <Avatar className="h-8 w-8 ring-1 ring-[rgba(255,255,255,0.08)]">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="bg-[var(--lh-surface-3)] text-[#F5F5F7] text-xs">
              {profile.display_name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
