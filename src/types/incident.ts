export type SeverityLevel = 'Mild' | 'Moderate' | 'Severe';

export interface EnvironmentalFactors {
  weather?: string;
  location?: string;
  stress_level?: number; // 1-10 scale
  air_quality?: string;
  temperature?: number;
  humidity?: number;
  pollen_count?: string;
  other?: string;
}

export interface Incident {
  id: string;
  user_id: string;
  incident_date: string; // ISO string
  severity: SeverityLevel;
  symptoms: string[];
  foods?: string[];
  activities?: string[];
  environmental_factors?: EnvironmentalFactors;
  medications?: string[];
  duration_minutes?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Form data types (without server-generated fields)
export interface CreateIncidentData {
  incident_date: Date;
  severity: SeverityLevel;
  symptoms: string[];
  foods?: string[];
  activities?: string[];
  environmental_factors?: EnvironmentalFactors;
  medications?: string[];
  duration_minutes?: number;
  notes?: string;
}

export interface UpdateIncidentData extends Partial<CreateIncidentData> {
  id: string;
}

// Filter and search types
export interface IncidentFilters {
  dateFrom?: Date;
  dateTo?: Date;
  severity?: SeverityLevel[];
  symptoms?: string[];
  foods?: string[];
  search?: string;
}

export interface IncidentSearchParams {
  page?: number;
  limit?: number;
  filters?: IncidentFilters;
  sortBy?: 'incident_date' | 'severity' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}