import { supabase } from '@lib/config/supabase'
import { CreateMazaarRequest, Mazaar, MazaarFilters, MazaarWithRelations, UpdateMazaarRequest } from '@type/mazaar'

export class MazaarService {
  static async getAll(filters?: MazaarFilters): Promise<Mazaar[]> {
    let query = supabase.from('mazaars').select('*').order('name', { ascending: true })

    if (filters?.name) {
      query = query.ilike('name', `%${filters.name}%`)
    }
    // Note: Radius filtering would require a PostGIS extension or custom function
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

  static async getById(id: string, includeRelations: boolean = false): Promise<Mazaar | MazaarWithRelations | null> {
    if (includeRelations) {
      const { data, error } = await supabase
        .from('mazaars')
        .select(
          `
          *,
          dai_duat:dai_duat(*),
          musafirkhana:musafirkhana(*)
        `
        )
        .eq('id', id)
        .single()

      if (error) throw error
      return data as MazaarWithRelations
    } else {
      const { data, error } = await supabase.from('mazaars').select('*').eq('id', id).single()

      if (error) throw error
      return data
    }
  }

  static async getWithRelations(id: string): Promise<MazaarWithRelations | null> {
    // Get mazaar
    const mazaar = await this.getById(id, false)
    if (!mazaar) return null

    // Get related dai_duat
    const { data: daiDuatData } = await supabase
      .from('mazaar_dai_duat')
      .select('dai_duat_id')
      .eq('mazaar_id', id)

    const daiDuatIds = daiDuatData?.map((d) => d.dai_duat_id) || []
    const { data: daiDuat } = daiDuatIds.length > 0 ? await supabase.from('dai_duat').select('*').in('id', daiDuatIds) : { data: [] }

    // Get related musafirkhana
    const { data: musafirkhanaData } = await supabase
      .from('mazaar_musafirkhana')
      .select('musafirkhana_id')
      .eq('mazaar_id', id)

    const musafirkhanaIds = musafirkhanaData?.map((m) => m.musafirkhana_id) || []
    const { data: musafirkhana } =
      musafirkhanaIds.length > 0 ? await supabase.from('musafirkhana').select('*').in('id', musafirkhanaIds) : { data: [] }

    return {
      ...mazaar,
      dai_duat: (daiDuat || []) as any[],
      musafirkhana: (musafirkhana || []) as any[],
    }
  }

  static async create(mazaar: CreateMazaarRequest): Promise<Mazaar> {
    const { dai_duat_ids, musafirkhana_ids, ...mazaarData } = mazaar

    // Insert mazaar
    const { data: result, error } = await supabase
      .from('mazaars')
      .insert({
        ...mazaarData,
        photos: mazaarData.photos || [],
      })
      .select()
      .single()

    if (error) throw error

    // Insert relationships
    if (dai_duat_ids && dai_duat_ids.length > 0) {
      const relations = dai_duat_ids.map((daiDuatId) => ({
        mazaar_id: result.id,
        dai_duat_id: daiDuatId,
      }))
      await supabase.from('mazaar_dai_duat').insert(relations)
    }

    if (musafirkhana_ids && musafirkhana_ids.length > 0) {
      const relations = musafirkhana_ids.map((musafirkhanaId) => ({
        mazaar_id: result.id,
        musafirkhana_id: musafirkhanaId,
      }))
      await supabase.from('mazaar_musafirkhana').insert(relations)
    }

    return result
  }

  static async update(id: string, mazaar: UpdateMazaarRequest): Promise<Mazaar> {
    const { dai_duat_ids, musafirkhana_ids, ...mazaarData } = mazaar

    // Update mazaar
    const { data: result, error } = await supabase
      .from('mazaars')
      .update(mazaarData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Update relationships if provided
    if (dai_duat_ids !== undefined) {
      // Delete existing
      await supabase.from('mazaar_dai_duat').delete().eq('mazaar_id', id)

      // Insert new
      if (dai_duat_ids.length > 0) {
        const relations = dai_duat_ids.map((daiDuatId) => ({
          mazaar_id: id,
          dai_duat_id: daiDuatId,
        }))
        await supabase.from('mazaar_dai_duat').insert(relations)
      }
    }

    if (musafirkhana_ids !== undefined) {
      // Delete existing
      await supabase.from('mazaar_musafirkhana').delete().eq('mazaar_id', id)

      // Insert new
      if (musafirkhana_ids.length > 0) {
        const relations = musafirkhana_ids.map((musafirkhanaId) => ({
          mazaar_id: id,
          musafirkhana_id: musafirkhanaId,
        }))
        await supabase.from('mazaar_musafirkhana').insert(relations)
      }
    }

    return result
  }

  static async delete(id: string): Promise<void> {
    // Delete relationships first (CASCADE should handle this, but being explicit)
    await supabase.from('mazaar_dai_duat').delete().eq('mazaar_id', id)
    await supabase.from('mazaar_musafirkhana').delete().eq('mazaar_id', id)

    // Delete mazaar
    const { error } = await supabase.from('mazaars').delete().eq('id', id)

    if (error) throw error
  }

  static async getPaginated(page: number = 1, pageSize: number = 10, filters?: MazaarFilters) {
    const start = (page - 1) * pageSize

    let query = supabase.from('mazaars').select('*', { count: 'exact' })

    if (filters?.name) {
      query = query.ilike('name', `%${filters.name}%`)
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

