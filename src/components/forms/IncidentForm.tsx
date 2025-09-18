'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { IncidentSchema } from '@/lib/validations'
import { useCreateIncident, useUpdateIncident } from '@/hooks/useIncidentMutations'
import { useToast } from '@/hooks/useToast'
import { useFormAutoSave } from '@/hooks/useFormAutoSave'
import { FormErrorBoundary } from '@/components/ui/ErrorBoundary'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import FormField from '@/components/ui/FormField'
import TagInput from '@/components/ui/TagInput'
import SeveritySelector from '@/components/ui/SeveritySelector'
import DateTimePicker from '@/components/ui/DateTimePicker'
import NumberInput from '@/components/ui/NumberInput'
import Textarea from '@/components/ui/Textarea'
import { 
  COMMON_SYMPTOMS, 
  COMMON_ALLERGENS, 
  COMMON_ACTIVITIES,
  type CreateIncidentData,
  type Incident,
  type SeverityLevel
} from '@/types'

interface IncidentFormProps {
  incident?: Incident // For editing existing incidents
  onSuccess?: (incident: Incident) => void
  onCancel?: () => void
}

type FormData = {
  incident_date: Date
  severity: SeverityLevel
  symptoms: string[]
  foods: string[]
  activities: string[]
  environmental_factors: {
    weather?: string
    location?: string
    stress_level?: number
    air_quality?: string
    temperature?: number
    humidity?: number
    pollen_count?: string
    other?: string
  }
  medications: string[]
  duration_minutes?: number
  notes?: string
}

export default function IncidentForm({ incident, onSuccess, onCancel }: IncidentFormProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const { createIncident, isLoading: isCreating, error: createError } = useCreateIncident()
  const { updateIncident, isLoading: isUpdating, error: updateError } = useUpdateIncident()
  
  const isEditing = !!incident
  const isLoading = isCreating || isUpdating
  const error = createError || updateError

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    watch,
    setValue
  } = useForm<FormData>({
    resolver: zodResolver(IncidentSchema),
    defaultValues: {
      incident_date: incident ? new Date(incident.incident_date) : new Date(),
      severity: incident?.severity || 'Moderate',
      symptoms: incident?.symptoms || ['Sneezing'],
      foods: incident?.foods || [],
      activities: incident?.activities || [],
      environmental_factors: incident?.environmental_factors || {},
      medications: incident?.medications || [],
      duration_minutes: incident?.duration_minutes,
      notes: incident?.notes || ''
    }
  })

  // Auto-save draft for new incidents only
  const { clearDraft } = useFormAutoSave({
    key: 'new-incident',
    watch,
    setValue,
    delay: 3000
  })

  const onSubmit = async (data: FormData) => {
    try {
      const incidentData: CreateIncidentData = {
        incident_date: data.incident_date,
        severity: data.severity,
        symptoms: data.symptoms,
        foods: data.foods.length > 0 ? data.foods : undefined,
        activities: data.activities.length > 0 ? data.activities : undefined,
        environmental_factors: Object.keys(data.environmental_factors).length > 0 
          ? data.environmental_factors 
          : undefined,
        medications: data.medications.length > 0 ? data.medications : undefined,
        duration_minutes: data.duration_minutes,
        notes: data.notes || undefined
      }

      let result: Incident | null = null

      if (isEditing && incident) {
        result = await updateIncident(incident.id, incidentData)
      } else {
        result = await createIncident(incidentData)
      }

      if (result) {
        showToast({
          type: 'success',
          title: isEditing ? 'Incident Updated' : 'Incident Created',
          description: isEditing 
            ? 'Your incident has been successfully updated.'
            : 'Your incident has been successfully recorded.'
        })
        
        // Clear draft on successful submission
        if (!isEditing) {
          clearDraft()
        }
        
        if (onSuccess) {
          onSuccess(result)
        } else {
          // Refresh the router to ensure all pages get updated data
          router.refresh()
          router.push('/incidents')
        }
      }
    } catch (err) {
      console.error('Error submitting form:', err)
      showToast({
        type: 'error',
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'create'} incident. Please try again.`
      })
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.back()
    }
  }

  return (
    <FormErrorBoundary>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error {isEditing ? 'updating' : 'creating'} incident
              </h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Controller
            name="incident_date"
            control={control}
            render={({ field }) => (
              <FormField
                label="Date and Time"
                required
                error={errors.incident_date?.message}
              >
                <DateTimePicker
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isLoading}
                />
              </FormField>
            )}
          />

          <Controller
            name="severity"
            control={control}
            render={({ field }) => (
              <FormField
                label="Severity Level"
                required
                error={errors.severity?.message}
              >
                <SeveritySelector
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isLoading}
                />
              </FormField>
            )}
          />
        </div>

        <Controller
          name="symptoms"
          control={control}
          render={({ field }) => (
            <FormField
              label="Symptoms"
              required
              error={errors.symptoms?.message}
              description="Add the symptoms you experienced during this incident"
            >
              <TagInput
                value={field.value}
                onChange={field.onChange}
                placeholder="Type a symptom and press Enter..."
                suggestions={COMMON_SYMPTOMS}
                disabled={isLoading}
                maxTags={20}
              />
            </FormField>
          )}
        />
      </div>

      {/* Triggers */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Potential Triggers</h3>
        
        <div className="space-y-6">
          <Controller
            name="foods"
            control={control}
            render={({ field }) => (
              <FormField
                label="Foods Consumed (Last 24 Hours)"
                error={errors.foods?.message}
                description="List any foods you ate in the 24 hours before the incident"
              >
                <TagInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Type a food and press Enter..."
                  suggestions={COMMON_ALLERGENS.filter(item => 
                    ['Peanuts', 'Tree nuts', 'Milk', 'Eggs', 'Wheat', 'Soy', 'Fish', 'Shellfish', 'Sesame'].includes(item)
                  )}
                  disabled={isLoading}
                  maxTags={50}
                />
              </FormField>
            )}
          />

          <Controller
            name="activities"
            control={control}
            render={({ field }) => (
              <FormField
                label="Activities"
                error={errors.activities?.message}
                description="What activities were you doing when the incident occurred?"
              >
                <TagInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Type an activity and press Enter..."
                  suggestions={COMMON_ACTIVITIES}
                  disabled={isLoading}
                  maxTags={30}
                />
              </FormField>
            )}
          />
        </div>
      </div>

      {/* Environmental Factors */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Environmental Factors</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Controller
            name="environmental_factors.weather"
            control={control}
            render={({ field }) => (
              <FormField label="Weather">
                <input
                  type="text"
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder="e.g., Sunny, Rainy, Cloudy"
                  disabled={isLoading}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </FormField>
            )}
          />

          <Controller
            name="environmental_factors.location"
            control={control}
            render={({ field }) => (
              <FormField label="Location">
                <input
                  type="text"
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder="e.g., Home, Office, Restaurant"
                  disabled={isLoading}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </FormField>
            )}
          />

          <Controller
            name="environmental_factors.stress_level"
            control={control}
            render={({ field }) => (
              <FormField 
                label="Stress Level (1-10)"
                description="1 = Very relaxed, 10 = Extremely stressed"
              >
                <NumberInput
                  value={field.value}
                  onChange={field.onChange}
                  min={1}
                  max={10}
                  step={1}
                  disabled={isLoading}
                  placeholder="Rate 1-10"
                />
              </FormField>
            )}
          />

          <Controller
            name="environmental_factors.temperature"
            control={control}
            render={({ field }) => (
              <FormField label="Temperature">
                <NumberInput
                  value={field.value}
                  onChange={field.onChange}
                  unit="°F"
                  disabled={isLoading}
                  placeholder="Temperature"
                />
              </FormField>
            )}
          />

          <Controller
            name="environmental_factors.humidity"
            control={control}
            render={({ field }) => (
              <FormField label="Humidity">
                <NumberInput
                  value={field.value}
                  onChange={field.onChange}
                  min={0}
                  max={100}
                  unit="%"
                  disabled={isLoading}
                  placeholder="Humidity %"
                />
              </FormField>
            )}
          />

          <Controller
            name="environmental_factors.pollen_count"
            control={control}
            render={({ field }) => (
              <FormField label="Pollen Count">
                <input
                  type="text"
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder="e.g., Low, Medium, High"
                  disabled={isLoading}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </FormField>
            )}
          />
        </div>
      </div>

      {/* Additional Details */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Details</h3>
        
        <div className="space-y-6">
          <Controller
            name="medications"
            control={control}
            render={({ field }) => (
              <FormField
                label="Medications Taken"
                error={errors.medications?.message}
                description="List any medications you took for this incident"
              >
                <TagInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Type a medication and press Enter..."
                  suggestions={['Antihistamine', 'Epinephrine', 'Inhaler', 'Nasal spray', 'Topical cream']}
                  disabled={isLoading}
                  maxTags={20}
                />
              </FormField>
            )}
          />

          <Controller
            name="duration_minutes"
            control={control}
            render={({ field }) => (
              <FormField
                label="Duration of Reaction"
                error={errors.duration_minutes?.message}
                description="How long did the reaction last?"
              >
                <NumberInput
                  value={field.value}
                  onChange={field.onChange}
                  min={1}
                  max={10080} // 7 days in minutes
                  unit="minutes"
                  disabled={isLoading}
                  placeholder="Duration in minutes"
                />
              </FormField>
            )}
          />

          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <FormField
                label="Additional Notes"
                error={errors.notes?.message}
                description="Any additional details about the incident"
              >
                <Textarea
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder="Describe any additional details about the incident..."
                  rows={4}
                  disabled={isLoading}
                  maxLength={2000}
                />
              </FormField>
            )}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || !isValid}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isEditing ? 'Updating...' : 'Creating...'}
            </div>
          ) : (
            isEditing ? 'Update Incident' : 'Create Incident'
          )}
        </button>
      </div>
    </form>
    </FormErrorBoundary>
  )
}