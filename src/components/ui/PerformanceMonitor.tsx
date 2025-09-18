'use client'

import { useEffect } from 'react'
import { useWebVitals } from '@/hooks/usePerformance'

export default function PerformanceMonitor() {
  useWebVitals()

  useEffect(() => {
    // Monitor long tasks
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) { // Long task threshold
            console.warn(`[Performance] Long task detected: ${entry.duration.toFixed(2)}ms`)
          }
        }
      })

      try {
        observer.observe({ entryTypes: ['longtask'] })
      } catch (error) {
        console.warn('Long task observer not supported:', error)
      }

      return () => observer.disconnect()
    }
  }, [])

  useEffect(() => {
    // Monitor memory usage (if available)
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const checkMemory = () => {
        const memory = (performance as any).memory
        const usedMB = Math.round(memory.usedJSHeapSize / 1048576)
        const totalMB = Math.round(memory.totalJSHeapSize / 1048576)
        const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576)

        if (usedMB > limitMB * 0.8) { // 80% of limit
          console.warn(`[Performance] High memory usage: ${usedMB}MB / ${limitMB}MB`)
        }

        if (process.env.NODE_ENV === 'development') {
          console.log(`[Memory] Used: ${usedMB}MB, Total: ${totalMB}MB, Limit: ${limitMB}MB`)
        }
      }

      const interval = setInterval(checkMemory, 30000) // Check every 30 seconds
      return () => clearInterval(interval)
    }
  }, [])

  // This component doesn't render anything
  return null
}