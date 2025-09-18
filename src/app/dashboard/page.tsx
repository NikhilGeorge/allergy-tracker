'use client'

import Link from 'next/link'
import PageHeader from '@/components/layout/PageHeader'
import DashboardStats from '@/components/dashboard/DashboardStats'
import QuickSummary from '@/components/dashboard/QuickSummary'
import { 
  LazyIncidentChart, 
  LazySeverityChart, 
  LazyTriggerChart, 
  LazyTrendAnalysis 
} from '@/components/dashboard/LazyCharts'
import { ChartErrorBoundary } from '@/components/ui/ErrorBoundary'
import { useRecentIncidents } from '@/hooks/useIncidents'
import { formatDate } from '@/lib/utils'
import { SEVERITY_COLORS } from '@/types'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const { incidents: recentIncidents, isLoading: incidentsLoading } = useRecentIncidents()

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your allergy incidents and trends"
        actions={
          <Link
            href="/incidents/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Add Incident
          </Link>
        }
      />
      
      {/* Statistics Cards */}
      <div className="mb-8">
        <DashboardStats />
      </div>

      {/* Charts and Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Incidents Over Time */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Incidents Over Time</h3>
          <ChartErrorBoundary>
            <LazyIncidentChart height={300} />
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
            <LazyTriggerChart height={300} limit={8} />
          </ChartErrorBoundary>
        </div>

        {/* Quick Summary */}
        <QuickSummary />
      </div>

      {/* Trend Analysis and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Analysis */}
        <LazyTrendAnalysis />

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Recent Incidents</h3>
            <Link
              href="/incidents"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View all
            </Link>
          </div>
          
          {incidentsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-4 w-3/4 rounded mb-2"></div>
                  <div className="bg-gray-200 h-3 w-1/2 rounded"></div>
                </div>
              ))}
            </div>
          ) : recentIncidents.length > 0 ? (
            <div className="space-y-3">
              {recentIncidents.slice(0, 5).map((incident) => (
                <div key={incident.id} className="border-l-4 pl-4 py-2" style={{
                  borderLeftColor: SEVERITY_COLORS[incident.severity]
                }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {incident.symptoms.slice(0, 2).join(', ')}
                        {incident.symptoms.length > 2 && ` +${incident.symptoms.length - 2} more`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(incident.incident_date)} • {incident.severity}
                      </p>
                    </div>
                    <Link
                      href={`/incidents/${incident.id}`}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No incidents recorded yet</p>
              <Link
                href="/incidents/new"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Add Your First Incident
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}