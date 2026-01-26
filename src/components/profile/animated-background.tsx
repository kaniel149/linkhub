'use client'

import { motion } from 'framer-motion'

interface AnimatedBackgroundProps {
  primaryColor: string
  backgroundColor: string
}

export function AnimatedBackground({ primaryColor, backgroundColor }: AnimatedBackgroundProps) {
  return (
    <div
      className="fixed inset-0 -z-10"
      style={{ backgroundColor }}
    >
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at 20% 50%, ${primaryColor}40 0%, transparent 50%),
                       radial-gradient(circle at 80% 50%, ${primaryColor}30 0%, transparent 50%)`,
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.4, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
    </div>
  )
}
