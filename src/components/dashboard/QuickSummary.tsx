'use client'

import { useIncidentStats } from '@/hooks/useAnalytics'
import { useRecentIncidents } from '@/hooks/useIncidents'
import { formatDate } from '@/lib/utils'
import { SEVERITY_COLORS } from '@/types'

export default function QuickSummary() {
  const { stats, isLoading: statsLoading } = useIncidentStats()
  const { incidents: recentIncidents, isLoading: incidentsLoading } = useRecentIncidents()

  const isLoading = statsLoading || incidentsLoading
  const lastIncident = recentIncidents[0]

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="bg-gray-200 h-6 w-32 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="bg-gray-200 h-4 w-24 rounded"></div>
                <div className="bg-gray-200 h-4 w-16 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Summary</h3>
      
      <div className="space-y-4">
        {/* Total incidents */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total incidents</span>
          <span className="font-medium text-gray-900">
            {stats?.total_incidents || 0}
          </span>
        </div>

        {/* This month */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">This month</span>
          <span className="font-medium text-gray-900">
            {stats?.this_month_count || 0}
          </span>
        </div>

        {/* Last month comparison */}
        {stats && stats.last_month_count > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Last month</span>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">
                {stats.last_month_count}
              </span>
              {stats.this_month_count !== stats.last_month_count && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  stats.this_month_count < stats.last_month_count
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {stats.this_month_count < stats.last_month_count ? '↓' : '↑'}
                  {Math.abs(stats.this_month_count - stats.last_month_count)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Average per month */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Average per month</span>
          <span className="font-medium text-gray-900">
            {stats?.average_per_month || 0}
          </span>
        </div>

        {/* Current streak */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Days since last</span>
          <span className="font-medium text-gray-900">
            {stats?.current_streak_days || 0} days
          </span>
        </div>

        {/* Most common severity */}
        {stats?.most_common_severity && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Most common severity</span>
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: SEVERITY_COLORS[stats.most_common_severity] }}
              />
              <span className="font-medium text-gray-900">
                {stats.most_common_severity}
              </span>
            </div>
          </div>
        )}

        {/* Last incident */}
        {lastIncident && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between items-start">
              <span className="text-sm text-gray-600">Last incident</span>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {formatDate(lastIncident.incident_date)}
                </div>
                <div className="flex items-center justify-end space-x-1 mt-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: SEVERITY_COLORS[lastIncident.severity] }}
                  />
                  <span className="text-xs text-gray-500">
                    {lastIncident.severity}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Health status indicator */}
        {stats && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Health trend</span>
              <div className="flex items-center space-x-2">
                {stats.current_streak_days > 14 ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium text-green-700">Excellent</span>
                  </>
                ) : stats.current_streak_days > 7 ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium text-blue-700">Good</span>
                  </>
                ) : stats.this_month_count < stats.last_month_count ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <span className="text-sm font-medium text-yellow-700">Improving</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span className="text-sm font-medium text-orange-700">Monitor</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}