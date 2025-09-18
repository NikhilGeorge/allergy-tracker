import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

export interface AuthError {
  message: string
  status?: number
}

export interface SignUpData {
  email: string
  password: string
  firstName?: string
  lastName?: string
}

export interface SignInData {
  email: string
  password: string
}

// Sign up new user
export const signUp = async ({ email, password, firstName, lastName }: SignUpData) => {
  if (!supabase) throw new Error('Supabase not configured')
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    })

    if (error) {
      throw new Error(error.message)
    }

    return { user: data.user, session: data.session }
  } catch (error) {
    console.error('Sign up error:', error)
    throw error
  }
}

// Sign in existing user
export const signIn = async ({ email, password }: SignInData) => {
  if (!supabase) throw new Error('Supabase not configured')
  try {
    // Clear any existing user data before signing in
    if (typeof window !== 'undefined') {
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.includes('demo-') || key.includes('user-') || key.includes('incident-'))) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new Error(error.message)
    }

    return { user: data.user, session: data.session }
  } catch (error) {
    console.error('Sign in error:', error)
    throw error
  }
}

// Sign out user
export const signOut = async () => {
  if (!supabase) throw new Error('Supabase not configured')
  try {
    // Clear any demo mode data and localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('demo-mode')
      // Clear any other user-specific localStorage data
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.includes('demo-') || key.includes('user-') || key.includes('incident-'))) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))
    }
    
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
  } catch (error) {
    console.error('Sign out error:', error)
    throw error
  }
}

// Get current session
export const getSession = async () => {
  if (!supabase) return null
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
      throw new Error(error.message)
    }
    return session
  } catch (error) {
    console.error('Get session error:', error)
    return null
  }
}

// Get current user
export const getUser = async (): Promise<User | null> => {
  if (!supabase) return null
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      throw new Error(error.message)
    }
    return user
  } catch (error) {
    console.error('Get user error:', error)
    return null
  }
}

// Reset password
export const resetPassword = async (email: string) => {
  if (!supabase) throw new Error('Supabase not configured')
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      throw new Error(error.message)
    }
  } catch (error) {
    console.error('Reset password error:', error)
    throw error
  }
}

// Update password
export const updatePassword = async (newPassword: string) => {
  if (!supabase) throw new Error('Supabase not configured')
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      throw new Error(error.message)
    }
  } catch (error) {
    console.error('Update password error:', error)
    throw error
  }
}

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  if (!supabase) return { data: { subscription: null } }
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null)
  })
}

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  // Check if in demo mode first
  if (typeof window !== 'undefined' && localStorage.getItem('demo-mode') === 'true') {
    return true
  }
  
  const user = await getUser()
  return !!user
}

// Get user ID safely
export const getUserId = async (): Promise<string | null> => {
  // Check if in demo mode first
  if (typeof window !== 'undefined' && localStorage.getItem('demo-mode') === 'true') {
    return 'demo-user'
  }
  
  const user = await getUser()
  return user?.id ?? null
}