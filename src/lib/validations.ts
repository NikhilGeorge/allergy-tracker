import { z } from 'zod';

// Base schemas
export const SeveritySchema = z.enum(['Mild', 'Moderate', 'Severe']);

export const EnvironmentalFactorsSchema = z.object({
  weather: z.string().optional(),
  location: z.string().optional(),
  stress_level: z.number().min(1).max(10).optional(),
  air_quality: z.string().optional(),
  temperature: z.number().optional(),
  humidity: z.number().min(0).max(100).optional(),
  pollen_count: z.string().optional(),
  other: z.string().optional(),
}).optional();

// Main incident validation schema
export const IncidentSchema = z.object({
  incident_date: z.union([
    z.date(),
    z.string().min(1, "Incident date is required")
  ]).transform((val) => {
    if (val instanceof Date) {
      return val;
    }
    const date = new Date(val);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date format");
    }
    return date;
  }).refine((date) => {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    
    return date >= oneYearAgo && date <= oneHourFromNow;
  }, {
    message: "Incident date must be within the last year and not more than 1 hour in the future"
  }),
  severity: SeveritySchema,
  symptoms: z.array(z.string().min(1, "Symptom cannot be empty"))
    .min(1, "At least one symptom is required")
    .max(20, "Too many symptoms selected"),
  foods: z.array(z.string().min(1))
    .max(50, "Too many foods listed")
    .optional(),
  activities: z.array(z.string().min(1))
    .max(30, "Too many activities listed")
    .optional(),
  environmental_factors: EnvironmentalFactorsSchema,
  medications: z.array(z.string().min(1))
    .max(20, "Too many medications listed")
    .optional(),
  duration_minutes: z.number()
    .min(1, "Duration must be at least 1 minute")
    .max(10080, "Duration cannot exceed 7 days") // 7 days in minutes
    .optional(),
  notes: z.string()
    .max(2000, "Notes cannot exceed 2000 characters")
    .optional(),
});

// Update schema (all fields optional except id)
export const UpdateIncidentSchema = IncidentSchema.partial().extend({
  id: z.string().uuid("Invalid incident ID"),
});

// Filter schemas
export const IncidentFiltersSchema = z.object({
  dateFrom: z.union([z.date(), z.string()]).transform((val) => {
    if (!val) return undefined;
    if (val instanceof Date) return val;
    const date = new Date(val);
    return isNaN(date.getTime()) ? undefined : date;
  }).optional(),
  dateTo: z.union([z.date(), z.string()]).transform((val) => {
    if (!val) return undefined;
    if (val instanceof Date) return val;
    const date = new Date(val);
    return isNaN(date.getTime()) ? undefined : date;
  }).optional(),
  severity: z.array(SeveritySchema).optional(),
  symptoms: z.array(z.string()).optional(),
  foods: z.array(z.string()).optional(),
  search: z.string().max(100).optional(),
});

export const IncidentSearchParamsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  filters: IncidentFiltersSchema.optional(),
  sortBy: z.enum(['incident_date', 'severity', 'created_at']).default('incident_date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Form validation helpers
export const validateIncident = (data: unknown) => {
  return IncidentSchema.safeParse(data);
};

export const validateUpdateIncident = (data: unknown) => {
  return UpdateIncidentSchema.safeParse(data);
};

export const validateFilters = (data: unknown) => {
  return IncidentFiltersSchema.safeParse(data);
};

// Common validation patterns
export const TagSchema = z.string()
  .min(1, "Tag cannot be empty")
  .max(50, "Tag too long")
  .regex(/^[a-zA-Z0-9\s\-_]+$/, "Tag contains invalid characters");

export const TagArraySchema = z.array(TagSchema)
  .max(20, "Too many tags");

// Date validation helpers
export const validateDateRange = (from?: Date, to?: Date) => {
  if (from && to && from > to) {
    return { error: "Start date must be before end date" };
  }
  if (from && from > new Date()) {
    return { error: "Start date cannot be in the future" };
  }
  return { error: null };
};

// Export types inferred from schemas
export type IncidentFormData = z.infer<typeof IncidentSchema>;
export type UpdateIncidentFormData = z.infer<typeof UpdateIncidentSchema>;
export type IncidentFiltersData = z.infer<typeof IncidentFiltersSchema>;
export type IncidentSearchParamsData = z.infer<typeof IncidentSearchParamsSchema>;