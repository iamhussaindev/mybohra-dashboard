// Export all API utilities
export * from './supabase'

// Re-export Supabase client and utilities for convenience
export { isSupabaseConfigured, supabase } from '@lib/config/supabase'
export { authService, realtimeService, storageService, SupabaseService } from './supabase'

export { UserService } from './users'
