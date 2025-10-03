import { supabase } from '@lib/config/supabase'
import { USER_TABLE } from '@lib/constants/tables'
import { CreateUserData, UpdateUserData, User } from '@lib/schema/types'

export class UserService {
  static async getAll(): Promise<User[]> {
    const { data, error } = await supabase.from(USER_TABLE).select('*').order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async getById(id: string): Promise<User | null> {
    const { data, error } = await supabase.from(USER_TABLE).select('*').eq('id', id).single()

    if (error) throw error
    return data
  }

  static async create(data: CreateUserData): Promise<User> {
    const { data: result, error } = await supabase.from(USER_TABLE).insert(data).select().single()

    if (error) throw error
    return result
  }

  static async update(id: string, data: UpdateUserData): Promise<User> {
    const { data: result, error } = await supabase.from(USER_TABLE).update(data).eq('id', id).select().single()

    if (error) throw error
    return result
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase.from(USER_TABLE).delete().eq('id', id)

    if (error) throw error
  }

  static async search(query: string): Promise<User[]> {
    const { data, error } = await supabase.from(USER_TABLE).select('*').or(`name.ilike.%${query}%,email.ilike.%${query}%`).order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }
}
