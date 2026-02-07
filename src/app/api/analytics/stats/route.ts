import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getPlanLimits } from '@/lib/types/database'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user profile for plan limits
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_premium')
    .eq('id', user.id)
    .single()

  const limits = getPlanLimits(profile?.is_premium || false)
  const retentionDate = new Date()
  retentionDate.setDate(retentionDate.getDate() - limits.analyticsRetentionDays)

  // Get total views and clicks
  const { data: totals } = await supabase
    .from('analytics_events')
    .select('event_type')
    .eq('profile_id', user.id)
    .gte('created_at', retentionDate.toISOString())

  const totalViews = totals?.filter((e) => e.event_type === 'page_view').length || 0
  const totalClicks = totals?.filter((e) => e.event_type === 'link_click').length || 0

  // Get daily stats
  const { data: dailyEvents } = await supabase
    .from('analytics_events')
    .select('event_type, created_at')
    .eq('profile_id', user.id)
    .gte('created_at', retentionDate.toISOString())
    .order('created_at')

  // Group by day
  const dailyStats: Record<string, { views: number; clicks: number }> = {}
  dailyEvents?.forEach((event) => {
    const date = event.created_at.split('T')[0]
    if (!dailyStats[date]) {
      dailyStats[date] = { views: 0, clicks: 0 }
    }
    if (event.event_type === 'page_view') {
      dailyStats[date].views++
    } else if (event.event_type === 'link_click') {
      dailyStats[date].clicks++
    }
  })

  const chartData = Object.entries(dailyStats).map(([date, stats]) => ({
    date,
    views: stats.views,
    clicks: stats.clicks,
  }))

  // Get top countries
  const { data: countryData } = await supabase
    .from('analytics_events')
    .select('country')
    .eq('profile_id', user.id)
    .eq('event_type', 'page_view')
    .gte('created_at', retentionDate.toISOString())

  const countryCounts: Record<string, number> = {}
  countryData?.forEach((e) => {
    const country = e.country || 'unknown'
    countryCounts[country] = (countryCounts[country] || 0) + 1
  })

  const topCountries = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([country, count]) => ({ country, count }))

  // Get device breakdown
  const { data: deviceData } = await supabase
    .from('analytics_events')
    .select('device_type')
    .eq('profile_id', user.id)
    .eq('event_type', 'page_view')
    .gte('created_at', retentionDate.toISOString())

  const deviceCounts: Record<string, number> = {}
  deviceData?.forEach((e) => {
    const device = e.device_type || 'unknown'
    deviceCounts[device] = (deviceCounts[device] || 0) + 1
  })

  const devices = Object.entries(deviceCounts).map(([device, count]) => ({
    device,
    count,
    percentage: Math.round((count / (deviceData?.length || 1)) * 100),
  }))

  // Get top links
  const { data: links } = await supabase
    .from('links')
    .select('id, title, click_count')
    .eq('profile_id', user.id)
    .order('click_count', { ascending: false })
    .limit(5)

  // Get agent visit stats
  const { data: agentData } = await supabase
    .from('agent_visits')
    .select('agent_identifier, agent_name, created_at')
    .eq('profile_id', user.id)
    .gte('created_at', retentionDate.toISOString())
    .order('created_at')

  const totalAgentVisits = agentData?.length || 0

  // Agent breakdown by type
  const agentCounts: Record<string, { name: string; count: number }> = {}
  agentData?.forEach((visit) => {
    const key = visit.agent_identifier
    if (!agentCounts[key]) {
      agentCounts[key] = { name: visit.agent_name || key, count: 0 }
    }
    agentCounts[key].count++
  })

  const agentBreakdown = Object.entries(agentCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([identifier, data]) => ({
      agent: data.name,
      identifier,
      count: data.count,
    }))

  // Agent timeline (daily)
  const agentDailyStats: Record<string, number> = {}
  agentData?.forEach((visit) => {
    const date = visit.created_at.split('T')[0]
    agentDailyStats[date] = (agentDailyStats[date] || 0) + 1
  })

  const agentTimeline = Object.entries(agentDailyStats).map(([date, count]) => ({
    date,
    agent_visits: count,
  }))

  return NextResponse.json({
    totalViews,
    totalClicks,
    ctr: totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0',
    chartData,
    topCountries,
    devices,
    topLinks: links || [],
    retentionDays: limits.analyticsRetentionDays,
    // Agent analytics
    agentVisits: totalAgentVisits,
    agentBreakdown,
    agentTimeline,
  })
}
