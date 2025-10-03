import { supabase } from '@lib/config/supabase'
import { CreateMiqaatRequest, Miqaat, MiqaatFilters, MiqaatLibraryAssociation, UpdateMiqaatRequest } from '@type/miqaat'

export class MiqaatService {
  static async getAll(filters?: MiqaatFilters): Promise<Miqaat[]> {
    let query = supabase.from('miqaat').select('*').order('created_at', { ascending: false })

    if (filters?.name) {
      query = query.ilike('name', `%${filters.name}%`)
    }
    if (filters?.type) {
      query = query.eq('type', filters.type)
    }
    if (filters?.date) {
      query = query.eq('date', filters.date)
    }
    if (filters?.month) {
      query = query.eq('month', filters.month)
    }
    if (filters?.important !== undefined) {
      query = query.eq('important', filters.important)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  static async getById(id: number): Promise<Miqaat | null> {
    const { data, error } = await supabase.from('miqaat').select('*').eq('id', id).single()

    if (error) throw error
    return data
  }

  static async create(miqaat: CreateMiqaatRequest): Promise<Miqaat> {
    const { data: result, error } = await supabase.from('miqaat').insert(miqaat).select().single()

    if (error) throw error
    return result
  }

  static async update(id: number, miqaat: UpdateMiqaatRequest): Promise<Miqaat> {
    const { data: result, error } = await supabase.from('miqaat').update(miqaat).eq('id', id).select().single()

    if (error) throw error
    return result
  }

  static async delete(id: number): Promise<void> {
    const { error } = await supabase.from('miqaat').delete().eq('id', id)

    if (error) throw error
  }

  static async getPaginated(page: number = 1, pageSize: number = 10, filters?: MiqaatFilters) {
    const start = (page - 1) * pageSize

    let query = supabase.from('miqaat').select('*', { count: 'exact' })

    // Apply filters
    if (filters?.name) {
      query = query.ilike('name', `%${filters.name}%`)
    }
    if (filters?.type) {
      query = query.eq('type', filters.type)
    }
    if (filters?.date) {
      query = query.eq('date', filters.date)
    }
    if (filters?.month) {
      query = query.eq('month', filters.month)
    }
    if (filters?.important !== undefined) {
      query = query.eq('important', filters.important)
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

  // Miqaat-Library associations
  static async getLibraryAssociations(miqaatId: number): Promise<MiqaatLibraryAssociation[]> {
    const { data, error } = await supabase.from('miqaat_library').select('*').eq('miqaat_id', miqaatId)

    if (error) throw error
    return data || []
  }

  static async addLibraryAssociation(miqaatId: number, libraryId: number): Promise<void> {
    const { error } = await supabase.from('miqaat_library').insert({ miqaat_id: miqaatId, library_id: libraryId })

    if (error) throw error
  }

  static async removeLibraryAssociation(miqaatId: number, libraryId: number): Promise<void> {
    const { error } = await supabase.from('miqaat_library').delete().eq('miqaat_id', miqaatId).eq('library_id', libraryId)

    if (error) throw error
  }

  static async getLibraryItemsForDate(date: number, month: number) {
    const { data, error } = await supabase.rpc('get_library_items_for_date_month', {
      p_date: date,
      p_month: month,
    })

    if (error) throw error
    return data || []
  }
}
