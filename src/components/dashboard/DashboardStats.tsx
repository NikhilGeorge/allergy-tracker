'use client'

import StatCard from './StatCard'
import { useIncidentStats } from '@/hooks/useAnalytics'
import { SEVERITY_COLORS } from '@/types'

export default function DashboardStats() {
  const { stats, isLoading, error } = useIncidentStats()

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error loading statistics
            </h3>
            <p className="mt-1 text-sm text-red-700">{error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  // Calculate trend for this month vs last month
  const monthlyTrend = stats && stats.last_month_count > 0 
    ? {
        value: stats.this_month_count - stats.last_month_count,
        label: 'vs last month',
        isPositive: stats.this_month_count <= stats.last_month_count // Lower incidents is positive
      }
    : undefined

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Incidents */}
      <StatCard
        title="Total Incidents"
        value={stats?.total_incidents || 0}
        subtitle="All time"
        color="blue"
        isLoading={isLoading}
        icon={
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        }
      />

      {/* This Month */}
      <StatCard
        title="This Month"
        value={stats?.this_month_count || 0}
        subtitle="Current month incidents"
        color="green"
        trend={monthlyTrend}
        isLoading={isLoading}
        icon={
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        }
      />

      {/* Most Common Severity */}
      <StatCard
        title="Most Common Severity"
        value={stats?.most_common_severity || 'None'}
        subtitle="Predominant severity level"
        color="yellow"
        isLoading={isLoading}
        icon={
          <div 
            className="w-6 h-6 rounded-full"
            style={{ 
              backgroundColor: stats?.most_common_severity 
                ? SEVERITY_COLORS[stats.most_common_severity] 
                : '#6B7280' 
            }}
          />
        }
      />

      {/* Current Streak */}
      <StatCard
        title="Days Since Last Incident"
        value={stats?.current_streak_days || 0}
        subtitle={`Longest streak: ${stats?.longest_streak_days || 0} days`}
        color="purple"
        isLoading={isLoading}
        icon={
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        }
      />

      {/* Average Per Month */}
      <StatCard
        title="Average Per Month"
        value={stats?.average_per_month || 0}
        subtitle="Historical average"
        color="gray"
        isLoading={isLoading}
        icon={
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        }
      />

      {/* Improvement Indicator */}
      {stats && stats.last_month_count > 0 && (
        <StatCard
          title="Monthly Change"
          value={`${stats.this_month_count - stats.last_month_count > 0 ? '+' : ''}${stats.this_month_count - stats.last_month_count}`}
          subtitle="Change from last month"
          color={stats.this_month_count <= stats.last_month_count ? 'green' : 'red'}
          isLoading={isLoading}
          icon={
            stats.this_month_count <= stats.last_month_count ? (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            ) : (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            )
          }
        />
      )}

      {/* Severity Breakdown */}
      {stats && stats.total_incidents > 0 && (
        <StatCard
          title="Severity Breakdown"
          value="View Details"
          subtitle="Click to see severity distribution"
          color="blue"
          isLoading={isLoading}
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          }
        />
      )}

      {/* Quick Insights */}
      {stats && stats.total_incidents > 0 && (
        <StatCard
          title="Health Insights"
          value={
            stats.current_streak_days > 7 
              ? "Great Progress!" 
              : stats.this_month_count < stats.last_month_count 
                ? "Improving" 
                : "Monitor Closely"
          }
          subtitle={
            stats.current_streak_days > 7 
              ? "Keep up the good work" 
              : stats.this_month_count < stats.last_month_count 
                ? "Fewer incidents this month" 
                : "Consider reviewing triggers"
          }
          color={
            stats.current_streak_days > 7 
              ? "green" 
              : stats.this_month_count < stats.last_month_count 
                ? "blue" 
                : "yellow"
          }
          isLoading={isLoading}
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          }
        />
      )}
    </div>
  )
}