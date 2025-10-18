import { supabase } from '@lib/config/supabase'
import { CreateTasbeehRequest, Tasbeeh, TasbeehFilters, TasbeehSearchResult, TasbeehType, UpdateTasbeehRequest } from '@type/tasbeeh'

export class TasbeehService {
  static async getAll(filters?: TasbeehFilters): Promise<Tasbeeh[]> {
    let query = supabase.from('tasbeeh').select('*').order('name', { ascending: true })

    if (filters?.name) {
      query = query.ilike('name', `%${filters.name}%`)
    }
    if (filters?.type) {
      query = query.eq('type', filters.type)
    }
    if (filters?.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  static async getById(id: number): Promise<Tasbeeh | null> {
    const { data, error } = await supabase.from('tasbeeh').select('*').eq('id', id).single()

    if (error) throw error
    return data
  }

  static async create(tasbeeh: CreateTasbeehRequest): Promise<Tasbeeh> {
    const { data: result, error } = await supabase.from('tasbeeh').insert(tasbeeh).select().single()

    if (error) throw error
    return result
  }

  static async update(id: number, tasbeeh: UpdateTasbeehRequest): Promise<Tasbeeh> {
    const { data: result, error } = await supabase.from('tasbeeh').update(tasbeeh).eq('id', id).select().single()

    if (error) throw error
    return result
  }

  static async delete(id: number): Promise<void> {
    const { error } = await supabase.from('tasbeeh').delete().eq('id', id)

    if (error) throw error
  }

  static async search(query: string, limit: number = 50): Promise<TasbeehSearchResult[]> {
    const { data, error } = await supabase.rpc('search_tasbeeh', {
      p_query: query,
      p_limit: limit,
    })

    if (error) throw error
    return data || []
  }

  static async getPaginated(page: number = 1, pageSize: number = 10, filters?: TasbeehFilters) {
    const start = (page - 1) * pageSize

    let query = supabase.from('tasbeeh').select('*', { count: 'exact' })

    // Apply filters
    if (filters?.name) {
      query = query.ilike('name', `%${filters.name}%`)
    }
    if (filters?.type) {
      query = query.eq('type', filters.type)
    }
    if (filters?.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags)
    }

    query = query.order('name', { ascending: true }).range(start, start + pageSize - 1)

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

  static async getByType(type: TasbeehType): Promise<Tasbeeh[]> {
    const { data, error } = await supabase.from('tasbeeh').select('*').eq('type', type).order('name', { ascending: true })

    if (error) throw error
    return data || []
  }

  static async getByTags(tags: string[]): Promise<Tasbeeh[]> {
    const { data, error } = await supabase.from('tasbeeh').select('*').overlaps('tags', tags).order('name', { ascending: true })

    if (error) throw error
    return data || []
  }

  static async getRandom(limit: number = 5): Promise<Tasbeeh[]> {
    const { data, error } = await supabase.from('tasbeeh').select('*').order('random()').limit(limit)

    if (error) throw error
    return data || []
  }
}
