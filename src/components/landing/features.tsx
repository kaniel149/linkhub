'use client'

import { motion } from 'framer-motion'
import { Link2, BarChart3, Palette, Zap, Globe, Shield } from 'lucide-react'

const features = [
  {
    icon: Link2,
    title: 'Unlimited Links',
    description: 'Add as many links as you want. Organize them with drag and drop.',
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description: 'Track views, clicks, and see where your visitors come from.',
  },
  {
    icon: Palette,
    title: 'Beautiful Themes',
    description: 'Choose from stunning themes or customize your own colors.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized for speed. Your page loads instantly anywhere.',
  },
  {
    icon: Globe,
    title: 'Social Embeds',
    description: 'Embed Instagram, TikTok, YouTube and more directly on your page.',
  },
  {
    icon: Shield,
    title: 'Custom Domain',
    description: 'Use your own domain for a professional branded experience.',
  },
]

export function Features() {
  return (
    <section className="py-24 bg-black">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Everything You Need
          </h2>
          <p className="text-gray-400 text-lg">
            Powerful features to help you grow your online presence
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-purple-500/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
