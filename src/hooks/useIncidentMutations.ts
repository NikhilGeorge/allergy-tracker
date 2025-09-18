import { useState } from 'react'
import { mutate } from 'swr'
import { IncidentService } from '@/services/incidents'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { ErrorHandler } from '@/lib/errors'
import type { CreateIncidentData, Incident } from '@/types'

/**
 * Invalidate all incident and analytics related caches
 */
const invalidateAllCaches = () => {
  // Force revalidation of ALL SWR caches
  mutate(() => true, undefined, { revalidate: true })
  
  // Specific cache invalidations for good measure
  mutate(key => Array.isArray(key) && key[0] === 'incidents')
  mutate('recent-incidents')
  mutate('incident-stats')
  mutate('dashboard-data')
  mutate(key => Array.isArray(key) && key[0] === 'monthly-trends')
  mutate(key => Array.isArray(key) && key[0] === 'trigger-frequency')
  mutate('symptom-frequency')
  
  // Force refresh of all analytics data
  mutate(key => typeof key === 'string' && key.includes('analytics'))
  
  // Also invalidate any chart-specific caches
  mutate(key => typeof key === 'string' && (
    key.includes('chart') || 
    key.includes('stats') || 
    key.includes('trend') ||
    key.includes('frequency')
  ))
}

interface MutationState {
  isLoading: boolean
  error: string | null
}

/**
 * Hook for creating incidents
 */
export function useCreateIncident() {
  const [state, setState] = useState<MutationState>({
    isLoading: false,
    error: null
  })

  const createIncident = async (data: CreateIncidentData): Promise<Incident | null> => {
    setState({ isLoading: true, error: null })
    
    try {
      const incident = await IncidentService.createIncident(data)
      
      // Invalidate all relevant caches
      invalidateAllCaches()
      
      setState({ isLoading: false, error: null })
      return incident
    } catch (error) {
      ErrorHandler.logError(error, 'useCreateIncident')
      const errorMessage = ErrorHandler.getUserMessage(error)
      setState({ isLoading: false, error: errorMessage })
      return null
    }
  }

  return {
    createIncident,
    ...state
  }
}

/**
 * Hook for updating incidents
 */
export function useUpdateIncident() {
  const [state, setState] = useState<MutationState>({
    isLoading: false,
    error: null
  })

  const updateIncident = async (id: string, data: Partial<CreateIncidentData>): Promise<Incident | null> => {
    setState({ isLoading: true, error: null })
    
    try {
      const incident = await IncidentService.updateIncident(id, data)
      
      // Invalidate specific incident and all related caches
      mutate(['incident', id])
      invalidateAllCaches()
      
      setState({ isLoading: false, error: null })
      return incident
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update incident'
      setState({ isLoading: false, error: errorMessage })
      return null
    }
  }

  return {
    updateIncident,
    ...state
  }
}

/**
 * Hook for deleting incidents
 */
export function useDeleteIncident() {
  const [state, setState] = useState<MutationState>({
    isLoading: false,
    error: null
  })

  const deleteIncident = async (id: string): Promise<boolean> => {
    setState({ isLoading: true, error: null })
    
    try {
      await IncidentService.deleteIncident(id)
      
      // Remove specific incident from cache and invalidate all related caches
      mutate(['incident', id], undefined, false) // Remove from cache
      invalidateAllCaches()
      
      setState({ isLoading: false, error: null })
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete incident'
      setState({ isLoading: false, error: errorMessage })
      return false
    }
  }

  return {
    deleteIncident,
    ...state
  }
}

/**
 * Hook for batch operations
 */
export function useBatchIncidentOperations() {
  const [state, setState] = useState<MutationState>({
    isLoading: false,
    error: null
  })

  const deleteMultipleIncidents = async (ids: string[]): Promise<boolean> => {
    setState({ isLoading: true, error: null })
    
    try {
      await Promise.all(ids.map(id => IncidentService.deleteIncident(id)))
      
      // Remove specific incidents from cache and invalidate all related caches
      ids.forEach(id => mutate(['incident', id], undefined, false))
      invalidateAllCaches()
      
      setState({ isLoading: false, error: null })
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete incidents'
      setState({ isLoading: false, error: errorMessage })
      return false
    }
  }

  return {
    deleteMultipleIncidents,
    ...state
  }
}