'use client'

import { useParams } from 'next/navigation'
import PageHeader from '@/components/layout/PageHeader'
import IncidentDetail from '@/components/incidents/IncidentDetail'
import { useIncident } from '@/hooks/useIncidents'

export default function IncidentDetailPage() {
  const params = useParams()
  const incidentId = params.id as string
  
  const { incident, isLoading, error } = useIncident(incidentId)

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Incident Details"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Incidents', href: '/incidents' },
            { label: 'Details' }
          ]}
        />
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-6">
              <div className="bg-gray-200 h-6 w-48 rounded"></div>
              <div className="flex space-x-2">
                <div className="bg-gray-200 h-8 w-16 rounded"></div>
                <div className="bg-gray-200 h-8 w-20 rounded"></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
              <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
              <div className="bg-gray-200 h-4 w-2/3 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <PageHeader
          title="Incident Details"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Incidents', href: '/incidents' },
            { label: 'Details' }
          ]}
        />
        
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading incident
              </h3>
              <p className="mt-1 text-sm text-red-700">
                {error.message || 'The incident could not be found.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!incident) {
    return (
      <div>
        <PageHeader
          title="Incident Details"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Incidents', href: '/incidents' },
            { label: 'Details' }
          ]}
        />
        
        <div className="text-center py-12">
          <h3 className="mt-2 text-sm font-medium text-gray-900">Incident not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The incident you're looking for doesn't exist or has been deleted.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Incident Details"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Incidents', href: '/incidents' },
          { label: 'Details' }
        ]}
      />
      
      <IncidentDetail incident={incident} />
    </div>
  )
}