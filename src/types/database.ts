// Database type definitions for Supabase
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      incidents: {
        Row: {
          id: string
          user_id: string
          incident_date: string
          severity: 'Mild' | 'Moderate' | 'Severe'
          symptoms: string[]
          foods: string[] | null
          activities: string[] | null
          environmental_factors: Json | null
          medications: string[] | null
          duration_minutes: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          incident_date: string
          severity: 'Mild' | 'Moderate' | 'Severe'
          symptoms: string[]
          foods?: string[] | null
          activities?: string[] | null
          environmental_factors?: Json | null
          medications?: string[] | null
          duration_minutes?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          incident_date?: string
          severity?: 'Mild' | 'Moderate' | 'Severe'
          symptoms?: string[]
          foods?: string[] | null
          activities?: string[] | null
          environmental_factors?: Json | null
          medications?: string[] | null
          duration_minutes?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "incidents_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_incident_stats: {
        Args: {
          user_uuid: string
        }
        Returns: Json
      }
      get_monthly_trends: {
        Args: {
          user_uuid: string
          months_back?: number
        }
        Returns: Json
      }
      get_trigger_frequency: {
        Args: {
          user_uuid: string
          limit_count?: number
        }
        Returns: Json
      }
      get_symptom_frequency: {
        Args: {
          user_uuid: string
        }
        Returns: Json
      }
      create_sample_incidents: {
        Args: {
          target_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      severity_level: 'Mild' | 'Moderate' | 'Severe'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}