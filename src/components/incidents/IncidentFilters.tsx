'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { SEVERITY_COLORS } from '@/types'
import type { IncidentFilters, SeverityLevel } from '@/types'

interface IncidentFiltersProps {
  filters: IncidentFilters
  onFiltersChange: (filters: IncidentFilters) => void
  onClearFilters: () => void
  className?: string
}

export default function IncidentFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  className
}: IncidentFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search: search || undefined })
  }

  const handleSeverityToggle = (severity: SeverityLevel) => {
    const currentSeverities = filters.severity || []
    const newSeverities = currentSeverities.includes(severity)
      ? currentSeverities.filter(s => s !== severity)
      : [...currentSeverities, severity]
    
    onFiltersChange({ 
      ...filters, 
      severity: newSeverities.length > 0 ? newSeverities : undefined 
    })
  }

  const handleDateFromChange = (date: string) => {
    onFiltersChange({ 
      ...filters, 
      dateFrom: date ? new Date(date) : undefined 
    })
  }

  const handleDateToChange = (date: string) => {
    onFiltersChange({ 
      ...filters, 
      dateTo: date ? new Date(date) : undefined 
    })
  }

  const hasActiveFilters = !!(
    filters.search || 
    filters.severity?.length || 
    filters.dateFrom || 
    filters.dateTo ||
    filters.symptoms?.length ||
    filters.foods?.length
  )

  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200', className)}>
      <div className="p-4">
        {/* Search bar */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search incidents..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Quick filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Severity:</span>
            {(['Mild', 'Moderate', 'Severe'] as SeverityLevel[]).map((severity) => (
              <button
                key={severity}
                onClick={() => handleSeverityToggle(severity)}
                className={cn(
                  'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors',
                  filters.severity?.includes(severity)
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
                style={{
                  backgroundColor: filters.severity?.includes(severity) 
                    ? SEVERITY_COLORS[severity] 
                    : undefined
                }}
              >
                {severity}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear filters
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              {isExpanded ? 'Less filters' : 'More filters'}
              <svg 
                className={cn('ml-1 h-4 w-4 transition-transform', isExpanded && 'rotate-180')}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Expanded filters */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleDateFromChange(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleDateToChange(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Active filters summary */}
            {hasActiveFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Active filters:</span>
                  <div className="flex flex-wrap gap-2">
                    {filters.search && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-100 text-blue-800">
                        Search: "{filters.search}"
                      </span>
                    )}
                    {filters.severity?.map(severity => (
                      <span 
                        key={severity}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs text-white"
                        style={{ backgroundColor: SEVERITY_COLORS[severity] }}
                      >
                        {severity}
                      </span>
                    ))}
                    {filters.dateFrom && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-green-100 text-green-800">
                        From: {filters.dateFrom.toLocaleDateString()}
                      </span>
                    )}
                    {filters.dateTo && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-green-100 text-green-800">
                        To: {filters.dateTo.toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}