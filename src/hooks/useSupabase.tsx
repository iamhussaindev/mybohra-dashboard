'use client'

import { authService, isSupabaseConfigured } from '@lib/api'
import { User } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false)
      return
    }

    // Get initial user
    const getInitialUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        console.log('No user logged in')
      } finally {
        setLoading(false)
      }
    }

    getInitialUser()

    // Listen to auth state changes
    const {
      data: { subscription },
    } = authService.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const result = await authService.signIn(email, password)
      return result
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string) => {
    setLoading(true)
    try {
      const result = await authService.signUp(email, password)
      return result
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await authService.signOut()
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isConfigured: isSupabaseConfigured(),
  }
}

export function useSupabaseData<T>(table: string, dependencies: unknown[] = []) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    if (!isSupabaseConfigured()) {
      setError('Supabase is not configured')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { SupabaseService } = await import('@lib/api')
      const result = await SupabaseService.select<T>(table)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, dependencies)

  const refetch = () => {
    fetchData()
  }

  return {
    data,
    loading,
    error,
    refetch,
  }
}
