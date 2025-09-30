import { supabase } from '@lib/config/supabase'
import { CreateUserData, UpdateUserData, User } from '../../types/user'

export class UserService {
  // Get all users
  static async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`)
    }

    return data || []
  }

  // Get user by ID
  static async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // User not found
      }
      throw new Error(`Failed to fetch user: ${error.message}`)
    }

    return data
  }

  // Create new user
  static async createUser(userData: CreateUserData): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        ...userData,
        roles: userData.roles || ['user'],
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`)
    }

    return data
  }

  // Update user
  static async updateUser(id: string, userData: UpdateUserData): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...userData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`)
    }

    return data
  }

  // Delete user
  static async deleteUser(id: string): Promise<void> {
    const { error } = await supabase.from('users').delete().eq('id', id)

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`)
    }
  }

  // Search users
  static async searchUsers(query: string): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*').or(`name.ilike.%${query}%,email.ilike.%${query}%,phone_number.ilike.%${query}%`).order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to search users: ${error.message}`)
    }

    return data || []
  }

  // Get users by role
  static async getUsersByRole(role: string): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*').contains('roles', [role]).order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch users by role: ${error.message}`)
    }

    return data || []
  }
}
