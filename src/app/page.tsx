'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is in demo mode
    if (typeof window !== 'undefined' && localStorage.getItem('demo-mode') === 'true') {
      router.push('/dashboard')
    }
  }, [router])

  const handleDemoMode = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('demo-mode', 'true')
    }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Allergy Tracker
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Track your allergy incidents and discover patterns
          </p>
          
          <div className="max-w-md mx-auto space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
              <p className="text-gray-600 mb-6">
                Welcome to your personal allergy tracking application. 
                Start by logging your first allergy incident to begin 
                understanding your triggers and patterns.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={handleDemoMode}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Try Demo Mode
                </button>
                
                <div className="flex space-x-3">
                  <Link
                    href="/auth/signin"
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md text-center transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md text-center transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            </div>
            

          </div>
        </div>
      </div>
    </div>
  );
}