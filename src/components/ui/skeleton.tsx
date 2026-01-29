'use client'

import { m } from 'motion/react'
import { cn } from '@/lib/utils'
import { skeletonTransition } from '@/lib/motion'

interface SkeletonProps {
  className?: string
}

/**
 * Skeleton
 *
 * Animated loading placeholder with subtle pulse effect.
 * Uses Motion for smooth, GPU-accelerated animation.
 *
 * Usage:
 * ```tsx
 * // Basic skeleton
 * <Skeleton className="h-4 w-32" />
 *
 * // Circle skeleton (avatar)
 * <Skeleton className="h-12 w-12 rounded-full" />
 *
 * // Card skeleton
 * <Skeleton className="h-24 w-full rounded-lg" />
 * ```
 */
function Skeleton({ className }: SkeletonProps) {
  return (
    <m.div
      className={cn(
        'bg-zinc-800 rounded-md',
        className
      )}
      animate={{
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={skeletonTransition}
    />
  )
}

/**
 * SkeletonText
 *
 * Text line skeleton with natural width variation.
 */
function SkeletonText({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-4 w-full', className)} />
}

/**
 * SkeletonTitle
 *
 * Title/heading skeleton.
 */
function SkeletonTitle({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-6 w-48', className)} />
}

/**
 * SkeletonAvatar
 *
 * Circular avatar skeleton.
 */
function SkeletonAvatar({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-10 w-10 rounded-full', className)} />
}

/**
 * SkeletonButton
 *
 * Button-shaped skeleton.
 */
function SkeletonButton({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-9 w-24 rounded-md', className)} />
}

/**
 * SkeletonCard
 *
 * Full card skeleton with title, text lines, and optional image.
 */
function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn('space-y-3 p-4 rounded-lg bg-zinc-900 border border-zinc-800', className)}>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
    </div>
  )
}

/**
 * SkeletonLinkCard
 *
 * Skeleton matching the LinkCard component structure.
 */
function SkeletonLinkCard({ className }: SkeletonProps) {
  return (
    <div className={cn('flex items-center gap-4 p-4 rounded-lg bg-zinc-900 border border-zinc-800', className)}>
      {/* Drag handle */}
      <Skeleton className="h-5 w-3" />
      {/* Icon */}
      <Skeleton className="h-8 w-8 rounded" />
      {/* Content */}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      {/* Actions */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>
    </div>
  )
}

/**
 * SkeletonStatsCard
 *
 * Skeleton for stats/metrics cards.
 */
function SkeletonStatsCard({ className }: SkeletonProps) {
  return (
    <div className={cn('p-6 rounded-lg bg-zinc-900 border border-zinc-800', className)}>
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </div>
  )
}

/**
 * SkeletonProfile
 *
 * Skeleton for profile page (avatar + name + bio + links).
 */
function SkeletonProfile({ className }: SkeletonProps) {
  return (
    <div className={cn('flex flex-col items-center space-y-4 w-full max-w-md mx-auto', className)}>
      {/* Avatar */}
      <Skeleton className="h-24 w-24 rounded-full" />
      {/* Name */}
      <Skeleton className="h-6 w-32" />
      {/* Bio */}
      <Skeleton className="h-4 w-48" />
      {/* Links */}
      <div className="w-full space-y-3 mt-4">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  )
}

export {
  Skeleton,
  SkeletonText,
  SkeletonTitle,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonCard,
  SkeletonLinkCard,
  SkeletonStatsCard,
  SkeletonProfile,
}
