'use client'

import { m, AnimatePresence } from 'motion/react'
import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { fadeUpVariants, spring } from '@/lib/motion'

const freeFeatures = [
  'Up to 5 links',
  '2 social embeds',
  'Basic analytics (7 days)',
  'Standard themes',
  'LinkHub branding',
]

const proFeatures = [
  'Unlimited links',
  'Unlimited embeds',
  'Advanced analytics (365 days)',
  'Custom themes & fonts',
  'Custom domain',
  'No LinkHub branding',
  'Priority support',
  'API access',
]

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false)

  const monthlyPrice = 9
  const annualPrice = 7
  const annualTotal = annualPrice * 12

  return (
    <section id="pricing" className="py-24 md:py-32 bg-black relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto px-4 relative">
        {/* Header */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
          className="text-center mb-12 md:mb-16"
        >
          <m.span
            className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-sm text-purple-300 mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Pricing
          </m.span>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Start free and upgrade when you need more. No hidden fees, cancel anytime.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className={cn('text-sm font-medium transition-colors', !isAnnual ? 'text-white' : 'text-zinc-500')}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={cn(
                'relative w-12 h-6 rounded-full transition-colors',
                isAnnual ? 'bg-purple-500' : 'bg-zinc-700'
              )}
              aria-label="Toggle annual pricing"
            >
              <m.div
                className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
                animate={{ x: isAnnual ? 24 : 0 }}
                transition={spring.snappy}
              />
            </button>
            <span className={cn('text-sm font-medium transition-colors', isAnnual ? 'text-white' : 'text-zinc-500')}>
              Annual
            </span>
            {isAnnual && (
              <m.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full"
              >
                Save 20%
              </m.span>
            )}
          </div>
        </m.div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
          {/* Free Card */}
          <m.div
            variants={fadeUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
          >
            <div className="h-full p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-1">Free</h3>
              <p className="text-sm text-zinc-500 mb-6">Perfect for getting started</p>

              <div className="mb-8">
                <span className="text-5xl font-bold text-white">$0</span>
                <span className="text-zinc-500 ml-2">/forever</span>
              </div>

              <m.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={spring.snappy}>
                <Button
                  asChild
                  variant="outline"
                  className="w-full h-12 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  <Link href="/login">Get Started Free</Link>
                </Button>
              </m.div>

              <ul className="mt-8 space-y-3">
                {freeFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-zinc-400">
                    <Check className="h-4 w-4 text-zinc-600 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </m.div>

          {/* Pro Card */}
          <m.div
            variants={fadeUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0, 0, 0.2, 1] }}
          >
            <div className="relative h-full">
              {/* Glow effect */}
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-purple-500/50 via-pink-500/30 to-purple-500/50 blur-sm" />
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-purple-500 via-pink-500 to-purple-500 opacity-20" />

              <div className="relative h-full p-8 rounded-2xl bg-zinc-900 border border-purple-500/20">
                {/* Badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
                    Most Popular
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-white mb-1">Pro</h3>
                <p className="text-sm text-zinc-500 mb-6">For serious creators</p>

                <div className="mb-8">
                  <AnimatePresence mode="wait">
                    <m.div
                      key={isAnnual ? 'annual' : 'monthly'}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="text-5xl font-bold text-white">
                        ${isAnnual ? annualPrice : monthlyPrice}
                      </span>
                      <span className="text-zinc-500 ml-2">/mo</span>
                      {isAnnual && (
                        <span className="block text-sm text-zinc-500 mt-1">
                          ${annualTotal}/year
                        </span>
                      )}
                    </m.div>
                  </AnimatePresence>
                </div>

                <m.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={spring.snappy}>
                  <Button
                    asChild
                    className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25"
                  >
                    <Link href="/login">Start Pro Trial</Link>
                  </Button>
                </m.div>

                <ul className="mt-8 space-y-3">
                  {proFeatures.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-zinc-300">
                      <Check className="h-4 w-4 text-purple-400 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </m.div>
        </div>
      </div>
    </section>
  )
}
