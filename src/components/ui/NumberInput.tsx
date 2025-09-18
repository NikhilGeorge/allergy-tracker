'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface NumberInputProps {
  value?: number
  onChange: (value: number | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  min?: number
  max?: number
  step?: number
  unit?: string
}

export default function NumberInput({
  value,
  onChange,
  placeholder = '0',
  disabled = false,
  className,
  min = 0,
  max,
  step = 1,
  unit
}: NumberInputProps) {
  const [inputValue, setInputValue] = useState(value?.toString() || '')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)

    if (newValue === '') {
      onChange(undefined)
      return
    }

    const numValue = parseFloat(newValue)
    if (!isNaN(numValue)) {
      // Apply min/max constraints
      let constrainedValue = numValue
      if (min !== undefined && constrainedValue < min) {
        constrainedValue = min
      }
      if (max !== undefined && constrainedValue > max) {
        constrainedValue = max
      }
      onChange(constrainedValue)
    }
  }

  const handleBlur = () => {
    // Clean up the input value on blur
    if (value !== undefined) {
      setInputValue(value.toString())
    } else {
      setInputValue('')
    }
  }

  const increment = () => {
    const currentValue = value || 0
    const newValue = currentValue + step
    if (max === undefined || newValue <= max) {
      onChange(newValue)
      setInputValue(newValue.toString())
    }
  }

  const decrement = () => {
    const currentValue = value || 0
    const newValue = currentValue - step
    if (newValue >= min) {
      onChange(newValue)
      setInputValue(newValue.toString())
    }
  }

  return (
    <div className={cn('relative flex', className)}>
      <div className="relative flex-1">
        <input
          type="number"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          className={cn(
            'w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm',
            'focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500',
            'text-gray-900 placeholder-gray-500', // Dark text for better readability
            disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed',
            !disabled && 'bg-white',
            unit && 'pr-12' // Make room for unit label
          )}
        />
        
        {/* Unit label */}
        {unit && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className="text-sm text-gray-500">{unit}</span>
          </div>
        )}
      </div>

      {/* Increment/Decrement buttons */}
      {!disabled && (
        <div className="flex flex-col ml-1">
          <button
            type="button"
            onClick={increment}
            disabled={max !== undefined && (value || 0) >= max}
            className={cn(
              'px-2 py-1 text-xs border border-gray-300 rounded-t-md bg-white hover:bg-gray-50',
              'focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500',
              'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed'
            )}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={decrement}
            disabled={(value || 0) <= min}
            className={cn(
              'px-2 py-1 text-xs border border-gray-300 border-t-0 rounded-b-md bg-white hover:bg-gray-50',
              'focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500',
              'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed'
            )}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}