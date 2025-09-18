import { supabase } from '@/lib/supabase'
import { getUserId } from '@/lib/auth'
import { isDemoMode, getDemoIncidents } from '@/lib/demo-data'
import type { 
  IncidentStats,
  MonthlyTrend,
  TriggerFrequency,
  SymptomFrequency,
  DashboardData
} from '@/types'

export class AnalyticsService {
  /**
   * Get user incident statistics
   */
  static async getIncidentStats(): Promise<IncidentStats> {
    // Demo mode support
    if (isDemoMode()) {
      return this.calculateDemoStats()
    }

    if (!supabase) {
      throw new Error('Supabase not configured')
    }

    const userId = await getUserId()
    if (!userId) {
      throw new Error('User not authenticated')
    }

    try {
      const { data, error } = await supabase.rpc('get_user_incident_stats', {
        user_uuid: userId
      })

      if (error) {
        console.error('Error fetching incident stats:', error)
        throw new Error(`Failed to fetch stats: ${error.message}`)
      }

      return data || {
        total_incidents: 0,
        average_per_month: 0,
        most_common_severity: 'Mild',
        longest_streak_days: 0,
        current_streak_days: 0,
        this_month_count: 0,
        last_month_count: 0
      }
    } catch (error) {
      console.error('Analytics service error:', error)
      // Fallback to manual calculation if RPC fails
      return await this.calculateStatsManually(userId)
    }
  }

  /**
   * Get monthly trends
   */
  static async getMonthlyTrends(monthsBack = 12): Promise<MonthlyTrend[]> {
    // Demo mode support
    if (isDemoMode()) {
      return this.calculateDemoTrends(monthsBack)
    }

    if (!supabase) {
      throw new Error('Supabase not configured')
    }

    const userId = await getUserId()
    if (!userId) {
      throw new Error('User not authenticated')
    }

    try {
      const { data, error } = await supabase.rpc('get_monthly_trends', {
        user_uuid: userId,
        months_back: monthsBack
      })

      if (error) {
        console.error('Error fetching monthly trends:', error)
        throw new Error(`Failed to fetch trends: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Analytics service error:', error)
      return await this.calculateTrendsManually(userId, monthsBack)
    }
  }

  /**
   * Get trigger frequency analysis
   */
  static async getTriggerFrequency(limit = 10): Promise<TriggerFrequency[]> {
    // Demo mode support
    if (isDemoMode()) {
      return this.calculateDemoTriggers(limit)
    }

    if (!supabase) {
      throw new Error('Supabase not configured')
    }

    const userId = await getUserId()
    if (!userId) {
      throw new Error('User not authenticated')
    }

    try {
      const { data, error } = await supabase.rpc('get_trigger_frequency', {
        user_uuid: userId,
        limit_count: limit
      })

      if (error) {
        console.error('Error fetching trigger frequency:', error)
        throw new Error(`Failed to fetch triggers: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Analytics service error:', error)
      return await this.calculateTriggersManually(userId, limit)
    }
  }

  /**
   * Get symptom frequency analysis
   */
  static async getSymptomFrequency(): Promise<SymptomFrequency[]> {
    // Demo mode support
    if (isDemoMode()) {
      return this.calculateDemoSymptoms()
    }

    if (!supabase) {
      throw new Error('Supabase not configured')
    }

    const userId = await getUserId()
    if (!userId) {
      throw new Error('User not authenticated')
    }

    try {
      const { data, error } = await supabase.rpc('get_symptom_frequency', {
        user_uuid: userId
      })

      if (error) {
        console.error('Error fetching symptom frequency:', error)
        throw new Error(`Failed to fetch symptoms: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Analytics service error:', error)
      return await this.calculateSymptomsManually(userId)
    }
  }

  /**
   * Get complete dashboard data
   */
  static async getDashboardData(): Promise<DashboardData> {
    const [stats, trends, triggers, symptoms] = await Promise.all([
      this.getIncidentStats(),
      this.getMonthlyTrends(12),
      this.getTriggerFrequency(10),
      this.getSymptomFrequency()
    ])

    return {
      stats,
      monthly_trends: trends,
      seasonal_patterns: [], // Will be calculated from trends
      top_triggers: triggers,
      symptom_frequency: symptoms,
      correlations: {
        trigger_combinations: [],
        time_patterns: {
          hour_of_day: {},
          day_of_week: {},
          month_of_year: {}
        }
      }
    }
  }

  /**
   * Fallback manual calculation for stats
   */
  private static async calculateStatsManually(userId: string): Promise<IncidentStats> {
    const { data: incidents, error } = await supabase!
      .from('incidents')
      .select('*')
      .eq('user_id', userId)

    if (error || !incidents) {
      return {
        total_incidents: 0,
        average_per_month: 0,
        most_common_severity: 'Mild',
        longest_streak_days: 0,
        current_streak_days: 0,
        this_month_count: 0,
        last_month_count: 0
      }
    }

    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    const thisMonthIncidents = incidents.filter(i => {
      const date = new Date(i.incident_date)
      return date >= thisMonth && date < nextMonth
    })

    const lastMonthIncidents = incidents.filter(i => {
      const date = new Date(i.incident_date)
      return date >= lastMonth && date < thisMonth
    })

    // Calculate most common severity
    const severityCounts = incidents.reduce((acc, incident) => {
      acc[incident.severity] = (acc[incident.severity] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const mostCommonSeverity = Object.entries(severityCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Mild'

    // Calculate average per month
    const uniqueMonths = new Set(
      incidents.map(i => new Date(i.incident_date).toISOString().slice(0, 7))
    ).size
    const averagePerMonth = uniqueMonths > 0 ? incidents.length / uniqueMonths : 0

    return {
      total_incidents: incidents.length,
      average_per_month: Math.round(averagePerMonth * 100) / 100,
      most_common_severity: mostCommonSeverity as any,
      longest_streak_days: 0, // Simplified for now
      current_streak_days: 0, // Simplified for now
      this_month_count: thisMonthIncidents.length,
      last_month_count: lastMonthIncidents.length
    }
  }

  /**
   * Fallback manual calculation for trends
   */
  private static async calculateTrendsManually(userId: string, monthsBack: number): Promise<MonthlyTrend[]> {
    const { data: incidents, error } = await supabase!
      .from('incidents')
      .select('*')
      .eq('user_id', userId)
      .gte('incident_date', new Date(Date.now() - monthsBack * 30 * 24 * 60 * 60 * 1000).toISOString())

    if (error || !incidents) {
      return []
    }

    const monthlyData = incidents.reduce((acc, incident) => {
      const month = new Date(incident.incident_date).toISOString().slice(0, 7)
      if (!acc[month]) {
        acc[month] = {
          month,
          incident_count: 0,
          severity_breakdown: { Mild: 0, Moderate: 0, Severe: 0 },
          avg_duration_minutes: 0,
          durations: []
        }
      }
      acc[month].incident_count++
      acc[month].severity_breakdown[incident.severity as keyof typeof acc[typeof month]['severity_breakdown']]++
      if (incident.duration_minutes) {
        acc[month].durations.push(incident.duration_minutes)
      }
      return acc
    }, {} as Record<string, any>)

    return Object.values(monthlyData).map((data: any) => ({
      month: data.month,
      incident_count: data.incident_count,
      severity_breakdown: data.severity_breakdown,
      avg_duration_minutes: data.durations.length > 0 
        ? Math.round(data.durations.reduce((a: number, b: number) => a + b, 0) / data.durations.length)
        : 0
    }))
  }

  /**
   * Fallback manual calculation for triggers
   */
  private static async calculateTriggersManually(userId: string, limit: number): Promise<TriggerFrequency[]> {
    const { data: incidents, error } = await supabase!
      .from('incidents')
      .select('foods, activities')
      .eq('user_id', userId)

    if (error || !incidents) {
      return []
    }

    const triggerCounts: Record<string, { count: number; category: string }> = {}
    let totalIncidents = incidents.length

    incidents.forEach(incident => {
      // Count foods
      if (incident.foods) {
        incident.foods.forEach((food: string) => {
          if (!triggerCounts[food]) {
            triggerCounts[food] = { count: 0, category: 'food' }
          }
          triggerCounts[food].count++
        })
      }

      // Count activities
      if (incident.activities) {
        incident.activities.forEach((activity: string) => {
          if (!triggerCounts[activity]) {
            triggerCounts[activity] = { count: 0, category: 'activity' }
          }
          triggerCounts[activity].count++
        })
      }
    })

    return Object.entries(triggerCounts)
      .map(([trigger, data]) => ({
        trigger,
        count: data.count,
        percentage: Math.round((data.count / totalIncidents) * 100 * 10) / 10,
        category: data.category as 'food' | 'activity'
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }

  /**
   * Fallback manual calculation for symptoms
   */
  private static async calculateSymptomsManually(userId: string): Promise<SymptomFrequency[]> {
    const { data: incidents, error } = await supabase!
      .from('incidents')
      .select('symptoms, severity')
      .eq('user_id', userId)

    if (error || !incidents) {
      return []
    }

    const symptomData: Record<string, { count: number; severities: Record<string, number> }> = {}
    let totalIncidents = incidents.length

    incidents.forEach(incident => {
      if (incident.symptoms) {
        incident.symptoms.forEach((symptom: string) => {
          if (!symptomData[symptom]) {
            symptomData[symptom] = { 
              count: 0, 
              severities: { Mild: 0, Moderate: 0, Severe: 0 }
            }
          }
          symptomData[symptom].count++
          symptomData[symptom].severities[incident.severity]++
        })
      }
    })

    return Object.entries(symptomData)
      .map(([symptom, data]) => ({
        symptom,
        count: data.count,
        percentage: Math.round((data.count / totalIncidents) * 100 * 10) / 10,
        severity_distribution: data.severities as Record<'Mild' | 'Moderate' | 'Severe', number>
      }))
      .sort((a, b) => b.count - a.count)
  }

  /**
   * Calculate demo statistics from sample data
   */
  private static calculateDemoStats(): IncidentStats {
    const { data: incidents } = getDemoIncidents(1, 1000) // Get all demo incidents
    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    const thisMonthCount = incidents.filter(i => 
      new Date(i.incident_date) >= thisMonth
    ).length

    const lastMonthCount = incidents.filter(i => {
      const date = new Date(i.incident_date)
      return date >= lastMonth && date <= lastMonthEnd
    }).length

    // Calculate most common severity
    const severityCounts = incidents.reduce((acc, incident) => {
      acc[incident.severity] = (acc[incident.severity] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const mostCommonSeverity = Object.entries(severityCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Mild'

    // Calculate average per month (assuming 3 months of data)
    const averagePerMonth = Math.round(incidents.length / 3 * 10) / 10

    return {
      total_incidents: incidents.length,
      average_per_month: averagePerMonth,
      most_common_severity: mostCommonSeverity as any,
      longest_streak_days: 15, // Demo value
      current_streak_days: 3, // Demo value
      this_month_count: thisMonthCount,
      last_month_count: lastMonthCount
    }
  }

  /**
   * Calculate demo trends from dynamic demo data
   */
  private static calculateDemoTrends(monthsBack: number): MonthlyTrend[] {
    const { data: incidents } = getDemoIncidents(1, 1000) // Get all demo incidents
    
    const monthlyData = incidents.reduce((acc, incident) => {
      const month = new Date(incident.incident_date).toISOString().slice(0, 7)
      if (!acc[month]) {
        acc[month] = {
          month,
          incident_count: 0,
          severity_breakdown: { Mild: 0, Moderate: 0, Severe: 0 },
          avg_duration_minutes: 0,
          durations: []
        }
      }
      acc[month].incident_count++
      acc[month].severity_breakdown[incident.severity as keyof typeof acc[typeof month]['severity_breakdown']]++
      if (incident.duration_minutes) {
        acc[month].durations.push(incident.duration_minutes)
      }
      return acc
    }, {} as Record<string, any>)

    return Object.values(monthlyData).map((data: any) => ({
      month: data.month,
      incident_count: data.incident_count,
      severity_breakdown: data.severity_breakdown,
      avg_duration_minutes: data.durations.length > 0 
        ? Math.round(data.durations.reduce((a: number, b: number) => a + b, 0) / data.durations.length)
        : 0
    }))
  }

  /**
   * Calculate demo triggers from dynamic demo data
   */
  private static calculateDemoTriggers(limit: number): TriggerFrequency[] {
    const { data: incidents } = getDemoIncidents(1, 1000) // Get all demo incidents
    
    const triggerCounts: Record<string, { count: number; category: string }> = {}
    let totalIncidents = incidents.length

    incidents.forEach(incident => {
      // Count foods
      if (incident.foods) {
        incident.foods.forEach((food: string) => {
          if (!triggerCounts[food]) {
            triggerCounts[food] = { count: 0, category: 'food' }
          }
          triggerCounts[food].count++
        })
      }

      // Count activities
      if (incident.activities) {
        incident.activities.forEach((activity: string) => {
          if (!triggerCounts[activity]) {
            triggerCounts[activity] = { count: 0, category: 'activity' }
          }
          triggerCounts[activity].count++
        })
      }
    })

    return Object.entries(triggerCounts)
      .map(([trigger, data]) => ({
        trigger,
        count: data.count,
        percentage: Math.round((data.count / totalIncidents) * 100 * 10) / 10,
        category: data.category as 'food' | 'activity'
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }

  /**
   * Calculate demo symptoms from dynamic demo data
   */
  private static calculateDemoSymptoms(): SymptomFrequency[] {
    const { data: incidents } = getDemoIncidents(1, 1000) // Get all demo incidents
    
    const symptomData: Record<string, { count: number; severities: Record<string, number> }> = {}
    let totalIncidents = incidents.length

    incidents.forEach(incident => {
      if (incident.symptoms) {
        incident.symptoms.forEach((symptom: string) => {
          if (!symptomData[symptom]) {
            symptomData[symptom] = { 
              count: 0, 
              severities: { Mild: 0, Moderate: 0, Severe: 0 }
            }
          }
          symptomData[symptom].count++
          symptomData[symptom].severities[incident.severity]++
        })
      }
    })

    return Object.entries(symptomData)
      .map(([symptom, data]) => ({
        symptom,
        count: data.count,
        percentage: Math.round((data.count / totalIncidents) * 100 * 10) / 10,
        severity_distribution: data.severities as Record<'Mild' | 'Moderate' | 'Severe', number>
      }))
      .sort((a, b) => b.count - a.count)
  }
}