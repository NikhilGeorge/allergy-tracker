'use client'

import { useEffect, useRef } from 'react'
import { UseFormWatch } from 'react-hook-form'

interface UseFormAutoSaveOptions {
  key: string
  watch: UseFormWatch<any>
  setValue: (name: string, value: any) => void
  delay?: number
}

export function useFormAutoSave({ key, watch, setValue, delay = 2000 }: UseFormAutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const isLoadingRef = useRef(false)

  // Load saved data on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`form-draft-${key}`)
      if (saved) {
        try {
          const data = JSON.parse(saved)
          Object.keys(data).forEach(fieldName => {
            setValue(fieldName, data[fieldName])
          })
          isLoadingRef.current = true
        } catch (error) {
          console.error('Error loading form draft:', error)
        }
      }
    }
  }, [key, setValue])

  // Watch for changes and save
  useEffect(() => {
    const subscription = watch((data) => {
      // Skip saving during initial load
      if (isLoadingRef.current) {
        isLoadingRef.current = false
        return
      }

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Set new timeout to save
      timeoutRef.current = setTimeout(() => {
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(`form-draft-${key}`, JSON.stringify(data))
          } catch (error) {
            console.error('Error saving form draft:', error)
          }
        }
      }, delay)
    })

    return () => {
      subscription.unsubscribe()
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [watch, key, delay])

  // Clear draft function
  const clearDraft = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`form-draft-${key}`)
    }
  }

  return { clearDraft }
}