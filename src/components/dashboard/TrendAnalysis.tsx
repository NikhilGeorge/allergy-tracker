'use client'

import { useMemo } from 'react'
import { useMonthlyTrends } from '@/hooks/useAnalytics'
import { useIncidents } from '@/hooks/useIncidents'
import { SEVERITY_COLORS } from '@/types'

export default function TrendAnalysis() {
  const { trends, isLoading: trendsLoading } = useMonthlyTrends(6)
  const { incidents, isLoading: incidentsLoading } = useIncidents({ 
    page: 1, 
    limit: 1000 
  })

  const isLoading = trendsLoading || incidentsLoading

  const analysis = useMemo(() => {
    if (!trends || !incidents || trends.length === 0 || incidents.length === 0) {
      return null
    }

    // Sort trends by month
    const sortedTrends = [...trends].sort((a, b) => a.month.localeCompare(b.month))
    
    // Calculate trend direction
    const recentTrends = sortedTrends.slice(-3) // Last 3 months
    const isImproving = recentTrends.length >= 2 && 
      recentTrends[recentTrends.length - 1].incident_count < recentTrends[0].incident_count

    // Find most problematic time patterns
    const timePatterns = incidents.reduce((acc, incident) => {
      const date = new Date(incident.incident_date)
      const hour = date.getHours()
      const dayOfWeek = date.getDay()
      const month = date.getMonth()

      // Hour patterns
      const hourRange = hour < 6 ? 'Early Morning (12-6 AM)' :
                       hour < 12 ? 'Morning (6 AM-12 PM)' :
                       hour < 18 ? 'Afternoon (12-6 PM)' :
                       'Evening (6 PM-12 AM)'
      
      acc.hours[hourRange] = (acc.hours[hourRange] || 0) + 1

      // Day patterns
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      acc.days[dayNames[dayOfWeek]] = (acc.days[dayNames[dayOfWeek]] || 0) + 1

      // Month patterns
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      acc.months[monthNames[month]] = (acc.months[monthNames[month]] || 0) + 1

      return acc
    }, { hours: {} as Record<string, number>, days: {} as Record<string, number>, months: {} as Record<string, number> })

    // Find peak times
    const peakHour = Object.entries(timePatterns.hours).sort(([,a], [,b]) => b - a)[0]
    const peakDay = Object.entries(timePatterns.days).sort(([,a], [,b]) => b - a)[0]
    const peakMonth = Object.entries(timePatterns.months).sort(([,a], [,b]) => b - a)[0]

    // Analyze severity trends
    const severityTrends = sortedTrends.map(trend => ({
      month: trend.month,
      severityScore: (
        (trend.severity_breakdown.Mild || 0) * 1 +
        (trend.severity_breakdown.Moderate || 0) * 2 +
        (trend.severity_breakdown.Severe || 0) * 3
      ) / trend.incident_count
    })).filter(t => !isNaN(t.severityScore))

    const severityImproving = severityTrends.length >= 2 &&
      severityTrends[severityTrends.length - 1].severityScore < severityTrends[0].severityScore

    // Find common trigger combinations
    const triggerCombinations = incidents.reduce((acc, incident) => {
      const foods = incident.foods || []
      const activities = incident.activities || []
      
      // Look for food + activity combinations
      foods.forEach(food => {
        activities.forEach(activity => {
          const combo = `${food} + ${activity}`
          acc[combo] = (acc[combo] || 0) + 1
        })
      })

      return acc
    }, {} as Record<string, number>)

    const topCombination = Object.entries(triggerCombinations)
      .sort(([,a], [,b]) => b - a)[0]

    return {
      isImproving,
      severityImproving,
      peakHour,
      peakDay,
      peakMonth,
      topCombination,
      recentTrends,
      totalIncidents: incidents.length
    }
  }, [trends, incidents])

  if (isLoading) {
    return (
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
    )
  }

  if (!analysis) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Trend Analysis</h3>
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Not enough data</h3>
          <p className="mt-1 text-sm text-gray-500">
            Record more incidents to see trend analysis
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Trend Analysis & Insights</h3>
      
      <div className="space-y-6">
        {/* Overall Trend */}
        <div className="flex items-start space-x-3">
          <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
            analysis.isImproving ? 'bg-green-500' : 'bg-yellow-500'
          }`}></div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">Overall Trend</h4>
            <p className="text-sm text-gray-600 mt-1">
              {analysis.isImproving 
                ? 'Your incident frequency is decreasing over the last 3 months. Keep up the good work!'
                : 'Your incident frequency has been stable or increasing. Consider reviewing your triggers and management strategies.'
              }
            </p>
          </div>
        </div>

        {/* Severity Trend */}
        <div className="flex items-start space-x-3">
          <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
            analysis.severityImproving ? 'bg-green-500' : 'bg-orange-500'
          }`}></div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">Severity Trend</h4>
            <p className="text-sm text-gray-600 mt-1">
              {analysis.severityImproving 
                ? 'The severity of your incidents is decreasing over time.'
                : 'Monitor your incident severity - consider discussing management strategies with your healthcare provider.'
              }
            </p>
          </div>
        </div>

        {/* Time Patterns */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Peak Times</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analysis.peakHour && (
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-xs font-medium text-blue-800 uppercase tracking-wide">
                  Time of Day
                </div>
                <div className="text-sm font-semibold text-blue-900 mt-1">
                  {analysis.peakHour[0]}
                </div>
                <div className="text-xs text-blue-700">
                  {analysis.peakHour[1]} incidents
                </div>
              </div>
            )}
            
            {analysis.peakDay && (
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-xs font-medium text-green-800 uppercase tracking-wide">
                  Day of Week
                </div>
                <div className="text-sm font-semibold text-green-900 mt-1">
                  {analysis.peakDay[0]}
                </div>
                <div className="text-xs text-green-700">
                  {analysis.peakDay[1]} incidents
                </div>
              </div>
            )}
            
            {analysis.peakMonth && (
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="text-xs font-medium text-purple-800 uppercase tracking-wide">
                  Month
                </div>
                <div className="text-sm font-semibold text-purple-900 mt-1">
                  {analysis.peakMonth[0]}
                </div>
                <div className="text-xs text-purple-700">
                  {analysis.peakMonth[1]} incidents
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Trigger Combinations */}
        {analysis.topCombination && analysis.topCombination[1] > 1 && (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2 bg-red-500"></div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">Common Trigger Combination</h4>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium">{analysis.topCombination[0]}</span> appears together in{' '}
                <span className="font-medium">{analysis.topCombination[1]} incidents</span>.
                Consider avoiding this combination or taking preventive measures.
              </p>
            </div>
          </div>
        )}

        {/* Recent Progress */}
        {analysis.recentTrends.length >= 2 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Progress</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between text-sm">
                {analysis.recentTrends.map((trend, index) => (
                  <div key={trend.month} className="text-center">
                    <div className="text-gray-500 text-xs">
                      {new Date(trend.month + '-01').toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                    <div className="font-semibold text-gray-900 mt-1">
                      {trend.incident_count}
                    </div>
                    {index < analysis.recentTrends.length - 1 && (
                      <div className="text-xs text-gray-400 mt-1">
                        {trend.incident_count > analysis.recentTrends[index + 1].incident_count ? '↓' : 
                         trend.incident_count < analysis.recentTrends[index + 1].incident_count ? '↑' : '→'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Recommendations</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            {analysis.peakHour && (
              <li>• Be extra cautious during {analysis.peakHour[0].toLowerCase()}</li>
            )}
            {analysis.peakDay && (
              <li>• Consider your {analysis.peakDay[0]} routine - what's different on this day?</li>
            )}
            {analysis.topCombination && analysis.topCombination[1] > 1 && (
              <li>• Avoid or prepare for the combination: {analysis.topCombination[0]}</li>
            )}
            {!analysis.isImproving && (
              <li>• Consider keeping a more detailed diary to identify new patterns</li>
            )}
            <li>• Share these insights with your healthcare provider</li>
          </ul>
        </div>
      </div>
    </div>
  )
}