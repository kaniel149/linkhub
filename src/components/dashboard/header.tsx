'use client'

import { Profile } from '@/lib/types/database'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ExternalLink, Copy } from 'lucide-react'
import { toast } from 'sonner'

interface HeaderProps {
  profile: Profile
}

export function Header({ profile }: HeaderProps) {
  const profileUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${profile.username}`

  const copyLink = () => {
    navigator.clipboard.writeText(profileUrl)
    toast.success('Link copied to clipboard!')
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-800 bg-gray-900 px-6">
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400">Your page:</span>
        <code className="rounded bg-gray-800 px-2 py-1 text-sm text-purple-400">
          {profileUrl}
        </code>
        <Button variant="ghost" size="icon" onClick={copyLink}>
          <Copy className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" asChild>
          <a href={profileUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">{profile.display_name}</span>
        <Avatar className="h-8 w-8">
          <AvatarImage src={profile.avatar_url || undefined} />
          <AvatarFallback>{profile.display_name?.[0] || 'U'}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
