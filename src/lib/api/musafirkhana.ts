import { supabase } from '@lib/config/supabase'
import { CreateMusafirkhanaRequest, Musafirkhana, MusafirkhanaFilters, UpdateMusafirkhanaRequest } from '@type/mazaar'

export class MusafirkhanaService {
  static async getAll(filters?: MusafirkhanaFilters): Promise<Musafirkhana[]> {
    let query = supabase.from('musafirkhana').select('*').order('name', { ascending: true })

    if (filters?.name) {
      query = query.ilike('name', `%${filters.name}%`)
    }
    if (filters?.city) {
      query = query.ilike('city', `%${filters.city}%`)
    }
    // Note: Radius filtering would require a PostGIS extension or custom function
    // For now, we'll just filter by lat/lng if provided
    if (filters?.lat !== undefined) {
      query = query.eq('lat', filters.lat)
    }
    if (filters?.lng !== undefined) {
      query = query.eq('lng', filters.lng)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  static async getById(id: string): Promise<Musafirkhana | null> {
    const { data, error } = await supabase.from('musafirkhana').select('*').eq('id', id).single()

    if (error) throw error
    return data
  }

  static async create(musafirkhana: CreateMusafirkhanaRequest): Promise<Musafirkhana> {
    const { data: result, error } = await supabase
      .from('musafirkhana')
      .insert({
        ...musafirkhana,
        photos: musafirkhana.photos || [],
      })
      .select()
      .single()

    if (error) throw error
    return result
  }

  static async update(id: string, musafirkhana: UpdateMusafirkhanaRequest): Promise<Musafirkhana> {
    const { data: result, error } = await supabase
      .from('musafirkhana')
      .update(musafirkhana)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return result
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase.from('musafirkhana').delete().eq('id', id)

    if (error) throw error
  }

  static async getPaginated(page: number = 1, pageSize: number = 10, filters?: MusafirkhanaFilters) {
    const start = (page - 1) * pageSize

    let query = supabase.from('musafirkhana').select('*', { count: 'exact' })

    if (filters?.name) {
      query = query.ilike('name', `%${filters.name}%`)
    }
    if (filters?.city) {
      query = query.ilike('city', `%${filters.city}%`)
    }
    if (filters?.lat !== undefined) {
      query = query.eq('lat', filters.lat)
    }
    if (filters?.lng !== undefined) {
      query = query.eq('lng', filters.lng)
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
}

