'use client'

import PageHeader from '@/components/layout/PageHeader'
import { 
  LazyIncidentChart, 
  LazySeverityChart, 
  LazyTriggerChart, 
  LazyTrendAnalysis 
} from '@/components/dashboard/LazyCharts'
import { ChartErrorBoundary } from '@/components/ui/ErrorBoundary'
import SeasonalChart from '@/components/analytics/SeasonalChart'

export default function AnalyticsPage() {
  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Analyze your allergy patterns and trends"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Incidents Over Time */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Incidents Over Time</h3>
          <ChartErrorBoundary>
            <LazyIncidentChart height={300} monthsBack={12} />
          </ChartErrorBoundary>
        </div>
        
        {/* Severity Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Severity Distribution</h3>
          <ChartErrorBoundary>
            <LazySeverityChart height={300} />
          </ChartErrorBoundary>
        </div>
        
        {/* Common Triggers */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Most Common Triggers</h3>
          <ChartErrorBoundary>
            <LazyTriggerChart height={300} limit={10} />
          </ChartErrorBoundary>
        </div>
        
        {/* Seasonal Patterns */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Seasonal Patterns</h3>
          <ChartErrorBoundary>
            <SeasonalChart height={300} />
          </ChartErrorBoundary>
        </div>
      </div>

      {/* Trend Analysis - Full Width */}
      <div className="mb-8">
        <LazyTrendAnalysis />
      </div>
    </div>
  )
}