'use client'

import { SWRConfig, mutate } from 'swr'
import { useEffect, useRef } from 'react'
import { onAuthStateChange } from '@/lib/auth'
import type { User } from '@supabase/supabase-js'

interface SWRProviderProps {
  children: React.ReactNode
}

export default function SWRProvider({ children }: SWRProviderProps) {
  const currentUserRef = useRef<string | null>(null)

  useEffect(() => {
    // Listen to auth state changes
    const { data: { subscription } } = onAuthStateChange((user: User | null) => {
      const newUserId = user?.id || null
      const previousUserId = currentUserRef.current

      // If user changed (including logout/login), clear all caches
      if (previousUserId !== newUserId) {
        console.log('User changed, clearing all SWR caches', { 
          from: previousUserId, 
          to: newUserId 
        })
        
        // Clear all SWR caches immediately
        mutate(() => true, undefined, { revalidate: false })
        
        // Also clear any user-specific localStorage data
        if (typeof window !== 'undefined') {
          const keysToRemove = []
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && (
              key.includes('demo-incidents') || 
              key.includes('user-data') || 
              key.includes('incident-') ||
              key.includes('analytics-') ||
              key.includes('dashboard-')
            )) {
              keysToRemove.push(key)
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key))
        }
        
        // Update the current user reference
        currentUserRef.current = newUserId
        
        // Force a small delay then revalidate to fetch new user's data
        setTimeout(() => {
          mutate(() => true, undefined, { revalidate: true })
        }, 100)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])
  return (
    <SWRConfig
      value={{
        onError: (error, key) => {
          // Only log in development, and less frequently
          if (process.env.NODE_ENV === 'development') {
            console.warn(`SWR Error for key: ${key}`, error)
          }
        },
        onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
          // Don't retry on 404 or authentication errors
          if (error?.status === 404 || error?.status === 401) return
          
          // Don't retry after 2 attempts
          if (retryCount >= 2) return
          
          // Retry with longer delays
          setTimeout(() => revalidate({ retryCount }), 5000 * Math.pow(2, retryCount))
        },
        shouldRetryOnError: (error) => {
          // Only retry on network errors, not application errors
          return !error?.status || error.status >= 500
        },
        // Caching configuration - less aggressive
        dedupingInterval: 5000, // Dedupe requests within 5 seconds
        focusThrottleInterval: 30000, // Throttle revalidation on focus to 30 seconds
        loadingTimeout: 10000, // 10 second timeout
        errorRetryInterval: 10000, // Retry failed requests every 10 seconds
        errorRetryCount: 2, // Maximum retry attempts
        
        // Cache configuration - less aggressive revalidation
        revalidateOnFocus: false, // Don't revalidate on focus
        revalidateOnReconnect: true, // Revalidate when network reconnects
        revalidateIfStale: false, // Don't auto-revalidate stale data
        
        // Performance optimizations
        keepPreviousData: true, // Keep previous data while fetching new data
        
        // Disable auto-refresh to prevent constant reloading
        refreshInterval: 0
      }}
    >
      {children}
    </SWRConfig>
  )
}