'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatDate, formatDuration } from '@/lib/utils'
import { SEVERITY_COLORS } from '@/types'
import { useDeleteIncident } from '@/hooks/useIncidentMutations'
import { useToast } from '@/hooks/useToast'
import type { Incident } from '@/types'

interface IncidentDetailProps {
  incident: Incident
  onEdit?: () => void
  onDelete?: () => void
  showNavigation?: boolean
  previousIncidentId?: string
  nextIncidentId?: string
}

export default function IncidentDetail({
  incident,
  onEdit,
  onDelete,
  showNavigation = true,
  previousIncidentId,
  nextIncidentId
}: IncidentDetailProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const { deleteIncident, isLoading: isDeleting } = useDeleteIncident()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleEdit = () => {
    if (onEdit) {
      onEdit()
    } else {
      router.push(`/incidents/${incident.id}/edit`)
    }
  }

  const handleDelete = async () => {
    const success = await deleteIncident(incident.id)
    if (success) {
      showToast({
        type: 'success',
        title: 'Incident Deleted',
        description: 'The incident has been successfully deleted.'
      })
      if (onDelete) {
        onDelete()
      } else {
        router.push('/incidents')
      }
    }
    setShowDeleteConfirm(false)
  }

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: SEVERITY_COLORS[incident.severity] }}
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Incident Details
              </h1>
              <p className="text-sm text-gray-500">
                {formatDate(incident.incident_date)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleEdit}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
              className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Severity</dt>
                <dd className="mt-1">
                  <span 
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: SEVERITY_COLORS[incident.severity] }}
                  >
                    {incident.severity}
                  </span>
                </dd>
              </div>
              
              {incident.duration_minutes && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Duration</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatDuration(incident.duration_minutes)}
                  </dd>
                </div>
              )}
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Recorded</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatDate(incident.created_at)}
                </dd>
              </div>
            </dl>
          </div>

          {/* Symptoms */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Symptoms</h2>
            <div className="flex flex-wrap gap-2">
              {incident.symptoms.map((symptom, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-md text-sm bg-blue-100 text-blue-800"
                >
                  {symptom}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Potential Triggers */}
        {((incident.foods && incident.foods.length > 0) || 
          (incident.activities && incident.activities.length > 0)) && (
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Potential Triggers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {incident.foods && incident.foods.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Foods</h3>
                  <div className="flex flex-wrap gap-2">
                    {incident.foods.map((food, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-md text-sm bg-orange-100 text-orange-800"
                      >
                        🍽️ {food}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {incident.activities && incident.activities.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Activities</h3>
                  <div className="flex flex-wrap gap-2">
                    {incident.activities.map((activity, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-md text-sm bg-green-100 text-green-800"
                      >
                        🏃 {activity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Environmental Factors */}
        {incident.environmental_factors && 
         Object.keys(incident.environmental_factors).length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Environmental Factors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(incident.environmental_factors).map(([key, value]) => (
                value && (
                  <div key={key}>
                    <dt className="text-sm font-medium text-gray-500 capitalize">
                      {key.replace(/_/g, ' ')}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {typeof value === 'number' ? value : String(value)}
                      {key === 'temperature' && '°F'}
                      {key === 'humidity' && '%'}
                    </dd>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* Medications */}
        {incident.medications && incident.medications.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Medications Taken</h2>
            <div className="flex flex-wrap gap-2">
              {incident.medications.map((medication, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-md text-sm bg-purple-100 text-purple-800"
                >
                  💊 {medication}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {incident.notes && (
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Notes</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {incident.notes}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      {showNavigation && (previousIncidentId || nextIncidentId) && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between">
            {previousIncidentId ? (
              <Link
                href={`/incidents/${previousIncidentId}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </Link>
            ) : (
              <div />
            )}
            
            {nextIncidentId ? (
              <Link
                href={`/incidents/${nextIncidentId}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Next
                <svg className="ml-2 -mr-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowDeleteConfirm(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Incident
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this incident? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}