import { supabase } from '@lib/config/supabase'
import { CreateDataRequest, Data, UpdateDataRequest } from '@type/data'

export class DataService {
  static async getAll(): Promise<Data[]> {
    const { data, error } = await supabase.from('data').select('*').order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async getById(id: number): Promise<Data | null> {
    const { data, error } = await supabase.from('data').select('*').eq('id', id).single()

    if (error) throw error
    return data
  }

  static async getByKey(key: string): Promise<Data | null> {
    const { data, error } = await supabase.from('data').select('*').eq('key', key).single()

    if (error) throw error
    return data
  }

  static async getByKeyOrCreate(key: string, defaultValue: string | null = null): Promise<Data> {
    try {
      // Try to get existing data
      const existingData = await this.getByKey(key)
      if (existingData) {
        return existingData
      }
    } catch (error) {
      console.error(error)
      // If data doesn't exist, create it
      console.log(`Data with key "${key}" not found, creating new entry`)
    }

    // Create new data entry
    const newData = await this.create({ key, value: defaultValue })
    return newData
  }

  static async create(data: CreateDataRequest): Promise<Data> {
    const { data: result, error } = await supabase.from('data').insert(data).select().single()

    if (error) throw error
    return result
  }

  static async update(id: number, data: UpdateDataRequest): Promise<Data> {
    const { data: result, error } = await supabase.from('data').update(data).eq('id', id).select().single()

    if (error) throw error
    return result
  }

  static async delete(id: number): Promise<void> {
    const { error } = await supabase.from('data').delete().eq('id', id)

    if (error) throw error
  }

  static async search(query: string): Promise<Data[]> {
    const { data, error } = await supabase.from('data').select('*').or(`key.ilike.%${query}%,value.ilike.%${query}%`).order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async getPaginated(page: number = 1, pageSize: number = 10, filters: any = {}) {
    const start = (page - 1) * pageSize

    let query = supabase.from('data').select('*', { count: 'exact' })

    // Apply filters
    if (filters.key) {
      query = query.ilike('key', `%${filters.key}%`)
    }
    if (filters.value) {
      query = query.ilike('value', `%${filters.value}%`)
    }

    query = query.order('created_at', { ascending: false }).range(start, start + pageSize - 1)

    const { data, error, count } = await query

    if (error) throw error

    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    }
  }
}
