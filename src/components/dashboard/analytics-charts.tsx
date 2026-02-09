'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  Eye, MousePointer, TrendingUp, Globe,
  Smartphone, Monitor, Tablet, Bot,
} from 'lucide-react'

interface AnalyticsData {
  totalViews: number
  totalClicks: number
  ctr: string
  chartData: { date: string; views: number; clicks: number }[]
  topCountries: { country: string; count: number }[]
  devices: { device: string; count: number; percentage: number }[]
  topLinks: { id: string; title: string; click_count: number }[]
  retentionDays: number
  // Agent analytics
  agentVisits?: number
  agentBreakdown?: { agent: string; identifier: string; count: number }[]
  agentTimeline?: { date: string; agent_visits: number }[]
}

const deviceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  mobile: Smartphone,
  desktop: Monitor,
  tablet: Tablet,
}

const AGENT_COLORS: Record<string, string> = {
  claude: '#d97706',
  chatgpt: '#10b981',
  perplexity: '#6366f1',
  'google-ai': '#3b82f6',
  'bing-ai': '#06b6d4',
  'meta-ai': '#8b5cf6',
  'generic-bot': '#6b7280',
}

const tooltipStyle = {
  backgroundColor: 'var(--lh-surface-3)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '10px',
  boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
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
    return <div className="text-[#6E6E73] text-[14px]">Loading analytics...</div>
  }

  if (!data) {
    return <div className="text-[#6E6E73] text-[14px]">Failed to load analytics</div>
  }

  const hasAgentData = (data.agentVisits || 0) > 0

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className={`grid gap-4 ${hasAgentData ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-3'}`}>
        <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.06)]">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-[10px] bg-[rgba(0,113,227,0.1)]">
                <Eye className="h-[18px] w-[18px] text-[#0071E3]" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.08em] text-[#6E6E73]">Page Views</p>
                <p className="text-[22px] font-bold text-[#F5F5F7] leading-tight tabular-nums">{data.totalViews.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.06)]">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-[10px] bg-[rgba(48,209,88,0.1)]">
                <MousePointer className="h-[18px] w-[18px] text-[#30D158]" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.08em] text-[#6E6E73]">Link Clicks</p>
                <p className="text-[22px] font-bold text-[#F5F5F7] leading-tight tabular-nums">{data.totalClicks.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.06)]">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-[10px] bg-[rgba(255,214,10,0.1)]">
                <TrendingUp className="h-[18px] w-[18px] text-[#FFD60A]" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.08em] text-[#6E6E73]">CTR</p>
                <p className="text-[22px] font-bold text-[#F5F5F7] leading-tight tabular-nums">{data.ctr}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {hasAgentData && (
          <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.06)]">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-[10px] bg-[rgba(10,132,255,0.1)]">
                  <Bot className="h-[18px] w-[18px] text-[#0A84FF]" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.08em] text-[#6E6E73]">Agent Visits</p>
                  <p className="text-[22px] font-bold text-[#F5F5F7] leading-tight tabular-nums">{(data.agentVisits || 0).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Traffic Chart */}
      <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.06)]">
        <CardHeader>
          <CardTitle className="text-[#F5F5F7] text-[15px]">Traffic Overview ({data.retentionDays} days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chartData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0071E3" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0071E3" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#30D158" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#30D158" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#48484A" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#48484A" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#0071E3"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorViews)"
                  name="Views"
                />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  stroke="#30D158"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorClicks)"
                  name="Clicks"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Agent Analytics Section */}
      {hasAgentData && (
        <>
          <div className="flex items-center gap-2 pt-2">
            <Bot className="h-5 w-5 text-[#0A84FF]" />
            <h2 className="text-[15px] font-semibold text-[#F5F5F7]">AI Agent Activity</h2>
            <span className="text-[10px] text-[#0A84FF] bg-[rgba(10,132,255,0.1)] px-2 py-0.5 rounded-full font-medium uppercase tracking-[0.04em]">New</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Agent Breakdown */}
            <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.06)]">
              <CardHeader>
                <CardTitle className="text-[#F5F5F7] text-[15px] flex items-center gap-2">
                  <Bot className="h-4 w-4 text-[#0A84FF]" /> Agents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.agentBreakdown?.map((item) => (
                    <div key={item.identifier} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: AGENT_COLORS[item.identifier] || '#6b7280' }}
                        />
                        <span className="text-[13px] text-[#F5F5F7]">{item.agent}</span>
                      </div>
                      <span className="text-[13px] text-[#6E6E73] tabular-nums">{item.count}</span>
                    </div>
                  ))}
                  {(!data.agentBreakdown || data.agentBreakdown.length === 0) && (
                    <p className="text-[#6E6E73] text-[13px]">No agent visits yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Agent Timeline */}
            <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.06)]">
              <CardHeader>
                <CardTitle className="text-[#F5F5F7] text-[15px]">Agent Visits Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  {data.agentTimeline && data.agentTimeline.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.agentTimeline}>
                        <XAxis dataKey="date" stroke="#48484A" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#48484A" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar
                          dataKey="agent_visits"
                          fill="#0A84FF"
                          radius={[4, 4, 0, 0]}
                          name="Agent Visits"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-[#6E6E73] text-[13px]">
                      No timeline data yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Top Links */}
        <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.06)]">
          <CardHeader>
            <CardTitle className="text-[#F5F5F7] text-[15px]">Top Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topLinks.map((link, i) => (
                <div key={link.id} className="flex items-center justify-between">
                  <span className="text-[13px] text-[#F5F5F7] truncate">{i + 1}. {link.title}</span>
                  <span className="text-[13px] text-[#6E6E73] tabular-nums">{link.click_count}</span>
                </div>
              ))}
              {data.topLinks.length === 0 && (
                <p className="text-[#6E6E73] text-[13px]">No data yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Countries */}
        <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.06)]">
          <CardHeader>
            <CardTitle className="text-[#F5F5F7] text-[15px] flex items-center gap-2">
              <Globe className="h-4 w-4 text-[#86868B]" /> Countries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topCountries.map((item) => (
                <div key={item.country} className="flex items-center justify-between">
                  <span className="text-[13px] text-[#F5F5F7]">{item.country}</span>
                  <span className="text-[13px] text-[#6E6E73] tabular-nums">{item.count}</span>
                </div>
              ))}
              {data.topCountries.length === 0 && (
                <p className="text-[#6E6E73] text-[13px]">No data yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Devices */}
        <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.06)]">
          <CardHeader>
            <CardTitle className="text-[#F5F5F7] text-[15px]">Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.devices.map((item) => {
                const Icon = deviceIcons[item.device] || Monitor
                return (
                  <div key={item.device} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-[#86868B]" />
                      <span className="text-[13px] text-[#F5F5F7] capitalize">{item.device}</span>
                    </div>
                    <span className="text-[13px] text-[#6E6E73] tabular-nums">{item.percentage}%</span>
                  </div>
                )
              })}
              {data.devices.length === 0 && (
                <p className="text-[#6E6E73] text-[13px]">No data yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
