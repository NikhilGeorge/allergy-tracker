/**
 * Custom error classes for better error handling
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTH_REQUIRED')
    this.name = 'AuthenticationError'
  }
}

export class ValidationError extends ApiError {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class NetworkError extends ApiError {
  constructor(message = 'Network error occurred') {
    super(message, 0, 'NETWORK_ERROR')
    this.name = 'NetworkError'
  }
}

/**
 * Error handling utilities
 */
export const ErrorHandler = {
  /**
   * Get user-friendly error message
   */
  getUserMessage(error: unknown): string {
    if (error instanceof AuthenticationError) {
      return 'Please sign in to continue'
    }
    
    if (error instanceof ValidationError) {
      return error.message
    }
    
    if (error instanceof NotFoundError) {
      return 'The requested item was not found'
    }
    
    if (error instanceof NetworkError) {
      return 'Unable to connect. Please check your internet connection'
    }
    
    if (error instanceof ApiError) {
      return error.message
    }
    
    if (error instanceof Error) {
      return error.message
    }
    
    return 'An unexpected error occurred'
  },

  /**
   * Check if error is retryable
   */
  isRetryable(error: unknown): boolean {
    if (error instanceof NetworkError) return true
    if (error instanceof ApiError && error.status && error.status >= 500) return true
    return false
  },

  /**
   * Log error for debugging
   */
  logError(error: unknown, context?: string) {
    const errorInfo = {
      message: this.getUserMessage(error),
      context,
      timestamp: new Date().toISOString(),
      ...(error instanceof ApiError && {
        status: error.status,
        code: error.code
      })
    }
    
    console.error('Application Error:', errorInfo)
    
    // In production, you might want to send this to an error tracking service
    // like Sentry, LogRocket, etc.
  }
}

/**
 * Retry utility for failed operations
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: unknown
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      if (attempt === maxRetries || !ErrorHandler.isRetryable(error)) {
        throw error
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)))
    }
  }
  
  throw lastError
}

/**
 * Safe async operation wrapper
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  fallback?: T
): Promise<{ data: T | undefined; error: string | null }> {
  try {
    const data = await operation()
    return { data, error: null }
  } catch (error) {
    const errorMessage = ErrorHandler.getUserMessage(error)
    ErrorHandler.logError(error, 'safeAsync')
    return { data: fallback, error: errorMessage }
  }
}