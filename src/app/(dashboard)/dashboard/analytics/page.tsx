import { AnalyticsCharts } from '@/components/dashboard/analytics-charts'

export default function AnalyticsPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-[24px] font-bold text-[#F5F5F7] mb-6">Analytics</h1>
      <AnalyticsCharts />
    </div>
  )
}
