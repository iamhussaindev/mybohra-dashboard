import { isSupabaseConfigured, supabase } from '@lib/config/supabase'

// Generic database operations
export class SupabaseService {
  // Generic select operation
  static async select<T>(table: string, columns: string = '*', filters?: Record<string, any>) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please check your environment variables.')
    }

    let query = supabase.from(table).select(columns)

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    return data as T[]
  }

  // Generic insert operation
  static async insert<T>(table: string, data: Partial<T> | Partial<T>[]) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please check your environment variables.')
    }

    const { data: result, error } = await supabase.from(table).insert(data).select()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    return result as T[]
  }

  // Generic update operation
  static async update<T>(table: string, data: Partial<T>, filters: Record<string, any>) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please check your environment variables.')
    }

    let query = supabase.from(table).update(data)

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })

    const { data: result, error } = await query.select()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    return result as T[]
  }

  // Generic delete operation
  static async delete(table: string, filters: Record<string, any>) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please check your environment variables.')
    }

    let query = supabase.from(table).delete()

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })

    const { error } = await query

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    return true
  }
}

// Authentication helpers
export const authService = {
  // Sign up with email and password
  async signUp(email: string, password: string) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please check your environment variables.')
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      throw new Error(`Authentication error: ${error.message}`)
    }

    return data
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please check your environment variables.')
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new Error(`Authentication error: ${error.message}`)
    }

    return data
  },

  // Sign out
  async signOut() {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please check your environment variables.')
    }

    const { error } = await supabase.auth.signOut()

    if (error) {
      throw new Error(`Authentication error: ${error.message}`)
    }

    return true
  },

  // Get current user
  async getCurrentUser() {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please check your environment variables.')
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      throw new Error(`Authentication error: ${error.message}`)
    }

    return user
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please check your environment variables.')
    }

    return supabase.auth.onAuthStateChange(callback)
  },
}

// Real-time subscription helpers
export const realtimeService = {
  // Subscribe to table changes
  subscribeToTable(table: string, callback: (payload: any) => void, event: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*') {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please check your environment variables.')
    }

    return supabase.channel(`${table}_changes`).on('postgres_changes', { event, schema: 'public', table }, callback).subscribe()
  },

  // Unsubscribe from channel
  unsubscribe(channel: any) {
    if (channel) {
      supabase.removeChannel(channel)
    }
  },
}

// Storage helpers (if you need file uploads)
export const storageService = {
  // Upload file
  async uploadFile(bucket: string, path: string, file: File) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please check your environment variables.')
    }

    const { data, error } = await supabase.storage.from(bucket).upload(path, file)

    if (error) {
      throw new Error(`Storage error: ${error.message}`)
    }

    return data
  },

  // Get public URL
  getPublicUrl(bucket: string, path: string) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please check your environment variables.')
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path)

    return data.publicUrl
  },

  // Delete file
  async deleteFile(bucket: string, path: string) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please check your environment variables.')
    }

    const { error } = await supabase.storage.from(bucket).remove([path])

    if (error) {
      throw new Error(`Storage error: ${error.message}`)
    }

    return true
  },
}
