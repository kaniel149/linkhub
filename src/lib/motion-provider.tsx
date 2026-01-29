'use client'

import { LazyMotion, domAnimation, MotionConfig } from 'motion/react'
import { type ReactNode } from 'react'

interface MotionProviderProps {
  children: ReactNode
}

/**
 * MotionProvider
 *
 * Wraps the app with Motion configuration:
 * - LazyMotion: Reduces bundle size from 34KB to ~4.6KB
 * - MotionConfig: Respects user's reduced motion preference
 *
 * Usage:
 * Wrap your app layout with this provider:
 *
 * ```tsx
 * // app/layout.tsx
 * import { MotionProvider } from '@/lib/motion-provider'
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <MotionProvider>{children}</MotionProvider>
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 */
export function MotionProvider({ children }: MotionProviderProps) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        {children}
      </MotionConfig>
    </LazyMotion>
  )
}
