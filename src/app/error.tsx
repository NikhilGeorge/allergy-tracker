'use client'

import { useEffect } from 'react'
import { ErrorHandler } from '@/lib/errors'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    ErrorHandler.logError(error, 'Global Error Page')
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 text-red-500">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" 
              />
            </svg>
          </div>
          
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Oops! Something went wrong
          </h1>
          
          <p className="mt-4 text-base text-gray-600">
            {ErrorHandler.getUserMessage(error)}
          </p>
          
          <div className="mt-8 space-y-4">
            <button
              onClick={reset}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Try again
            </button>
            
            <a
              href="/"
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Go to homepage
            </a>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              If this problem persists, please try refreshing the page or contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}