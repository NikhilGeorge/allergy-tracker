import useSWR from 'swr'
import { IncidentService } from '@/services/incidents'
import type { 
  Incident, 
  IncidentSearchParams, 
  PaginatedResponse 
} from '@/types'

/**
 * Hook for fetching paginated incidents with filters
 */
export function useIncidents(params: IncidentSearchParams = {}) {
  const key = ['incidents', params]
  
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => IncidentService.getIncidents(params),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  )

  return {
    incidents: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    mutate
  }
}

/**
 * Hook for fetching a single incident
 */
export function useIncident(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ['incident', id] : null,
    () => id ? IncidentService.getIncident(id) : null,
    {
      revalidateOnFocus: false,
    }
  )

  return {
    incident: data,
    isLoading,
    error,
    mutate
  }
}

/**
 * Hook for recent incidents
 */
export function useRecentIncidents() {
  const { data, error, isLoading, mutate } = useSWR(
    'recent-incidents',
    () => IncidentService.getRecentIncidents(),
    {
      revalidateOnFocus: false,
      refreshInterval: 60000, // Refresh every minute
    }
  )

  return {
    incidents: data || [],
    isLoading,
    error,
    mutate
  }
}

/**
 * Hook for searching incidents
 */
export function useIncidentSearch(searchTerm: string, limit = 20) {
  const { data, error, isLoading } = useSWR(
    searchTerm ? ['incidents-search', searchTerm, limit] : null,
    () => searchTerm ? IncidentService.searchIncidents(searchTerm, limit) : [],
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000, // 5 seconds
    }
  )

  return {
    incidents: data || [],
    isLoading,
    error
  }
}

/**
 * Hook for incidents by severity
 */
export function useIncidentsBySeverity(severity: string[]) {
  const { data, error, isLoading } = useSWR(
    severity.length > 0 ? ['incidents-severity', severity] : null,
    () => severity.length > 0 ? IncidentService.getIncidentsBySeverity(severity) : [],
    {
      revalidateOnFocus: false,
    }
  )

  return {
    incidents: data || [],
    isLoading,
    error
  }
}

/**
 * Hook for incidents in date range
 */
export function useIncidentsInDateRange(from: Date | null, to: Date | null) {
  const { data, error, isLoading } = useSWR(
    from && to ? ['incidents-date-range', from.toISOString(), to.toISOString()] : null,
    () => from && to ? IncidentService.getIncidentsInDateRange(from, to) : [],
    {
      revalidateOnFocus: false,
    }
  )

  return {
    incidents: data || [],
    isLoading,
    error
  }
}