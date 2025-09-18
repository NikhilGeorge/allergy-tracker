'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { SEVERITY_COLORS } from '@/types'
import type { SeverityLevel } from '@/types'

interface SeveritySelectorProps {
  value: SeverityLevel
  onChange: (severity: SeverityLevel) => void
  disabled?: boolean
  className?: string
}

const severityOptions: { value: SeverityLevel; label: string; description: string }[] = [
  {
    value: 'Mild',
    label: 'Mild',
    description: 'Minor symptoms, minimal impact on daily activities'
  },
  {
    value: 'Moderate',
    label: 'Moderate',
    description: 'Noticeable symptoms, some impact on daily activities'
  },
  {
    value: 'Severe',
    label: 'Severe',
    description: 'Significant symptoms, major impact or emergency care needed'
  }
]

export default function SeveritySelector({
  value,
  onChange,
  disabled = false,
  className
}: SeveritySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedOption = severityOptions.find(option => option.value === value)

  const handleSelect = (severity: SeverityLevel) => {
    onChange(severity)
    setIsOpen(false)
  }

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm',
          'focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500',
          disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed',
          !disabled && 'hover:bg-gray-50'
        )}
      >
        <div className="flex items-center space-x-3">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: SEVERITY_COLORS[value] }}
          />
          <div>
            <span className="block text-sm font-medium text-gray-900">
              {selectedOption?.label}
            </span>
            <span className="block text-xs text-gray-500">
              {selectedOption?.description}
            </span>
          </div>
        </div>
        
        <svg
          className={cn(
            'w-5 h-5 text-gray-400 transition-transform',
            isOpen && 'transform rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          {severityOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={cn(
                'w-full flex items-center space-x-3 px-3 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none',
                value === option.value && 'bg-blue-50'
              )}
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: SEVERITY_COLORS[option.value] }}
              />
              <div>
                <span className="block text-sm font-medium text-gray-900">
                  {option.label}
                </span>
                <span className="block text-xs text-gray-500">
                  {option.description}
                </span>
              </div>
              {value === option.value && (
                <svg className="w-5 h-5 text-blue-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}