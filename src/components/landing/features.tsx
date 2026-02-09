'use client'

import { m } from 'motion/react'
import {
  Link2,
  BarChart3,
  Briefcase,
  Bot,
  Palette,
  Plug,
  type LucideIcon,
} from 'lucide-react'
import { fadeUpVariants, transition } from '@/lib/motion'

interface Feature {
  icon: LucideIcon
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: Link2,
    title: 'Smart Links',
    description:
      'Drag & drop link management, custom icons, scheduling, and per-link click tracking.',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description:
      'Track clicks, page views, and traffic sources. See what resonates with your audience.',
  },
  {
    icon: Briefcase,
    title: 'Services & Booking',
    description:
      'Sell services, accept bookings and payments directly from your page.',
  },
  {
    icon: Bot,
    title: 'AI Agent API',
    description:
      'MCP protocol lets AI agents discover and interact with your profile programmatically.',
  },
  {
    icon: Palette,
    title: 'Custom Themes',
    description:
      'Personalize colors, fonts, and layout to match your brand identity.',
  },
  {
    icon: Plug,
    title: 'Integrations',
    description:
      'Connect Google Calendar, Stripe, webhooks, and more to power real actions.',
  },
]

// Bento layout: row1 = 2 large, row2 = 3 medium, row3 = 1 full
const gridClasses = [
  'md:col-span-6',  // Smart Links — large
  'md:col-span-6',  // Analytics — large
  'md:col-span-4',  // Services — medium
  'md:col-span-4',  // AI Agent — medium
  'md:col-span-4',  // Custom Themes — medium
  'md:col-span-12', // Integrations — full width
]

export function Features() {
  return (
    <section
      id="features"
      className="py-[120px] bg-black relative"
    >
      <div className="max-w-[1200px] mx-auto px-5">
        {/* Section header */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ ...transition.enter, duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-[12px] uppercase tracking-[0.08em] text-[#0071E3] mb-3 font-medium">
            Features
          </p>
          <h2 className="text-[32px] md:text-[40px] font-bold text-[#F5F5F7] tracking-[-0.02em]">
            Everything you need
          </h2>
        </m.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {features.map((feature, i) => (
            <m.div
              key={feature.title}
              className={gridClasses[i]}
              variants={fadeUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              transition={{ ...transition.enter, duration: 0.5, delay: i * 0.08 }}
            >
              <m.div
                className="h-full p-8 rounded-[12px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] group cursor-default"
                whileHover={{
                  borderColor: 'rgba(255,255,255,0.12)',
                  y: -2,
                }}
                transition={{ duration: 0.3 }}
              >
                {/* Icon */}
                <div className="w-10 h-10 flex items-center justify-center mb-5">
                  <feature.icon
                    className="w-8 h-8 text-[#0071E3]"
                    strokeWidth={1.5}
                  />
                </div>

                {/* Title */}
                <h3 className="text-[20px] font-bold text-[#F5F5F7] mb-2">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-[15px] text-[#86868B] leading-relaxed">
                  {feature.description}
                </p>
              </m.div>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  )
}
