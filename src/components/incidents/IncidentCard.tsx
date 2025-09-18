'use client'

import Link from 'next/link'
import { formatDate, formatDuration } from '@/lib/utils'
import { SEVERITY_COLORS } from '@/types'
import type { Incident } from '@/types'

interface IncidentCardProps {
  incident: Incident
  onClick?: () => void
  showActions?: boolean
}

export default function IncidentCard({ 
  incident, 
  onClick, 
  showActions = true 
}: IncidentCardProps) {
  const handleCardClick = () => {
    if (onClick) {
      onClick()
    }
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Severity indicator bar */}
      <div 
        className="h-1 rounded-t-lg"
        style={{ backgroundColor: SEVERITY_COLORS[incident.severity] }}
      />
      
      <div className="p-4">
        {/* Header with date and severity */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-900">
              {formatDate(incident.incident_date)}
            </span>
            <span 
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
              style={{ 
                backgroundColor: `${SEVERITY_COLORS[incident.severity]}20`,
                color: SEVERITY_COLORS[incident.severity]
              }}
            >
              {incident.severity}
            </span>
          </div>
          
          {incident.duration_minutes && (
            <span className="text-xs text-gray-500">
              {formatDuration(incident.duration_minutes)}
            </span>
          )}
        </div>

        {/* Symptoms */}
        <div className="mb-3">
          <h3 className="text-sm font-medium text-gray-900 mb-1">Symptoms</h3>
          <div className="flex flex-wrap gap-1">
            {incident.symptoms.slice(0, 3).map((symptom, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-50 text-blue-700"
              >
                {symptom}
              </span>
            ))}
            {incident.symptoms.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-600">
                +{incident.symptoms.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Triggers */}
        {(incident.foods && incident.foods.length > 0) || 
         (incident.activities && incident.activities.length > 0) ? (
          <div className="mb-3">
            <h4 className="text-xs font-medium text-gray-700 mb-1">Potential Triggers</h4>
            <div className="flex flex-wrap gap-1">
              {incident.foods?.slice(0, 2).map((food, index) => (
                <span
                  key={`food-${index}`}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-orange-50 text-orange-700"
                >
                  🍽️ {food}
                </span>
              ))}
              {incident.activities?.slice(0, 2).map((activity, index) => (
                <span
                  key={`activity-${index}`}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-green-50 text-green-700"
                >
                  🏃 {activity}
                </span>
              ))}
              {((incident.foods?.length || 0) + (incident.activities?.length || 0)) > 4 && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-600">
                  +{((incident.foods?.length || 0) + (incident.activities?.length || 0)) - 4} more
                </span>
              )}
            </div>
          </div>
        ) : null}

        {/* Notes preview */}
        {incident.notes && (
          <div className="mb-3">
            <p className="text-xs text-gray-600 line-clamp-2">
              {incident.notes.length > 100 
                ? `${incident.notes.substring(0, 100)}...` 
                : incident.notes
              }
            </p>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              {incident.medications && incident.medications.length > 0 && (
                <span className="flex items-center">
                  💊 {incident.medications.length} medication{incident.medications.length > 1 ? 's' : ''}
                </span>
              )}
              {incident.environmental_factors && 
               Object.keys(incident.environmental_factors).length > 0 && (
                <span className="flex items-center">
                  🌡️ Environmental data
                </span>
              )}
            </div>
            
            <Link
              href={`/incidents/${incident.id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              View Details →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}