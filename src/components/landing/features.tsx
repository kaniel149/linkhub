'use client'

import { m } from 'motion/react'
import {
  Bot,
  Server,
  Briefcase,
  BarChart3,
  Plug,
  Link2,
  type LucideIcon,
} from 'lucide-react'
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
  glowColor: string
}

const features: Feature[] = [
  {
    icon: Bot,
    title: 'AI-Agent Ready',
    description:
      'Your profile is readable by Claude, ChatGPT, and other AI agents via a structured API. Humans and machines see the same you.',
    gradient: 'from-cyan-500 to-blue-500',
    glowColor: 'rgba(56, 189, 248, 0.4)',
  },
  {
    icon: Server,
    title: 'MCP Gateway',
    description:
      'Connect to any profile with the Model Context Protocol. AI agents can read, list, and interact with your services natively.',
    gradient: 'from-violet-500 to-purple-500',
    glowColor: 'rgba(139, 92, 246, 0.4)',
  },
  {
    icon: Briefcase,
    title: 'Services & Actions',
    description:
      'Offer consulting, freelance, or products with built-in inquiry forms. Let visitors — or AI agents — book and buy directly.',
    gradient: 'from-amber-500 to-orange-500',
    glowColor: 'rgba(245, 158, 11, 0.4)',
  },
  {
    icon: BarChart3,
    title: 'Agent Analytics',
    description:
      'See which AI agents visit your profile, what they read, and how they interact. A new dimension of audience insight.',
    gradient: 'from-emerald-500 to-green-500',
    glowColor: 'rgba(16, 185, 129, 0.4)',
  },
  {
    icon: Plug,
    title: 'Connect Services',
    description:
      'Integrate Calendly, Stripe, webhooks, and more to power real actions from your profile — triggered by humans or agents.',
    gradient: 'from-pink-500 to-rose-500',
    glowColor: 'rgba(236, 72, 153, 0.4)',
  },
  {
    icon: Link2,
    title: 'Smart Links',
    description:
      'Drag & drop reordering, per-link click analytics, custom themes, and scheduling. The essentials, perfected.',
    gradient: 'from-indigo-500 to-blue-500',
    glowColor: 'rgba(99, 102, 241, 0.4)',
  },
]

export function Features() {
  return (
    <section
      id="features"
      className="py-24 md:py-32 bg-black relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-purple-500/5 rounded-full blur-3xl" />
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
            className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-sm text-cyan-300 mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Built for the AI era
          </m.span>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Your Profile.{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              AI Superpowers.
            </span>
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            The link-in-bio that AI agents can read and act on. Connect with
            your audience — and the next generation of digital assistants.
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
 * Individual feature card with hover effects and icon glow.
 */
function FeatureCard({
  feature,
  index,
}: {
  feature: Feature
  index: number
}) {
  return (
    <m.div
      variants={fadeUpVariants}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0, 0, 0.2, 1],
      }}
      whileHover={{ y: -6 }}
    >
      <m.div
        className={cn(
          'relative p-6 md:p-8 rounded-2xl',
          'bg-zinc-900/50 backdrop-blur-sm',
          'border border-zinc-800',
          'group cursor-default',
          'overflow-hidden',
          'h-full'
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
            hover: { opacity: 0.06 },
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Hover border glow */}
        <m.div
          className="absolute inset-0 rounded-2xl opacity-0"
          style={{
            boxShadow: `inset 0 0 0 1px ${feature.glowColor}`,
          }}
          variants={{
            hover: { opacity: 1 },
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Top-right shimmer line on hover */}
        <m.div
          className="absolute top-0 right-0 w-24 h-[1px] opacity-0"
          style={{
            background: `linear-gradient(90deg, transparent, ${feature.glowColor}, transparent)`,
          }}
          variants={{
            hover: { opacity: 1, x: [40, -40] },
          }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
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
              boxShadow: `0 10px 30px -10px ${feature.glowColor}`,
            }}
            variants={{
              hover: { scale: 1.08, rotate: 5 },
            }}
            transition={spring.bouncy}
          >
            <feature.icon
              className="h-7 w-7 text-white"
              strokeWidth={1.5}
            />
          </m.div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-white transition-colors">
            {feature.title}
          </h3>

          {/* Description */}
          <p className="text-zinc-400 leading-relaxed text-[15px]">
            {feature.description}
          </p>
        </div>
      </m.div>
    </m.div>
  )
}
