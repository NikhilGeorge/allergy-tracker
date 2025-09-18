import useSWR from 'swr'
import { AnalyticsService } from '@/services/analytics'
import type { 
  IncidentStats,
  MonthlyTrend,
  TriggerFrequency,
  SymptomFrequency,
  DashboardData
} from '@/types'

/**
 * Hook for incident statistics
 */
export function useIncidentStats() {
  const { data, error, isLoading, mutate } = useSWR(
    'incident-stats',
    () => AnalyticsService.getIncidentStats(),
    {
      revalidateOnFocus: true,
      refreshInterval: 60000, // Refresh every 1 minute
      dedupingInterval: 30000, // Dedupe requests for 30 seconds
    }
  )

  return {
    stats: data,
    isLoading,
    error,
    mutate
  }
}

/**
 * Hook for monthly trends
 */
export function useMonthlyTrends(monthsBack = 12) {
  const { data, error, isLoading } = useSWR(
    ['monthly-trends', monthsBack],
    () => AnalyticsService.getMonthlyTrends(monthsBack),
    {
      revalidateOnFocus: true,
      refreshInterval: 120000, // Refresh every 2 minutes
      dedupingInterval: 60000, // Dedupe requests for 1 minute
    }
  )

  return {
    trends: data || [],
    isLoading,
    error
  }
}

/**
 * Hook for trigger frequency
 */
export function useTriggerFrequency(limit = 10) {
  const { data, error, isLoading } = useSWR(
    ['trigger-frequency', limit],
    () => AnalyticsService.getTriggerFrequency(limit),
    {
      revalidateOnFocus: true,
      refreshInterval: 120000, // Refresh every 2 minutes
      dedupingInterval: 60000, // Dedupe requests for 1 minute
    }
  )

  return {
    triggers: data || [],
    isLoading,
    error
  }
}

/**
 * Hook for symptom frequency
 */
export function useSymptomFrequency() {
  const { data, error, isLoading } = useSWR(
    'symptom-frequency',
    () => AnalyticsService.getSymptomFrequency(),
    {
      revalidateOnFocus: true,
      refreshInterval: 120000, // Refresh every 2 minutes
      dedupingInterval: 60000, // Dedupe requests for 1 minute
    }
  )

  return {
    symptoms: data || [],
    isLoading,
    error
  }
}

/**
 * Hook for complete dashboard data
 */
export function useDashboardData() {
  const { data, error, isLoading, mutate } = useSWR(
    'dashboard-data',
    () => AnalyticsService.getDashboardData(),
    {
      revalidateOnFocus: true,
      refreshInterval: 60000, // Refresh every 1 minute
      dedupingInterval: 30000, // Dedupe requests for 30 seconds
    }
  )

  return {
    dashboardData: data,
    isLoading,
    error,
    mutate
  }
}