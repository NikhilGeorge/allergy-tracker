import { supabase } from '@/lib/supabase'
import { getUserId } from '@/lib/auth'
import { 
  ApiError, 
  AuthenticationError, 
  NotFoundError, 
  ValidationError,
  ErrorHandler,
  withRetry
} from '@/lib/errors'
import { 
  isDemoMode, 
  getDemoIncidents, 
  getDemoIncidentById, 
  addDemoIncident, 
  updateDemoIncident, 
  deleteDemoIncident 
} from '@/lib/demo-data'
import type { 
  Incident, 
  CreateIncidentData, 
  UpdateIncidentData, 
  IncidentFilters,
  IncidentSearchParams,
  PaginatedResponse,
  ApiResponse
} from '@/types'

export class IncidentService {
  /**
   * Get all incidents for the current user with optional filtering and pagination
   */
  static async getIncidents(params: IncidentSearchParams = {}): Promise<PaginatedResponse<Incident>> {
    // Check if we're in demo mode
    if (isDemoMode()) {
      const { page = 1, limit = 20 } = params
      return getDemoIncidents(page, limit)
    }

    if (!supabase) {
      throw new ApiError('Database connection not available', 500, 'DB_NOT_CONFIGURED')
    }

    const userId = await getUserId()
    if (!userId) {
      throw new AuthenticationError()
    }

    const {
      page = 1,
      limit = 20,
      filters = {},
      sortBy = 'incident_date',
      sortOrder = 'desc'
    } = params

    let query = supabase
      .from('incidents')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)

    // Apply filters
    if (filters.dateFrom) {
      query = query.gte('incident_date', filters.dateFrom.toISOString())
    }
    if (filters.dateTo) {
      query = query.lte('incident_date', filters.dateTo.toISOString())
    }
    if (filters.severity && filters.severity.length > 0) {
      query = query.in('severity', filters.severity)
    }
    if (filters.symptoms && filters.symptoms.length > 0) {
      query = query.overlaps('symptoms', filters.symptoms)
    }
    if (filters.foods && filters.foods.length > 0) {
      query = query.overlaps('foods', filters.foods)
    }
    if (filters.search) {
      // Search in notes, symptoms, foods, and activities
      query = query.or(`notes.ilike.%${filters.search}%,symptoms.cs.{${filters.search}},foods.cs.{${filters.search}},activities.cs.{${filters.search}}`)
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await withRetry(async () => {
      const result = await query
      if (result.error) {
        throw new ApiError(`Database query failed: ${result.error.message}`, 500, 'DB_QUERY_ERROR')
      }
      return result
    })

    if (error) {
      ErrorHandler.logError(error, 'IncidentService.getIncidents')
      throw error
    }

    const totalPages = Math.ceil((count || 0) / limit)

    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  }

  /**
   * Get a single incident by ID
   */
  static async getIncident(id: string): Promise<Incident> {
    // Check if we're in demo mode
    if (isDemoMode()) {
      const incident = getDemoIncidentById(id)
      if (!incident) {
        throw new NotFoundError('Incident not found')
      }
      return incident
    }

    if (!supabase) {
      throw new ApiError('Database connection not available', 500, 'DB_NOT_CONFIGURED')
    }

    const userId = await getUserId()
    if (!userId) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching incident:', error)
      throw new Error(`Failed to fetch incident: ${error.message}`)
    }

    if (!data) {
      throw new Error('Incident not found')
    }

    return data
  }

  /**
   * Create a new incident
   */
  static async createIncident(data: CreateIncidentData): Promise<Incident> {
    // Check if we're in demo mode
    if (isDemoMode()) {
      // In demo mode, simulate creating an incident
      const newIncident: Incident = {
        id: `demo-${Date.now()}`,
        user_id: 'demo-user',
        incident_date: data.incident_date.toISOString(),
        severity: data.severity,
        symptoms: data.symptoms,
        foods: data.foods || [],
        activities: data.activities || [],
        environmental_factors: data.environmental_factors || {},
        medications: data.medications || [],
        duration_minutes: data.duration_minutes,
        notes: data.notes || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // Add to demo data store
      addDemoIncident(newIncident)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return newIncident
    }

    if (!supabase) {
      throw new ApiError('Database connection not available', 500, 'DB_NOT_CONFIGURED')
    }

    const userId = await getUserId()
    if (!userId) {
      throw new AuthenticationError()
    }

    const { data: result, error } = await supabase
      .from('incidents')
      .insert({
        user_id: userId,
        incident_date: data.incident_date.toISOString(),
        severity: data.severity,
        symptoms: data.symptoms,
        foods: data.foods || [],
        activities: data.activities || [],
        environmental_factors: data.environmental_factors || {},
        medications: data.medications || [],
        duration_minutes: data.duration_minutes,
        notes: data.notes
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating incident:', error)
      throw new ApiError(`Failed to create incident: ${error.message}`, 500, 'CREATE_FAILED')
    }

    return result
  }

  /**
   * Update an existing incident
   */
  static async updateIncident(id: string, data: UpdateIncidentData): Promise<Incident> {
    // Check if we're in demo mode
    if (isDemoMode()) {
      // In demo mode, simulate updating an incident
      const existingIncident = getDemoIncidentById(id)
      if (!existingIncident) {
        throw new NotFoundError('Incident not found')
      }
      
      const updatedIncident: Incident = {
        ...existingIncident,
        ...data,
        incident_date: data.incident_date ? data.incident_date.toISOString() : existingIncident.incident_date,
        updated_at: new Date().toISOString()
      }
      
      // Update in demo data store
      updateDemoIncident(id, updatedIncident)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return updatedIncident
    }

    if (!supabase) {
      throw new ApiError('Database connection not available', 500, 'DB_NOT_CONFIGURED')
    }

    const userId = await getUserId()
    if (!userId) {
      throw new AuthenticationError()
    }

    const updateData: any = {}
    
    if (data.incident_date) {
      updateData.incident_date = data.incident_date.toISOString()
    }
    if (data.severity) {
      updateData.severity = data.severity
    }
    if (data.symptoms) {
      updateData.symptoms = data.symptoms
    }
    if (data.foods !== undefined) {
      updateData.foods = data.foods
    }
    if (data.activities !== undefined) {
      updateData.activities = data.activities
    }
    if (data.environmental_factors !== undefined) {
      updateData.environmental_factors = data.environmental_factors
    }
    if (data.medications !== undefined) {
      updateData.medications = data.medications
    }
    if (data.duration_minutes !== undefined) {
      updateData.duration_minutes = data.duration_minutes
    }
    if (data.notes !== undefined) {
      updateData.notes = data.notes
    }

    const { data: result, error } = await supabase
      .from('incidents')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating incident:', error)
      throw new ApiError(`Failed to update incident: ${error.message}`, 500, 'UPDATE_FAILED')
    }

    return result
  }

  /**
   * Delete an incident
   */
  static async deleteIncident(id: string): Promise<void> {
    // Check if we're in demo mode
    if (isDemoMode()) {
      // In demo mode, simulate deleting an incident
      const existingIncident = getDemoIncidentById(id)
      if (!existingIncident) {
        throw new NotFoundError('Incident not found')
      }
      
      // Delete from demo data store
      deleteDemoIncident(id)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // In demo mode, we just simulate success
      return
    }

    if (!supabase) {
      throw new ApiError('Database connection not available', 500, 'DB_NOT_CONFIGURED')
    }

    const userId = await getUserId()
    if (!userId) {
      throw new AuthenticationError()
    }

    const { error } = await supabase
      .from('incidents')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting incident:', error)
      throw new ApiError(`Failed to delete incident: ${error.message}`, 500, 'DELETE_FAILED')
    }
  }

  /**
   * Get recent incidents (last 10)
   */
  static async getRecentIncidents(): Promise<Incident[]> {
    const result = await this.getIncidents({
      page: 1,
      limit: 10,
      sortBy: 'incident_date',
      sortOrder: 'desc'
    })
    return result.data
  }

  /**
   * Search incidents by text
   */
  static async searchIncidents(searchTerm: string, limit = 20): Promise<Incident[]> {
    const result = await this.getIncidents({
      page: 1,
      limit,
      filters: { search: searchTerm }
    })
    return result.data
  }

  /**
   * Get incidents by severity
   */
  static async getIncidentsBySeverity(severity: string[]): Promise<Incident[]> {
    const result = await this.getIncidents({
      filters: { severity: severity as any }
    })
    return result.data
  }

  /**
   * Get incidents in date range
   */
  static async getIncidentsInDateRange(from: Date, to: Date): Promise<Incident[]> {
    const result = await this.getIncidents({
      filters: { dateFrom: from, dateTo: to }
    })
    return result.data
  }
}