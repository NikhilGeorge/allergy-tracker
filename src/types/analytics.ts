import { SeverityLevel } from './incident';

export interface IncidentStats {
  total_incidents: number;
  average_per_month: number;
  most_common_severity: SeverityLevel;
  longest_streak_days: number;
  current_streak_days: number;
  this_month_count: number;
  last_month_count: number;
}

export interface TriggerFrequency {
  trigger: string;
  count: number;
  percentage: number;
  category: 'food' | 'activity' | 'environmental' | 'medication';
}

export interface MonthlyTrend {
  month: string; // YYYY-MM format
  incident_count: number;
  severity_breakdown: Record<SeverityLevel, number>;
  avg_duration_minutes: number;
}

export interface SeasonalPattern {
  season: 'Spring' | 'Summer' | 'Fall' | 'Winter';
  month: number; // 1-12
  incident_count: number;
  avg_severity_score: number; // Mild=1, Moderate=2, Severe=3
}

export interface SymptomFrequency {
  symptom: string;
  count: number;
  percentage: number;
  severity_distribution: Record<SeverityLevel, number>;
}

export interface CorrelationAnalysis {
  trigger_combinations: {
    combination: string[];
    frequency: number;
    avg_severity: number;
  }[];
  time_patterns: {
    hour_of_day: Record<number, number>; // 0-23 hours
    day_of_week: Record<number, number>; // 0-6 (Sunday-Saturday)
    month_of_year: Record<number, number>; // 1-12
  };
}

export interface DashboardData {
  stats: IncidentStats;
  monthly_trends: MonthlyTrend[];
  seasonal_patterns: SeasonalPattern[];
  top_triggers: TriggerFrequency[];
  symptom_frequency: SymptomFrequency[];
  correlations: CorrelationAnalysis;
}

// Chart data types for Chart.js
export interface ChartDataPoint {
  x: string | number | Date;
  y: number;
  label?: string;
}

export interface ChartDataset {
  label: string;
  data: ChartDataPoint[] | number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}