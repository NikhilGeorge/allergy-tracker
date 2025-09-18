'use client'

import { cn } from '@/lib/utils'

interface DateTimePickerProps {
  value: Date | string | null | undefined
  onChange: (date: Date) => void
  disabled?: boolean
  className?: string
  max?: string // ISO string for max date
  min?: string // ISO string for min date
}

export default function DateTimePicker({
  value,
  onChange,
  disabled = false,
  className,
  max,
  min
}: DateTimePickerProps) {
  // Convert Date to datetime-local format (YYYY-MM-DDTHH:MM) in local timezone
  const formatDateTimeLocal = (date: Date | string | null | undefined): string => {
    // Handle null/undefined values
    if (!date) {
      const now = new Date()
      // Use local timezone, not UTC
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}`
    }
    
    // Convert to Date object if it's a string
    const dateObj = date instanceof Date ? date : new Date(date)
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date provided to DateTimePicker:', date)
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}`
    }
    
    // Format in local timezone (not UTC)
    const year = dateObj.getFullYear()
    const month = String(dateObj.getMonth() + 1).padStart(2, '0')
    const day = String(dateObj.getDate()).padStart(2, '0')
    const hours = String(dateObj.getHours()).padStart(2, '0')
    const minutes = String(dateObj.getMinutes()).padStart(2, '0')
    
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  // Convert datetime-local format to Date
  const parseDateTimeLocal = (dateTimeString: string): Date => {
    if (!dateTimeString) {
      return new Date()
    }
    
    const date = new Date(dateTimeString)
    
    // Validate the parsed date
    if (isNaN(date.getTime())) {
      return new Date()
    }
    
    return date
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = parseDateTimeLocal(e.target.value)
    onChange(newDate)
  }

  // Set default max to allow current time plus a reasonable buffer
  // For allergy tracking, users should be able to record current incidents
  const maxDateTime = max || (() => {
    const now = new Date()
    // Allow up to 1 hour in the future to account for timezone differences
    // This ensures users can always record "current" incidents
    const maxTime = new Date(now.getTime() + 60 * 60 * 1000) // Add 1 hour
    return formatDateTimeLocal(maxTime)
  })()

  return (
    <div className={cn('relative', className)}>
      <input
        type="datetime-local"
        value={formatDateTimeLocal(value)}
        onChange={handleChange}
        disabled={disabled}
        max={maxDateTime}
        min={min}
        className={cn(
          'w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm',
          'focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500',
          'text-gray-900', // Dark text for better readability
          disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed',
          !disabled && 'bg-white hover:border-gray-400'
        )}
      />
      
      {/* Calendar icon */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </div>
  )
}