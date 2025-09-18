'use client'

import { useMemo } from 'react'
import { Incident, SeverityLevel } from '@/types'

export function useMemoizedIncidentStats(incidents: Incident[]) {
  return useMemo(() => {
    if (!incidents || incidents.length === 0) {
      return {
        totalIncidents: 0,
        thisMonthCount: 0,
        lastMonthCount: 0,
        averagePerMonth: 0,
        mostCommonSeverity: null,
        longestStreak: 0,
        severityDistribution: {},
        monthlyTrends: []
      }
    }

    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    // Basic counts
    const totalIncidents = incidents.length
    const thisMonthCount = incidents.filter(i => 
      new Date(i.incident_date) >= thisMonth
    ).length
    const lastMonthCount = incidents.filter(i => {
      const date = new Date(i.incident_date)
      return date >= lastMonth && date <= lastMonthEnd
    }).length

    // Calculate average per month
    const oldestIncident = incidents[incidents.length - 1]
    const monthsSpan = oldestIncident 
      ? Math.max(1, Math.ceil((now.getTime() - new Date(oldestIncident.incident_date).getTime()) / (1000 * 60 * 60 * 24 * 30)))
      : 1
    const averagePerMonth = Math.round(totalIncidents / monthsSpan * 10) / 10

    // Severity distribution
    const severityCount = incidents.reduce((acc, incident) => {
      acc[incident.severity] = (acc[incident.severity] || 0) + 1
      return acc
    }, {} as Record<SeverityLevel, number>)

    const mostCommonSeverity = Object.entries(severityCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] as SeverityLevel

    // Calculate longest streak without incidents
    const sortedDates = incidents
      .map(i => new Date(i.incident_date))
      .sort((a, b) => a.getTime() - b.getTime())

    let longestStreak = 0
    let currentStreak = 0

    for (let i = 0; i < sortedDates.length - 1; i++) {
      const daysDiff = Math.floor(
        (sortedDates[i + 1].getTime() - sortedDates[i].getTime()) / (1000 * 60 * 60 * 24)
      )
      
      if (daysDiff > currentStreak) {
        currentStreak = daysDiff
        longestStreak = Math.max(longestStreak, currentStreak)
      }
    }

    // Monthly trends (last 6 months)
    const monthlyTrends = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      
      const monthIncidents = incidents.filter(incident => {
        const date = new Date(incident.incident_date)
        return date >= monthStart && date <= monthEnd
      })

      monthlyTrends.push({
        month: monthStart.toISOString().slice(0, 7), // YYYY-MM format
        incident_count: monthIncidents.length,
        avg_severity: monthIncidents.length > 0 
          ? monthIncidents.reduce((sum, i) => {
              const severityValues = { 'Mild': 1, 'Moderate': 2, 'Severe': 3 }
              return sum + severityValues[i.severity]
            }, 0) / monthIncidents.length
          : 0
      })
    }

    return {
      totalIncidents,
      thisMonthCount,
      lastMonthCount,
      averagePerMonth,
      mostCommonSeverity,
      longestStreak,
      severityDistribution: severityCount,
      monthlyTrends
    }
  }, [incidents])
}

export function useMemoizedTriggerAnalysis(incidents: Incident[]) {
  return useMemo(() => {
    if (!incidents || incidents.length === 0) {
      return {
        topFoods: [],
        topActivities: [],
        correlations: []
      }
    }

    // Analyze food triggers
    const foodCounts = incidents.reduce((acc, incident) => {
      incident.foods?.forEach(food => {
        acc[food] = (acc[food] || 0) + 1
      })
      return acc
    }, {} as Record<string, number>)

    const topFoods = Object.entries(foodCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([food, count]) => ({ food, count }))

    // Analyze activity triggers
    const activityCounts = incidents.reduce((acc, incident) => {
      incident.activities?.forEach(activity => {
        acc[activity] = (acc[activity] || 0) + 1
      })
      return acc
    }, {} as Record<string, number>)

    const topActivities = Object.entries(activityCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([activity, count]) => ({ activity, count }))

    // Simple correlation analysis
    const correlations = []
    
    // Food-severity correlations
    for (const [food, count] of Object.entries(foodCounts)) {
      if (count >= 2) { // Only analyze foods with multiple incidents
        const foodIncidents = incidents.filter(i => i.foods?.includes(food))
        const severeCount = foodIncidents.filter(i => i.severity === 'Severe').length
        const correlation = severeCount / count
        
        if (correlation > 0.5) { // High correlation with severe reactions
          correlations.push({
            trigger: food,
            type: 'food',
            correlation: correlation,
            incidents: count
          })
        }
      }
    }

    return {
      topFoods,
      topActivities,
      correlations: correlations.sort((a, b) => b.correlation - a.correlation)
    }
  }, [incidents])
}