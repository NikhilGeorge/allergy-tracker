'use client'

import { useEffect, useRef } from 'react'

interface PerformanceMetrics {
  componentName: string
  renderTime: number
  timestamp: number
}

export function usePerformanceMonitor(componentName: string) {
  const renderStartTime = useRef<number>(0)
  const mountTime = useRef<number>(0)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      mountTime.current = performance.now()
      
      return () => {
        const unmountTime = performance.now()
        const totalLifetime = unmountTime - mountTime.current
        
        // Disabled to prevent console spam
        // if (process.env.NODE_ENV === 'development') {
        //   console.log(`[Performance] ${componentName} lifetime: ${totalLifetime.toFixed(2)}ms`)
        // }
      }
    }
  }, [componentName])

  const startRender = () => {
    if (typeof window !== 'undefined') {
      renderStartTime.current = performance.now()
    }
  }

  const endRender = () => {
    if (typeof window !== 'undefined') {
      const renderTime = performance.now() - renderStartTime.current
      
      // Disabled to prevent console spam
      // if (process.env.NODE_ENV === 'development') {
      //   console.log(`[Performance] ${componentName} render: ${renderTime.toFixed(2)}ms`)
      // }

      // Log slow renders (>16ms for 60fps) - disabled in dev
      // if (renderTime > 16) {
      //   console.warn(`[Performance] Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`)
      // }

      return renderTime
    }
    return 0
  }

  return { startRender, endRender }
}

export function useWebVitals() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Disabled in development to prevent console spam
    if (process.env.NODE_ENV === 'development') return

    // Measure Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const metric = {
          name: entry.name,
          value: entry.value,
          timestamp: entry.startTime
        }

        // In production, you might want to send this to an analytics service
        // analytics.track('web_vital', metric)
      }
    })

    // Observe different performance metrics
    try {
      observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] })
    } catch (error) {
      // Silently fail
    }

    return () => {
      observer.disconnect()
    }
  }, [])
}

export function measureAsync<T>(
  name: string,
  asyncFn: () => Promise<T>
): Promise<T> {
  const startTime = performance.now()
  
  return asyncFn().finally(() => {
    const duration = performance.now() - startTime
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`)
    }

    // Log slow operations (>100ms)
    if (duration > 100) {
      console.warn(`[Performance] Slow operation detected in ${name}: ${duration.toFixed(2)}ms`)
    }
  })
}