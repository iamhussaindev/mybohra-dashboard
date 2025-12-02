/**
 * Mazaar (Shrine) Types
 */

export interface DaiDuat {
  id: string
  name: string
  city?: string
  area?: string
  history?: string
  photos: string[]
  year?: number
  rank?: number
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
}

export interface Musafirkhana {
  id: string
  name: string
  city?: string
  lat?: number
  lng?: number
  photos: string[]
  contact1?: string
  contact2?: string
  contact_person_name?: string
  map_link?: string
  total_rooms?: number
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
}

export interface Mazaar {
  id: string
  name: string
  lat?: number
  lng?: number
  contact?: string
  photos: string[]
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
  // Relations (populated via joins)
  dai_duat?: DaiDuat[]
  musafirkhana?: Musafirkhana[]
}

export interface MazaarWithRelations extends Mazaar {
  dai_duat: DaiDuat[]
  musafirkhana: Musafirkhana[]
}

// Create/Update Request Types
export interface CreateDaiDuatRequest {
  name: string
  city?: string
  area?: string
  history?: string
  photos?: string[]
  year?: number
  rank?: number
}

export interface UpdateDaiDuatRequest {
  name?: string
  city?: string
  area?: string
  history?: string
  photos?: string[]
  year?: number
  rank?: number
}

export interface CreateMusafirkhanaRequest {
  name: string
  city?: string
  lat?: number
  lng?: number
  photos?: string[]
  contact1?: string
  contact2?: string
  contact_person_name?: string
  map_link?: string
  total_rooms?: number
}

export interface UpdateMusafirkhanaRequest {
  name?: string
  city?: string
  lat?: number
  lng?: number
  photos?: string[]
  contact1?: string
  contact2?: string
  contact_person_name?: string
  map_link?: string
  total_rooms?: number
}

export interface CreateMazaarRequest {
  name: string
  lat?: number
  lng?: number
  contact?: string
  photos?: string[]
  dai_duat_ids?: string[]
  musafirkhana_ids?: string[]
}

export interface UpdateMazaarRequest {
  name?: string
  lat?: number
  lng?: number
  contact?: string
  photos?: string[]
  dai_duat_ids?: string[]
  musafirkhana_ids?: string[]
}

// Filter Types
export interface MazaarFilters {
  name?: string
  city?: string
  lat?: number
  lng?: number
  radius?: number // in km
}

export interface DaiDuatFilters {
  name?: string
  city?: string
  year?: number
  rank?: number
}

export interface MusafirkhanaFilters {
  name?: string
  city?: string
  lat?: number
  lng?: number
  radius?: number // in km
}

