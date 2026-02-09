'use client'

import { m, AnimatePresence } from 'motion/react'
import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { fadeUpVariants, spring, transition } from '@/lib/motion'

const freeFeatures = [
  '5 Links',
  'Basic analytics (7 days)',
  '1 Service listing',
  'Custom theme',
]

const proFeatures = [
  'Unlimited links',
  'Advanced analytics (365 days)',
  'Unlimited services',
  'AI Agent MCP API',
  '10 Integrations',
  'Custom domain',
  'Priority support',
]

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false)

  const monthlyPrice = 9
  const annualPrice = 7

  return (
    <section
      id="pricing"
      className="py-[120px] bg-black relative"
    >
      <div className="max-w-[900px] mx-auto px-5">
        {/* Section header */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ ...transition.enter, duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-[12px] uppercase tracking-[0.08em] text-[#0071E3] mb-3 font-medium">
            Pricing
          </p>
          <h2 className="text-[32px] md:text-[40px] font-bold text-[#F5F5F7] tracking-[-0.02em] mb-4">
            Start for free
          </h2>
          <p className="text-[17px] text-[#86868B] max-w-[500px] mx-auto">
            No hidden fees. Upgrade when you need more.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span
              className={cn(
                'text-[14px] font-medium transition-colors duration-200',
                !isAnnual ? 'text-[#F5F5F7]' : 'text-[#48484A]'
              )}
            >
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={cn(
                'relative w-[44px] h-[24px] rounded-full transition-colors duration-200',
                isAnnual ? 'bg-[#0071E3]' : 'bg-[#48484A]'
              )}
              aria-label="Toggle annual pricing"
            >
              <m.div
                className="absolute top-[3px] left-[3px] w-[18px] h-[18px] bg-white rounded-full"
                animate={{ x: isAnnual ? 20 : 0 }}
                transition={spring.snappy}
              />
            </button>
            <span
              className={cn(
                'text-[14px] font-medium transition-colors duration-200',
                isAnnual ? 'text-[#F5F5F7]' : 'text-[#48484A]'
              )}
            >
              Annual
            </span>
            <AnimatePresence>
              {isAnnual && (
                <m.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-[12px] font-medium text-[#30D158] bg-[rgba(48,209,88,0.12)] px-2.5 py-0.5 rounded-full"
                >
                  Save 20%
                </m.span>
              )}
            </AnimatePresence>
          </div>
        </m.div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Free Card */}
          <m.div
            variants={fadeUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            transition={{ ...transition.enter, duration: 0.5 }}
          >
            <div className="h-full p-8 rounded-[12px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
              <span className="inline-block text-[12px] uppercase tracking-[0.08em] text-[#6E6E73] font-medium mb-4">
                Free
              </span>

              <div className="mb-6">
                <span className="text-[48px] font-bold text-[#F5F5F7] leading-none">$0</span>
                <span className="text-[15px] text-[#6E6E73] ml-2">Forever free</span>
              </div>

              <Button
                asChild
                variant="outline"
                className="w-full h-12"
              >
                <Link href="/login">Get Started</Link>
              </Button>

              <ul className="mt-8 space-y-3.5">
                {freeFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 text-[14px] text-[#86868B]"
                  >
                    <Check className="w-4 h-4 text-[#30D158] shrink-0" />
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
            transition={{ ...transition.enter, duration: 0.5, delay: 0.1 }}
          >
            <div className="relative h-full p-8 rounded-[12px] bg-[rgba(255,255,255,0.03)] border border-[rgba(0,113,227,0.3)]">
              {/* Popular badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3.5 py-1 text-[11px] font-semibold bg-[#0071E3] text-white rounded-full">
                  Popular
                </span>
              </div>

              <span className="inline-block text-[12px] uppercase tracking-[0.08em] text-[#6E6E73] font-medium mb-4">
                Pro
              </span>

              <div className="mb-6">
                <AnimatePresence mode="wait">
                  <m.div
                    key={isAnnual ? 'annual' : 'monthly'}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="text-[48px] font-bold text-[#F5F5F7] leading-none">
                      ${isAnnual ? annualPrice : monthlyPrice}
                    </span>
                    <span className="text-[15px] text-[#6E6E73] ml-2">/mo</span>
                    {isAnnual && (
                      <span className="block text-[13px] text-[#6E6E73] mt-1">
                        <span className="line-through text-[#48484A]">${monthlyPrice}/mo</span>
                        {' '}Billed annually
                      </span>
                    )}
                    {!isAnnual && (
                      <span className="block text-[13px] text-[#6E6E73] mt-1">
                        Billed monthly
                      </span>
                    )}
                  </m.div>
                </AnimatePresence>
              </div>

              <Button
                asChild
                className="w-full h-12"
              >
                <Link href="/login">Start Pro</Link>
              </Button>

              <ul className="mt-8 space-y-3.5">
                {proFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 text-[14px] text-[#86868B]"
                  >
                    <Check className="w-4 h-4 text-[#30D158] shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </m.div>
        </div>
      </div>
    </section>
  )
}
