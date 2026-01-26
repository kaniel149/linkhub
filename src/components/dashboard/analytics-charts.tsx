'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Eye, MousePointer, TrendingUp, Globe, Smartphone, Monitor, Tablet } from 'lucide-react'

interface AnalyticsData {
  totalViews: number
  totalClicks: number
  ctr: string
  chartData: { date: string; views: number; clicks: number }[]
  topCountries: { country: string; count: number }[]
  devices: { device: string; count: number; percentage: number }[]
  topLinks: { id: string; title: string; click_count: number }[]
  retentionDays: number
}

const deviceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  mobile: Smartphone,
  desktop: Monitor,
  tablet: Tablet,
}

export function AnalyticsCharts() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics/stats')
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-gray-400">Loading analytics...</div>
  }

  if (!data) {
    return <div className="text-gray-400">Failed to load analytics</div>
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-500/20">
                <Eye className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Page Views</p>
                <p className="text-2xl font-bold text-white">{data.totalViews.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/20">
                <MousePointer className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Link Clicks</p>
                <p className="text-2xl font-bold text-white">{data.totalClicks.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-500/20">
                <TrendingUp className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">CTR</p>
                <p className="text-2xl font-bold text-white">{data.ctr}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Traffic Overview ({data.retentionDays} days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chartData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#8b5cf6"
                  fillOpacity={1}
                  fill="url(#colorViews)"
                  name="Views"
                />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  stroke="#22c55e"
                  fillOpacity={1}
                  fill="url(#colorClicks)"
                  name="Clicks"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Bottom row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Top Links */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-lg">Top Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topLinks.map((link, i) => (
                <div key={link.id} className="flex items-center justify-between">
                  <span className="text-gray-300 truncate">{i + 1}. {link.title}</span>
                  <span className="text-gray-500">{link.click_count}</span>
                </div>
              ))}
              {data.topLinks.length === 0 && (
                <p className="text-gray-500 text-sm">No data yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Countries */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Globe className="h-5 w-5" /> Countries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topCountries.map((item) => (
                <div key={item.country} className="flex items-center justify-between">
                  <span className="text-gray-300">{item.country}</span>
                  <span className="text-gray-500">{item.count}</span>
                </div>
              ))}
              {data.topCountries.length === 0 && (
                <p className="text-gray-500 text-sm">No data yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Devices */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-lg">Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.devices.map((item) => {
                const Icon = deviceIcons[item.device] || Monitor
                return (
                  <div key={item.device} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-300 capitalize">{item.device}</span>
                    </div>
                    <span className="text-gray-500">{item.percentage}%</span>
                  </div>
                )
              })}
              {data.devices.length === 0 && (
                <p className="text-gray-500 text-sm">No data yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
