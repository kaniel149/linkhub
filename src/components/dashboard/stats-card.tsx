'use client'

import { m } from 'motion/react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { fadeUpVariants, spring } from '@/lib/motion'
import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface StatsCardProps {
  label: string
  value: number | string
  change?: number
  icon: LucideIcon
  iconColor?: string
  iconBgColor?: string
  sparklineData?: number[]
  className?: string
  index?: number
}

/**
 * Sparkline
 *
 * Mini line chart for showing trends in a small space.
 */
function Sparkline({ data, color = '#a855f7' }: { data: number[]; color?: string }) {
  if (!data || data.length < 2) return null

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const width = 80
  const height = 24
  const padding = 2

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2)
    const y = height - padding - ((value - min) / range) * (height - padding * 2)
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`sparkline-gradient-${color.replace('#', '')}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <polygon
        points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`}
        fill={`url(#sparkline-gradient-${color.replace('#', '')})`}
      />
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      <circle
        cx={width - padding}
        cy={height - padding - ((data[data.length - 1] - min) / range) * (height - padding * 2)}
        r={2}
        fill={color}
      />
    </svg>
  )
}

/**
 * StatsCard
 *
 * Animated statistics card with icon, value, change indicator, and sparkline.
 *
 * Usage:
 * ```tsx
 * <StatsCard
 *   label="Page Views"
 *   value={1234}
 *   change={12.5}
 *   icon={Eye}
 *   iconColor="text-blue-400"
 *   iconBgColor="bg-blue-500/20"
 *   sparklineData={[10, 25, 15, 30, 45, 35, 50]}
 * />
 * ```
 */
export function StatsCard({
  label,
  value,
  change,
  icon: Icon,
  iconColor = 'text-purple-400',
  iconBgColor = 'bg-purple-500/20',
  sparklineData,
  className,
  index = 0,
}: StatsCardProps) {
  const isPositive = change !== undefined && change >= 0
  const formattedValue = typeof value === 'number' ? value.toLocaleString() : value
  const formattedChange = change !== undefined ? `${isPositive ? '+' : ''}${change.toFixed(1)}%` : null

  return (
    <m.div
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.4, delay: index * 0.1, ease: [0, 0, 0.2, 1] }}
      whileHover={{ y: -2 }}
    >
      <Card className={cn('bg-zinc-900 border-zinc-800 overflow-hidden', className)}>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            {/* Left side - Icon and stats */}
            <div className="flex items-center gap-4">
              {/* Icon */}
              <m.div
                className={cn('p-3 rounded-full', iconBgColor)}
                whileHover={{ scale: 1.05 }}
                transition={spring.snappy}
              >
                <Icon className={cn('h-6 w-6', iconColor)} />
              </m.div>

              {/* Stats */}
              <div>
                <p className="text-sm text-zinc-400 mb-1">{label}</p>
                <div className="flex items-baseline gap-2">
                  <m.p
                    className="text-2xl font-bold text-white"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                  >
                    {formattedValue}
                  </m.p>

                  {/* Change indicator */}
                  {formattedChange && (
                    <m.span
                      className={cn(
                        'flex items-center text-xs font-medium',
                        isPositive ? 'text-green-400' : 'text-red-400'
                      )}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                    >
                      {isPositive ? (
                        <TrendingUp className="h-3 w-3 mr-0.5" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-0.5" />
                      )}
                      {formattedChange}
                    </m.span>
                  )}
                </div>
              </div>
            </div>

            {/* Right side - Sparkline */}
            {sparklineData && sparklineData.length > 1 && (
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.4 }}
              >
                <Sparkline
                  data={sparklineData}
                  color={isPositive ? '#22c55e' : '#ef4444'}
                />
              </m.div>
            )}
          </div>
        </CardContent>
      </Card>
    </m.div>
  )
}

/**
 * StatsCardSkeleton
 *
 * Loading skeleton for StatsCard.
 */
export function StatsCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('bg-zinc-900 border-zinc-800', className)}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-zinc-800 animate-pulse" />
          <div className="space-y-2">
            <div className="h-3 w-20 bg-zinc-800 rounded animate-pulse" />
            <div className="h-6 w-16 bg-zinc-800 rounded animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
