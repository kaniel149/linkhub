'use client'

import { m } from 'motion/react'
import { UserPlus, Layers, Share2, type LucideIcon } from 'lucide-react'
import {
  fadeUpVariants,
  transition,
} from '@/lib/motion'

interface Step {
  number: string
  icon: LucideIcon
  title: string
  description: string
}

const steps: Step[] = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Claim your link',
    description: 'Sign up and choose your unique linkhub.com/name URL.',
  },
  {
    number: '02',
    icon: Layers,
    title: 'Add your content',
    description: 'Drop in links, services, social profiles, and more.',
  },
  {
    number: '03',
    icon: Share2,
    title: 'Share everywhere',
    description: 'Put your link in bios, emails, and business cards.',
  },
]

export function HowItWorks() {
  return (
    <section className="pt-[120px] pb-[80px] bg-black relative">
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
            How it works
          </p>
          <h2 className="text-[32px] md:text-[40px] font-bold text-[#F5F5F7] tracking-[-0.02em]">
            Launch in 3 steps
          </h2>
        </m.div>

        {/* Steps row */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-10">
          {steps.map((step, i) => (
            <m.div
              key={step.number}
              variants={fadeUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              transition={{ ...transition.enter, duration: 0.5, delay: i * 0.15 }}
              className="text-center relative"
            >
              {/* Watermark number */}
              <div className="text-[48px] font-bold text-[rgba(255,255,255,0.06)] leading-none mb-4 select-none">
                {step.number}
              </div>

              {/* Icon */}
              <div className="w-[48px] h-[48px] mx-auto mb-5 flex items-center justify-center">
                <step.icon className="w-10 h-10 text-[#0071E3]" strokeWidth={1.5} />
              </div>

              {/* Title */}
              <h3 className="text-[20px] font-bold text-[#F5F5F7] mb-2">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-[15px] text-[#86868B] leading-relaxed max-w-[280px] mx-auto">
                {step.description}
              </p>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  )
}
