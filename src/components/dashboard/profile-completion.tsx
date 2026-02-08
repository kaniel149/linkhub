'use client'

import { useState, useEffect } from 'react'
import { m } from 'motion/react'
import { cn } from '@/lib/utils'
import { fadeUpBlurVariants, staggerContainerFastVariants } from '@/lib/motion'
import type { Profile } from '@/lib/types/database'
import {
  Camera,
  FileText,
  AtSign,
  Link,
  Share2,
  Check,
  X,
  ChevronRight,
} from 'lucide-react'

interface ProfileCompletionProps {
  profile: Profile
  linkCount: number
}

const STORAGE_KEY = 'linkhub_profile_completion_dismissed'
const SHARED_KEY = 'linkhub_profile_shared'

interface ChecklistItem {
  key: string
  label: string
  done: boolean
  icon: React.ElementType
  href: string
}

export function ProfileCompletion({ profile, linkCount }: ProfileCompletionProps) {
  const [dismissed, setDismissed] = useState(true) // default hidden to prevent flash

  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === 'true')
  }, [])

  const shared = typeof window !== 'undefined'
    ? localStorage.getItem(SHARED_KEY) === 'true'
    : false

  const items: ChecklistItem[] = [
    {
      key: 'avatar',
      label: 'Add profile photo',
      done: !!profile.avatar_url,
      icon: Camera,
      href: '/dashboard/settings',
    },
    {
      key: 'bio',
      label: 'Write your bio',
      done: !!profile.bio?.trim(),
      icon: FileText,
      href: '/dashboard/settings',
    },
    {
      key: 'username',
      label: 'Customize username',
      done: !!profile.onboarding_completed_at,
      icon: AtSign,
      href: '/dashboard/settings',
    },
    {
      key: 'link',
      label: 'Add at least 1 link',
      done: linkCount > 0,
      icon: Link,
      href: '/dashboard',
    },
    {
      key: 'share',
      label: 'Share your profile',
      done: shared,
      icon: Share2,
      href: `/dashboard/settings`,
    },
  ]

  const completed = items.filter(i => i.done).length
  const total = items.length
  const percent = Math.round((completed / total) * 100)
  const isComplete = completed === total

  if (dismissed) return null

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setDismissed(true)
  }

  return (
    <m.div
      variants={fadeUpBlurVariants}
      initial="hidden"
      animate="visible"
      className="relative mb-6 p-5 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden"
    >
      {/* Dismiss button */}
      {isComplete && (
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-white">Complete your profile</h3>
          <p className="text-sm text-zinc-400">
            {isComplete ? 'All done!' : `${percent}% complete`}
          </p>
        </div>
        <span className="text-sm font-medium text-purple-400">
          {completed}/{total}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-5">
        <m.div
          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: [0, 0, 0.2, 1] }}
        />
      </div>

      {/* Checklist */}
      <m.div
        variants={staggerContainerFastVariants}
        initial="hidden"
        animate="visible"
        className="space-y-2"
      >
        {items.map((item) => (
          <m.a
            key={item.key}
            href={item.href}
            variants={fadeUpBlurVariants}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
              item.done
                ? 'text-zinc-500'
                : 'text-zinc-300 hover:bg-zinc-800/50 cursor-pointer'
            )}
          >
            <div className={cn(
              'flex items-center justify-center w-6 h-6 rounded-full shrink-0',
              item.done
                ? 'bg-green-500/20 text-green-400'
                : 'bg-zinc-800 text-zinc-500'
            )}>
              {item.done ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <item.icon className="h-3.5 w-3.5" />
              )}
            </div>
            <span className={cn(
              'text-sm flex-1',
              item.done && 'line-through'
            )}>
              {item.label}
            </span>
            {!item.done && (
              <ChevronRight className="h-4 w-4 text-zinc-600" />
            )}
          </m.a>
        ))}
      </m.div>
    </m.div>
  )
}
