'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" 
              />
            </svg>
          </div>
          
          <h1 className="mt-6 text-6xl font-bold tracking-tight text-gray-900">
            404
          </h1>
          
          <h2 className="mt-4 text-2xl font-semibold text-gray-700">
            Page not found
          </h2>
          
          <p className="mt-4 text-base text-gray-600">
            Sorry, we couldn't find the page you're looking for. The page may have been moved or doesn't exist.
          </p>
          
          <div className="mt-8 space-y-4">
            <Link
              href="/"
              className="inline-flex justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Go to homepage
            </Link>
            
            <div className="text-center">
              <button
                onClick={() => window.history.back()}
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                ← Go back to previous page
              </button>
            </div>
          </div>
          
          <div className="mt-8">
            <p className="text-sm text-gray-500">
              Common pages you might be looking for:
            </p>
            <div className="mt-2 space-y-1">
              <Link href="/dashboard" className="block text-sm text-blue-600 hover:text-blue-500">
                Dashboard
              </Link>
              <Link href="/incidents" className="block text-sm text-blue-600 hover:text-blue-500">
                View Incidents
              </Link>
              <Link href="/incidents/new" className="block text-sm text-blue-600 hover:text-blue-500">
                Add New Incident
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}