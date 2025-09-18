import { Incident } from './incident';

export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  error?: string;
}

export interface IncidentListResponse extends PaginatedResponse<Incident> {}

export interface DatabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

// Supabase specific types
export interface SupabaseResponse<T> {
  data: T | null;
  error: DatabaseError | null;
  count?: number | null;
  status: number;
  statusText: string;
}

// Form submission states
export interface FormState {
  isSubmitting: boolean;
  isSuccess: boolean;
  error?: string;
}

// Common API endpoints
export type ApiEndpoint = 
  | '/api/incidents'
  | '/api/incidents/[id]'
  | '/api/analytics/stats'
  | '/api/analytics/trends'
  | '/api/analytics/dashboard';

// HTTP methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';