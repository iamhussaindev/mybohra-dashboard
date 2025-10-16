import { supabase } from '@lib/config/supabase'
import { CreateLocationRequest, Location, LocationFilters, UpdateLocationRequest } from '@type/location'

export class LocationService {
  private static readonly TABLE_NAME = 'location'

  static async getAll(page: number = 1, limit: number = 50, filters?: LocationFilters): Promise<{ data: Location[]; total: number }> {
    let query = supabase.from(this.TABLE_NAME).select('*', { count: 'exact' })

    // Apply filters
    if (filters?.type) {
      query = query.eq('type', filters.type)
    }
    if (filters?.city) {
      query = query.ilike('city', `%${filters.city}%`)
    }
    if (filters?.country) {
      query = query.ilike('country', `%${filters.country}%`)
    }
    if (filters?.state) {
      query = query.ilike('state', `%${filters.state}%`)
    }

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query.range(from, to).order('id', { ascending: false })

    if (error) throw error

    return {
      data: data || [],
      total: count || 0,
    }
  }

  static async getById(id: number): Promise<Location> {
    const { data, error } = await supabase.from(this.TABLE_NAME).select('*').eq('id', id).single()

    if (error) throw error
    return data
  }

  static async create(location: CreateLocationRequest): Promise<Location> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .insert([
        {
          type: location.type || 'city',
          city: location.city,
          country: location.country,
          latitude: location.latitude,
          longitude: location.longitude,
          timezone: location.timezone,
          state: location.state,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async update(id: number, updates: UpdateLocationRequest): Promise<Location> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async delete(id: number): Promise<void> {
    const { error } = await supabase.from(this.TABLE_NAME).delete().eq('id', id)

    if (error) throw error
  }

  static async search(query: string, limit: number = 50): Promise<Location[]> {
    const { data, error } = await supabase.from(this.TABLE_NAME).select('*').or(`city.ilike.%${query}%,country.ilike.%${query}%,state.ilike.%${query}%`).limit(limit)

    if (error) throw error
    return data || []
  }
}
