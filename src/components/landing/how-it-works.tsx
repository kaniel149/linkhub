'use client'

import { m } from 'motion/react'
import { UserPlus, Link, Rocket, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  staggerContainerSlowVariants,
  fadeUpVariants,
  spring,
} from '@/lib/motion'

interface Step {
  number: string
  icon: LucideIcon
  title: string
  description: string
  gradient: string
}

const steps: Step[] = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Sign Up',
    description: 'Create your free account with Google, GitHub, or Apple',
    gradient: 'from-purple-500 to-violet-500',
  },
  {
    number: '02',
    icon: Link,
    title: 'Add Links',
    description: 'Drop in your links, social profiles, and content',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    number: '03',
    icon: Rocket,
    title: 'Go Live',
    description: 'Share your unique URL with the world',
    gradient: 'from-amber-500 to-orange-500',
  },
]

export function HowItWorks() {
  return (
    <section className="py-24 md:py-32 bg-black relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 relative">
        {/* Header */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
          className="text-center mb-16 md:mb-20"
        >
          <m.span
            className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-sm text-purple-300 mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            How It Works
          </m.span>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Launch Your Page in{' '}
            <span className="lh-gradient-text">3 Steps</span>
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Get up and running in under a minute. No credit card required.
          </p>
        </m.div>

        {/* Steps */}
        <m.div
          variants={staggerContainerSlowVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="relative"
        >
          {/* Connecting line (desktop only) */}
          <div className="hidden lg:block absolute top-1/2 left-[16%] right-[16%] h-px -translate-y-1/2">
            <m.div
              className="w-full h-full bg-gradient-to-r from-purple-500/40 via-pink-500/40 to-orange-500/40"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5, ease: [0, 0, 0.2, 1] }}
              style={{ transformOrigin: 'left' }}
            />
          </div>

          {/* Connecting dots on the line (desktop only) */}
          <div className="hidden lg:flex absolute top-1/2 left-[16%] right-[16%] -translate-y-1/2 justify-between pointer-events-none">
            {[0, 1, 2].map((i) => (
              <m.div
                key={i}
                className="w-3 h-3 rounded-full bg-purple-500/60 ring-4 ring-black"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 + i * 0.2, type: 'spring', stiffness: 300 }}
              />
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-6">
            {steps.map((step, i) => (
              <StepCard key={step.number} step={step} index={i} />
            ))}
          </div>
        </m.div>
      </div>
    </section>
  )
}

function StepCard({ step, index }: { step: Step; index: number }) {
  return (
    <m.div
      variants={fadeUpVariants}
      transition={{ duration: 0.5, delay: index * 0.15, ease: [0, 0, 0.2, 1] }}
      className="relative"
    >
      <m.div
        className={cn(
          'relative p-8 md:p-10 rounded-2xl text-center',
          'bg-zinc-900/50 backdrop-blur-sm',
          'border border-zinc-800',
          'group',
          'overflow-hidden'
        )}
        whileHover={{ y: -4 }}
        transition={spring.soft}
      >
        {/* Hover gradient overlay */}
        <m.div
          className={cn(
            'absolute inset-0 opacity-0 bg-gradient-to-br',
            step.gradient
          )}
          whileHover={{ opacity: 0.05 }}
          transition={{ duration: 0.3 }}
        />

        {/* Step number */}
        <div className="text-6xl md:text-7xl font-black text-zinc-800/50 absolute top-4 right-6 select-none group-hover:text-zinc-800/70 transition-colors">
          {step.number}
        </div>

        {/* Icon */}
        <m.div
          className={cn(
            'w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6',
            'bg-gradient-to-br',
            step.gradient,
            'shadow-lg'
          )}
          style={{
            boxShadow: `0 10px 30px -10px ${step.gradient.includes('purple') ? '#a855f7' : step.gradient.includes('pink') ? '#ec4899' : '#f59e0b'}40`,
          }}
          whileHover={{ scale: 1.05, rotate: 5 }}
          transition={spring.bouncy}
        >
          <step.icon className="h-8 w-8 text-white" strokeWidth={1.5} />
        </m.div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-white mb-2">
          {step.title}
        </h3>

        {/* Description */}
        <p className="text-zinc-400 leading-relaxed">
          {step.description}
        </p>
      </m.div>
    </m.div>
  )
}
