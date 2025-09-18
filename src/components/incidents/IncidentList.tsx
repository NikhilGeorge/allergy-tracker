'use client'

import { useState, useMemo, memo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useIncidents } from '@/hooks/useIncidents'
import IncidentCard from './IncidentCard'
import IncidentFilters from './IncidentFilters'
import Pagination from '@/components/ui/Pagination'
import type { IncidentFilters as IIncidentFilters, IncidentSearchParams } from '@/types'

interface IncidentListProps {
  initialFilters?: IIncidentFilters
  showFilters?: boolean
  pageSize?: number
  className?: string
}

const IncidentList = memo(function IncidentList({
  initialFilters = {},
  showFilters = true,
  pageSize = 20,
  className
}: IncidentListProps) {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<IIncidentFilters>(initialFilters)

  // Build search params
  const searchParams: IncidentSearchParams = useMemo(() => ({
    page: currentPage,
    limit: pageSize,
    filters,
    sortBy: 'incident_date',
    sortOrder: 'desc'
  }), [currentPage, pageSize, filters])

  const { incidents, pagination, isLoading, error } = useIncidents(searchParams)

  // Memoized callbacks for better performance
  const handleFiltersChange = useCallback((newFilters: IIncidentFilters) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
  }, [])

  const handleClearFilters = useCallback(() => {
    setFilters({})
    setCurrentPage(1)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const handleIncidentClick = useCallback((incidentId: string) => {
    router.push(`/incidents/${incidentId}`)
  }, [router])



  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error loading incidents
            </h3>
            <p className="mt-1 text-sm text-red-700">{error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Filters */}
      {showFilters && (
        <div className="mb-6">
          <IncidentFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="animate-pulse">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-gray-200 h-4 w-32 rounded"></div>
                  <div className="bg-gray-200 h-4 w-16 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
                  <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Incidents list */}
      {!isLoading && incidents.length > 0 && (
        <>
          <div className="space-y-4 mb-6">
            {incidents.map((incident) => (
              <IncidentCard
                key={incident.id}
                incident={incident}
                onClick={() => handleIncidentClick(incident.id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
            />
          )}
        </>
      )}

      {/* Empty state */}
      {!isLoading && incidents.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No incidents found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {Object.keys(filters).length > 0
              ? 'Try adjusting your filters or search terms.'
              : 'Get started by recording your first allergy incident.'}
          </p>
          {Object.keys(filters).length === 0 && (
            <div className="mt-6">
              <button
                onClick={() => router.push('/incidents/new')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add First Incident
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
})

export default IncidentList