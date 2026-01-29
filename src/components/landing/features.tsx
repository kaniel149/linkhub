'use client'

import { m } from 'motion/react'
import { Link2, BarChart3, Palette, Zap, Globe, Shield, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  staggerContainerSlowVariants,
  fadeUpVariants,
  spring,
} from '@/lib/motion'

interface Feature {
  icon: LucideIcon
  title: string
  description: string
  gradient: string
}

const features: Feature[] = [
  {
    icon: Link2,
    title: 'Unlimited Links',
    description: 'Add as many links as you want. Organize them with drag and drop.',
    gradient: 'from-purple-500 to-violet-500',
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description: 'Track views, clicks, and see where your visitors come from.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Palette,
    title: 'Beautiful Themes',
    description: 'Choose from stunning themes or customize your own colors.',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized for speed. Your page loads instantly anywhere.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: Globe,
    title: 'Social Embeds',
    description: 'Embed Instagram, TikTok, YouTube and more directly on your page.',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: Shield,
    title: 'Custom Domain',
    description: 'Use your own domain for a professional branded experience.',
    gradient: 'from-indigo-500 to-purple-500',
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 md:py-32 bg-black relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-pink-500/5 rounded-full blur-3xl" />
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
            Features
          </m.span>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Everything You Need
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Powerful features to help you grow your online presence and connect with your audience
          </p>
        </m.div>

        {/* Features grid */}
        <m.div
          variants={staggerContainerSlowVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </m.div>
      </div>
    </section>
  )
}

/**
 * FeatureCard
 *
 * Individual feature card with hover effects.
 */
function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  return (
    <m.div
      variants={fadeUpVariants}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0, 0, 0.2, 1] }}
      whileHover={{ y: -4 }}
    >
      <m.div
        className={cn(
          'relative p-6 md:p-8 rounded-2xl',
          'bg-zinc-900/50 backdrop-blur-sm',
          'border border-zinc-800',
          'group cursor-default',
          'overflow-hidden'
        )}
        whileHover="hover"
      >
        {/* Hover gradient overlay */}
        <m.div
          className={cn(
            'absolute inset-0 opacity-0 bg-gradient-to-br',
            feature.gradient
          )}
          variants={{
            hover: { opacity: 0.05 },
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Hover border glow */}
        <m.div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${feature.gradient.includes('purple') ? '#a855f7' : '#ec4899'}20, transparent)`,
            opacity: 0,
          }}
          variants={{
            hover: { opacity: 1 },
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Content */}
        <div className="relative">
          {/* Icon */}
          <m.div
            className={cn(
              'w-14 h-14 rounded-xl flex items-center justify-center mb-5',
              'bg-gradient-to-br',
              feature.gradient,
              'shadow-lg'
            )}
            style={{
              boxShadow: `0 10px 30px -10px ${feature.gradient.includes('purple') ? '#a855f7' : '#ec4899'}40`,
            }}
            variants={{
              hover: { scale: 1.05, rotate: 5 },
            }}
            transition={spring.bouncy}
          >
            <feature.icon className="h-7 w-7 text-white" strokeWidth={1.5} />
          </m.div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-white transition-colors">
            {feature.title}
          </h3>

          {/* Description */}
          <p className="text-zinc-400 leading-relaxed">
            {feature.description}
          </p>
        </div>
      </m.div>
    </m.div>
  )
}
