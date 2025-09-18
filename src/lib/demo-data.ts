import type { Incident } from '@/types'

// Initial sample incidents for demo mode
const INITIAL_DEMO_INCIDENTS: Incident[] = [
  {
    id: 'demo-1',
    user_id: 'demo-user',
    incident_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    severity: 'Moderate',
    symptoms: ['Sneezing', 'Runny nose', 'Itchy eyes'],
    foods: ['Peanuts', 'Milk'],
    activities: ['Outdoor walk'],
    environmental_factors: {
      weather: 'Sunny',
      location: 'Park',
      stress_level: 3,
      pollen_count: 'High'
    },
    medications: ['Antihistamine'],
    duration_minutes: 45,
    notes: 'Had peanut butter sandwich for lunch, then went for a walk in the park. Symptoms started about 30 minutes after eating.',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-2',
    user_id: 'demo-user',
    incident_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    severity: 'Mild',
    symptoms: ['Itchy skin', 'Mild rash'],
    foods: ['Shellfish'],
    activities: ['Dinner at restaurant'],
    environmental_factors: {
      weather: 'Cloudy',
      location: 'Restaurant',
      stress_level: 2
    },
    medications: [],
    duration_minutes: 20,
    notes: 'Tried shrimp for the first time at a seafood restaurant. Mild reaction on arms.',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-3',
    user_id: 'demo-user',
    incident_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    severity: 'Severe',
    symptoms: ['Difficulty breathing', 'Swelling', 'Hives', 'Nausea'],
    foods: ['Tree nuts', 'Almonds'],
    activities: ['Baking'],
    environmental_factors: {
      weather: 'Indoor',
      location: 'Home kitchen',
      stress_level: 1
    },
    medications: ['EpiPen', 'Emergency room visit'],
    duration_minutes: 120,
    notes: 'Severe reaction while baking almond cookies. Used EpiPen and went to emergency room. Full recovery after treatment.',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-4',
    user_id: 'demo-user',
    incident_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    severity: 'Moderate',
    symptoms: ['Sneezing', 'Watery eyes', 'Congestion'],
    foods: [],
    activities: ['Gardening', 'Outdoor activities'],
    environmental_factors: {
      weather: 'Windy',
      location: 'Garden',
      stress_level: 2,
      pollen_count: 'Very High',
      temperature: 75,
      humidity: 60
    },
    medications: ['Nasal spray', 'Eye drops'],
    duration_minutes: 90,
    notes: 'Spring allergies acting up while gardening. High pollen count and windy conditions made it worse.',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-5',
    user_id: 'demo-user',
    incident_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
    severity: 'Mild',
    symptoms: ['Itchy throat', 'Mild cough'],
    foods: ['Eggs'],
    activities: ['Breakfast'],
    environmental_factors: {
      weather: 'Indoor',
      location: 'Home',
      stress_level: 1
    },
    medications: [],
    duration_minutes: 15,
    notes: 'Mild reaction to scrambled eggs at breakfast. Symptoms resolved quickly.',
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  }
]

// Demo mode flag
export const isDemoMode = () => {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('demo-mode') === 'true'
}

export const enableDemoMode = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('demo-mode', 'true')
  }
}

export const disableDemoMode = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('demo-mode')
  }
}

// Dynamic demo data store
class DemoDataStore {
  private static STORAGE_KEY = 'demo-incidents'

  // Get all demo incidents from localStorage or initialize with defaults
  static getAll(): Incident[] {
    if (typeof window === 'undefined') return INITIAL_DEMO_INCIDENTS

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.warn('Failed to parse demo incidents from localStorage:', error)
    }

    // Initialize with default data
    this.setAll(INITIAL_DEMO_INCIDENTS)
    return INITIAL_DEMO_INCIDENTS
  }

  // Save all incidents to localStorage
  static setAll(incidents: Incident[]): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(incidents))
    } catch (error) {
      console.warn('Failed to save demo incidents to localStorage:', error)
    }
  }

  // Add a new incident
  static add(incident: Incident): void {
    const incidents = this.getAll()
    incidents.unshift(incident) // Add to beginning for chronological order
    this.setAll(incidents)
  }

  // Update an existing incident
  static update(id: string, updatedIncident: Incident): void {
    const incidents = this.getAll()
    const index = incidents.findIndex(incident => incident.id === id)
    if (index !== -1) {
      incidents[index] = updatedIncident
      this.setAll(incidents)
    }
  }

  // Delete an incident
  static delete(id: string): void {
    const incidents = this.getAll()
    const filtered = incidents.filter(incident => incident.id !== id)
    this.setAll(filtered)
  }

  // Get incident by ID
  static getById(id: string): Incident | undefined {
    const incidents = this.getAll()
    return incidents.find(incident => incident.id === id)
  }

  // Clear all demo data
  static clear(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.STORAGE_KEY)
  }

  // Reset to initial data
  static reset(): void {
    this.setAll(INITIAL_DEMO_INCIDENTS)
  }
}

// Get demo incidents with pagination
export const getDemoIncidents = (page = 1, limit = 20) => {
  const allIncidents = DemoDataStore.getAll()
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedIncidents = allIncidents.slice(startIndex, endIndex)
  
  return {
    data: paginatedIncidents,
    pagination: {
      page,
      limit,
      total: allIncidents.length,
      totalPages: Math.ceil(allIncidents.length / limit),
      hasNext: endIndex < allIncidents.length,
      hasPrev: page > 1
    }
  }
}

// Get demo incident by ID
export const getDemoIncidentById = (id: string) => {
  return DemoDataStore.getById(id)
}

// Add demo incident
export const addDemoIncident = (incident: Incident) => {
  DemoDataStore.add(incident)
}

// Update demo incident
export const updateDemoIncident = (id: string, incident: Incident) => {
  DemoDataStore.update(id, incident)
}

// Delete demo incident
export const deleteDemoIncident = (id: string) => {
  DemoDataStore.delete(id)
}

// Reset demo data
export const resetDemoData = () => {
  DemoDataStore.reset()
}

// Clear demo data
export const clearDemoData = () => {
  DemoDataStore.clear()
}

// Clear all demo-related data (including mode flag)
export const clearAllDemoData = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('demo-mode')
  DemoDataStore.clear()
}