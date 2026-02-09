'use client'

import { m } from 'motion/react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { fadeUpVariants } from '@/lib/motion'
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

function Sparkline({ data, color = '#0071E3' }: { data: number[]; color?: string }) {
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
      <polygon
        points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`}
        fill={`url(#sparkline-gradient-${color.replace('#', '')})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={width - padding}
        cy={height - padding - ((data[data.length - 1] - min) / range) * (height - padding * 2)}
        r={2}
        fill={color}
      />
    </svg>
  )
}

export function StatsCard({
  label,
  value,
  change,
  icon: Icon,
  iconColor = 'text-[#0071E3]',
  iconBgColor = 'bg-[rgba(0,113,227,0.1)]',
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
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0, 0, 0.2, 1] }}
    >
      <Card className={cn(
        'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)] overflow-hidden',
        className
      )}>
        <CardContent className="pt-5 pb-5">
          <div className="flex items-start justify-between">
            <div>
              {/* Label */}
              <p className="text-[11px] uppercase tracking-[0.08em] text-[#6E6E73] mb-2">{label}</p>

              {/* Value + change */}
              <div className="flex items-baseline gap-2">
                <m.p
                  className="text-[28px] font-bold text-[#F5F5F7] leading-none tabular-nums"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 + 0.2 }}
                >
                  {formattedValue}
                </m.p>

                {formattedChange && (
                  <m.span
                    className={cn(
                      'flex items-center text-[11px] font-medium',
                      isPositive ? 'text-[#30D158]' : 'text-[#FF453A]'
                    )}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 + 0.3 }}
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

            {/* Right side - Icon or sparkline */}
            <div className="flex flex-col items-end gap-2">
              <div className={cn('p-2 rounded-[10px]', iconBgColor)}>
                <Icon className={cn('h-[18px] w-[18px]', iconColor)} />
              </div>
              {sparklineData && sparklineData.length > 1 && (
                <m.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.08 + 0.4 }}
                >
                  <Sparkline
                    data={sparklineData}
                    color={isPositive ? '#30D158' : '#FF453A'}
                  />
                </m.div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </m.div>
  )
}

export function StatsCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.06)]', className)}>
      <CardContent className="pt-5 pb-5">
        <div className="space-y-2">
          <div className="h-3 w-16 bg-[var(--lh-surface-3)] rounded animate-pulse" />
          <div className="h-7 w-20 bg-[var(--lh-surface-3)] rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  )
}
