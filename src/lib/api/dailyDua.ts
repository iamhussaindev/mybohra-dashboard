import { supabase } from '@lib/config/supabase'
import { CreateDailyDuaRequest, DailyDua, DailyDuaFilters, DailyDuaWithLibrary, UpdateDailyDuaRequest } from '@type/dailyDua'

export class DailyDuaService {
  static async getAll(filters?: DailyDuaFilters): Promise<DailyDua[]> {
    let query = supabase.from('daily_duas').select('*').order('id', { ascending: true })

    if (filters?.library_id) {
      query = query.eq('library_id', filters.library_id)
    }
    if (filters?.date) {
      query = query.eq('date', filters.date)
    }
    if (filters?.month) {
      query = query.eq('month', filters.month)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  static async getAllWithLibrary(filters?: DailyDuaFilters): Promise<DailyDuaWithLibrary[]> {
    let query = supabase.from('daily_duas').select('*, library:library_id(*)').order('id', { ascending: true })

    if (filters?.library_id) {
      query = query.eq('library_id', filters.library_id)
    }
    if (filters?.date) {
      query = query.eq('date', filters.date)
    }
    if (filters?.month) {
      query = query.eq('month', filters.month)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  static async getByDateMonth(date: number, month: number): Promise<DailyDuaWithLibrary[]> {
    const { data, error } = await supabase.from('daily_duas').select('*, library:library_id(*)').eq('date', date).eq('month', month).order('id', { ascending: true })

    if (error) throw error
    return data || []
  }

  static async getById(id: number): Promise<DailyDua | null> {
    const { data, error } = await supabase.from('daily_duas').select('*').eq('id', id).single()

    if (error) throw error
    return data
  }

  static async create(dailyDua: CreateDailyDuaRequest): Promise<DailyDua> {
    const { data: result, error } = await supabase.from('daily_duas').insert(dailyDua).select().single()

    if (error) throw error
    return result
  }

  static async update(id: number, dailyDua: UpdateDailyDuaRequest): Promise<DailyDua> {
    const { data: result, error } = await supabase.from('daily_duas').update(dailyDua).eq('id', id).select().single()

    if (error) throw error
    return result
  }

  static async delete(id: number): Promise<void> {
    const { error } = await supabase.from('daily_duas').delete().eq('id', id)

    if (error) throw error
  }

  static async deleteByLibraryId(libraryId: number): Promise<void> {
    const { error } = await supabase.from('daily_duas').delete().eq('library_id', libraryId)

    if (error) throw error
  }

  static async deleteByDateMonth(date: number, month: number): Promise<void> {
    const { error } = await supabase.from('daily_duas').delete().eq('date', date).eq('month', month)

    if (error) throw error
  }

  // Check if a library item is already assigned to a date
  static async checkExists(libraryId: number, date: number, month: number): Promise<boolean> {
    const { data, error } = await supabase.from('daily_duas').select('id').eq('library_id', libraryId).eq('date', date).eq('month', month).maybeSingle()

    if (error) throw error
    return !!data
  }
}
