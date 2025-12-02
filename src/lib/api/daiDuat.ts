import { supabase } from '@lib/config/supabase'
import { CreateDaiDuatRequest, DaiDuat, DaiDuatFilters, UpdateDaiDuatRequest } from '@type/mazaar'

export class DaiDuatService {
  static async getAll(filters?: DaiDuatFilters): Promise<DaiDuat[]> {
    let query = supabase.from('dai_duat').select('*').order('rank', { ascending: true, nullsFirst: false }).order('name', { ascending: true })

    if (filters?.name) {
      query = query.ilike('name', `%${filters.name}%`)
    }
    if (filters?.city) {
      query = query.ilike('city', `%${filters.city}%`)
    }
    if (filters?.year) {
      query = query.eq('year', filters.year)
    }
    if (filters?.rank) {
      query = query.eq('rank', filters.rank)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  static async getById(id: string): Promise<DaiDuat | null> {
    const { data, error } = await supabase.from('dai_duat').select('*').eq('id', id).single()

    if (error) throw error
    return data
  }

  static async create(daiDuat: CreateDaiDuatRequest): Promise<DaiDuat> {
    const { data: result, error } = await supabase
      .from('dai_duat')
      .insert({
        ...daiDuat,
        photos: daiDuat.photos || [],
      })
      .select()
      .single()

    if (error) throw error
    return result
  }

  static async update(id: string, daiDuat: UpdateDaiDuatRequest): Promise<DaiDuat> {
    const { data: result, error } = await supabase
      .from('dai_duat')
      .update(daiDuat)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return result
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase.from('dai_duat').delete().eq('id', id)

    if (error) throw error
  }

  static async getPaginated(page: number = 1, pageSize: number = 10, filters?: DaiDuatFilters) {
    const start = (page - 1) * pageSize

    let query = supabase.from('dai_duat').select('*', { count: 'exact' })

    if (filters?.name) {
      query = query.ilike('name', `%${filters.name}%`)
    }
    if (filters?.city) {
      query = query.ilike('city', `%${filters.city}%`)
    }
    if (filters?.year) {
      query = query.eq('year', filters.year)
    }
    if (filters?.rank) {
      query = query.eq('rank', filters.rank)
    }

    query = query.order('rank', { ascending: true, nullsFirst: false }).order('name', { ascending: true }).range(start, start + pageSize - 1)

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

