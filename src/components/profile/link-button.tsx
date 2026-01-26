'use client'

import { Link } from '@/lib/types/database'
import { motion } from 'framer-motion'

interface LinkButtonProps {
  link: Link
  primaryColor: string
  onClick: () => void
}

export function LinkButton({ link, primaryColor, onClick }: LinkButtonProps) {
  return (
    <motion.a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className="block w-full p-4 rounded-2xl text-center font-medium transition-all"
      style={{
        backgroundColor: `${primaryColor}20`,
        border: `1px solid ${primaryColor}40`,
        color: 'white',
      }}
      whileHover={{
        scale: 1.02,
        backgroundColor: `${primaryColor}30`,
      }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <span className="mr-2">{link.icon}</span>
      {link.title}
    </motion.a>
  )
}
