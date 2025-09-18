'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full px-3 py-2 text-sm border rounded-md shadow-sm resize-vertical',
          'focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500',
          'text-gray-900 placeholder:text-gray-500', // Dark text for better readability
          error 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300',
          props.disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed',
          !props.disabled && 'bg-white',
          className
        )}
        {...props}
      />
    )
  }
)

Textarea.displayName = 'Textarea'

export default Textarea