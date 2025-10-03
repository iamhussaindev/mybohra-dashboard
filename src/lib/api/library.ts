import { supabase } from '@lib/config/supabase'
import { CreateLibraryRequest, Library, LibraryFilters, LibrarySearchResult, UpdateLibraryRequest } from '@type/library'

export class LibraryService {
  static async getAll(filters?: LibraryFilters): Promise<Library[]> {
    let query = supabase.from('library').select('*').order('id', { ascending: true })

    if (filters?.name) {
      query = query.ilike('name', `%${filters.name}%`)
    }
    if (filters?.album) {
      query = query.eq('album', filters.album)
    }
    if (filters?.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags)
    }
    if (filters?.categories && filters.categories.length > 0) {
      query = query.overlaps('categories', filters.categories)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  static async getById(id: number): Promise<Library | null> {
    const { data, error } = await supabase.from('library').select('*').eq('id', id).single()

    if (error) throw error
    return data
  }

  static async create(library: CreateLibraryRequest): Promise<Library> {
    const { data: result, error } = await supabase.from('library').insert(library).select().single()

    if (error) throw error
    return result
  }

  static async update(id: number, library: UpdateLibraryRequest): Promise<Library> {
    const { data: result, error } = await supabase.from('library').update(library).eq('id', id).select().single()

    if (error) throw error
    return result
  }

  static async delete(id: number): Promise<void> {
    const { error } = await supabase.from('library').delete().eq('id', id)

    if (error) throw error
  }

  static async search(query: string, limit: number = 50): Promise<LibrarySearchResult[]> {
    const { data, error } = await supabase.rpc('search_library', {
      p_query: query,
      p_limit: limit,
    })

    if (error) throw error
    return data || []
  }

  static async getPaginated(page: number = 1, pageSize: number = 10, filters?: LibraryFilters) {
    const start = (page - 1) * pageSize

    let query = supabase.from('library').select('*', { count: 'exact' })

    // Apply filters
    if (filters?.name) {
      query = query.ilike('name', `%${filters.name}%`)
    }
    if (filters?.album) {
      query = query.eq('album', filters.album)
    }
    if (filters?.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags)
    }
    if (filters?.categories && filters.categories.length > 0) {
      query = query.overlaps('categories', filters.categories)
    }

    query = query.order('id', { ascending: true }).range(start, start + pageSize - 1)

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

  static async getLibraryItemsForDate(date: number, month: number) {
    const { data, error } = await supabase.rpc('get_library_items_for_date_month', {
      p_date: date,
      p_month: month,
    })

    if (error) throw error
    return data || []
  }
}
