'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Header from './Header'
import Sidebar from './Sidebar'
import { getUser } from '@/lib/auth'
import { cn } from '@/lib/utils'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Check if current route requires authentication
  const isAuthRoute = pathname?.startsWith('/auth')
  const isPublicRoute = pathname === '/' || isAuthRoute

  useEffect(() => {
    const checkUser = async () => {
      try {
        // Check demo mode first
        const demoMode = typeof window !== 'undefined' && localStorage.getItem('demo-mode') === 'true'
        setIsDemoMode(demoMode)
        
        const currentUser = await getUser()
        setUser(currentUser)
        
        // Allow access if user is authenticated OR in demo mode
        const hasAccess = currentUser || demoMode
        
        // Redirect to signin if not authenticated/demo and trying to access protected route
        if (!hasAccess && !isPublicRoute) {
          router.push('/auth/signin')
        }
        // Redirect to dashboard if authenticated and on auth pages (but not in demo mode)
        else if (currentUser && isAuthRoute && !demoMode) {
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('Error checking user:', error)
        // Check demo mode even if auth fails
        const demoMode = typeof window !== 'undefined' && localStorage.getItem('demo-mode') === 'true'
        setIsDemoMode(demoMode)
        
        if (!demoMode && !isPublicRoute) {
          router.push('/auth/signin')
        }
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [pathname, router, isPublicRoute, isAuthRoute])

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // For public routes (home, auth pages), show simple layout
  if (isPublicRoute) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user || (isDemoMode ? { demo: true } : null)} />
        <main>{children}</main>
      </div>
    )
  }

  // For authenticated routes (including demo mode), show full app layout with sidebar
  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user || (isDemoMode ? { demo: true } : null)} />
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="w-64 bg-white shadow-lg">
            <div className="flex flex-col h-full">
              {/* Sidebar header */}
              <div className="flex items-center h-16 px-4 border-b border-gray-200">
                <span className="text-lg font-semibold text-gray-900">Navigation</span>
              </div>

              {/* Navigation items */}
              <nav className="flex-1 px-4 py-6 space-y-2">
                {[
                  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
                  { name: 'Add Incident', href: '/incidents/new', icon: '➕' },
                  { name: 'View Incidents', href: '/incidents', icon: '📋' },
                  { name: 'Analytics', href: '/analytics', icon: '📈' },
                ].map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                        isActive
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      )}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.name}
                    </Link>
                  )
                })}
              </nav>

              {/* Sidebar footer */}
              <div className="p-4 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  Allergy Tracker v1.0
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile sidebar toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-4 text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}