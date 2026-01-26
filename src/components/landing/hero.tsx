'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900" />
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20" />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              One Link
            </span>
            <br />
            <span className="text-white">For Everything</span>
          </h1>

          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Create a beautiful page with all your links. Share it everywhere.
            Track clicks and grow your audience.
          </p>

          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8">
              <Link href="/login">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Preview mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16"
        >
          <div className="relative mx-auto w-[280px] h-[580px] bg-gray-900 rounded-[3rem] border-4 border-gray-800 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-800 rounded-b-2xl" />
            <div className="p-6 pt-10">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4" />
              <div className="h-4 w-24 mx-auto bg-gray-700 rounded mb-2" />
              <div className="h-3 w-32 mx-auto bg-gray-800 rounded mb-6" />

              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="h-12 bg-purple-500/20 rounded-xl mb-3 border border-purple-500/30"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
