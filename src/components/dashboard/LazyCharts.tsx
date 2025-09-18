'use client'

import dynamic from 'next/dynamic'
import { ChartLoading } from '@/components/ui/LoadingSpinner'

// Lazy load chart components with loading fallbacks
export const LazyIncidentChart = dynamic(
  () => import('./IncidentChart'),
  {
    loading: () => <ChartLoading />,
    ssr: false
  }
)

export const LazySeverityChart = dynamic(
  () => import('./SeverityChart'),
  {
    loading: () => <ChartLoading />,
    ssr: false
  }
)

export const LazyTriggerChart = dynamic(
  () => import('./TriggerChart'),
  {
    loading: () => <ChartLoading />,
    ssr: false
  }
)

export const LazyTrendAnalysis = dynamic(
  () => import('./TrendAnalysis'),
  {
    loading: () => (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="bg-gray-200 h-6 w-32 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-4 w-full rounded"></div>
            ))}
          </div>
        </div>
      </div>
    ),
    ssr: false
  }
)