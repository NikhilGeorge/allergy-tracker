'use client'

import { useCallback } from 'react'
import { useToast } from '@/hooks/useToast'
import { ErrorHandler, ApiError, AuthenticationError, ValidationError, NetworkError } from '@/lib/errors'

export function useErrorHandler() {
  const { showToast } = useToast()

  const handleError = useCallback((error: unknown, context?: string) => {
    ErrorHandler.logError(error, context)
    
    let title = 'Error'
    let description = ErrorHandler.getUserMessage(error)
    let type: 'error' | 'warning' = 'error'

    if (error instanceof AuthenticationError) {
      title = 'Authentication Required'
      description = 'Please sign in to continue'
      type = 'warning'
    } else if (error instanceof ValidationError) {
      title = 'Validation Error'
      description = error.message
    } else if (error instanceof NetworkError) {
      title = 'Connection Error'
      description = 'Please check your internet connection and try again'
      type = 'warning'
    } else if (error instanceof ApiError) {
      title = 'Server Error'
      description = error.message
    }

    showToast({
      type,
      title,
      description,
      duration: type === 'error' ? 8000 : 5000
    })
  }, [showToast])

  const handleAsyncError = useCallback(async <T>(
    operation: () => Promise<T>,
    context?: string,
    options?: {
      showSuccess?: boolean
      successMessage?: string
      retryable?: boolean
    }
  ): Promise<{ data: T | null; error: boolean }> => {
    try {
      const data = await operation()
      
      if (options?.showSuccess) {
        showToast({
          type: 'success',
          title: 'Success',
          description: options.successMessage || 'Operation completed successfully'
        })
      }
      
      return { data, error: false }
    } catch (error) {
      handleError(error, context)
      return { data: null, error: true }
    }
  }, [handleError, showToast])

  const withErrorHandling = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    context?: string
  ) => {
    return async (...args: T): Promise<R | null> => {
      try {
        return await fn(...args)
      } catch (error) {
        handleError(error, context)
        return null
      }
    }
  }, [handleError])

  return {
    handleError,
    handleAsyncError,
    withErrorHandling
  }
}