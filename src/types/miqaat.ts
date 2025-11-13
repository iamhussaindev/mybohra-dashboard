export enum PhaseEnum {
  DAY = 'DAY',
  NIGHT = 'NIGHT',
}

export enum MiqaatTypeEnum {
  URS = 'URS',
  MILAD = 'MILAD',
  WASHEQ = 'WASHEQ',
  PEHLI_RAAT = 'PEHLI_RAAT',
  SHAHADAT = 'SHAHADAT',
  ASHARA = 'ASHARA',
  IMPORTANT_NIGHT = 'IMPORTANT_NIGHT',
  EID = 'EID',
  OTHER = 'OTHER',
}

export interface Miqaat {
  id: number
  name: string
  description?: string
  date?: number
  month?: number
  location?: string
  type?: MiqaatTypeEnum
  date_night?: number
  month_night?: number
  priority?: number
  important?: boolean
  phase: PhaseEnum
  image?: string
  created_at: string
  updated_at: string
}

export interface CreateMiqaatRequest {
  name: string
  description?: string
  date?: number
  month?: number
  location?: string
  type?: MiqaatTypeEnum
  date_night?: number
  month_night?: number
  priority?: number
  important?: boolean
  phase?: PhaseEnum
  image?: string
}

export interface UpdateMiqaatRequest {
  name?: string
  description?: string
  date?: number
  month?: number
  location?: string
  type?: MiqaatTypeEnum
  date_night?: number
  month_night?: number
  priority?: number
  important?: boolean
  phase?: PhaseEnum
  image?: string
}

export interface MiqaatFilters {
  name?: string
  type?: MiqaatTypeEnum
  date?: number
  month?: number
  important?: boolean
}

export interface MiqaatLibraryAssociation {
  miqaat_id: number
  library_id: number
  assigned_at: string
}

export interface LibraryItemForDate {
  library_id: number
  name: string
  description?: string
  source: 'daily_daus' | 'miqaat'
}
