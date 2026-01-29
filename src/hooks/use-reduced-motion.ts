'use client'

import { useReducedMotion as useMotionReducedMotion } from 'motion/react'

/**
 * useReducedMotion
 *
 * Hook that detects if the user prefers reduced motion.
 * Uses Motion's built-in hook which respects the system preference.
 *
 * Usage:
 * ```tsx
 * const shouldReduceMotion = useReducedMotion()
 *
 * return (
 *   <motion.div
 *     animate={{
 *       y: shouldReduceMotion ? 0 : [0, -10, 0]
 *     }}
 *   />
 * )
 * ```
 */
export function useReducedMotion(): boolean {
  const shouldReduceMotion = useMotionReducedMotion()
  return shouldReduceMotion ?? false
}

/**
 * getReducedMotionValue
 *
 * Utility to conditionally return values based on reduced motion preference.
 *
 * Usage:
 * ```tsx
 * const shouldReduceMotion = useReducedMotion()
 *
 * const animationProps = getReducedMotionValue(
 *   shouldReduceMotion,
 *   { opacity: 1 },                    // reduced motion value
 *   { opacity: 1, y: 0, scale: 1 }     // full animation value
 * )
 * ```
 */
export function getReducedMotionValue<T>(
  shouldReduceMotion: boolean,
  reducedValue: T,
  fullValue: T
): T {
  return shouldReduceMotion ? reducedValue : fullValue
}
