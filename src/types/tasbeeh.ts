export enum TasbeehType {
  DEENI = 'DEENI',
  MISC = 'MISC',
  OTHER = 'OTHER',
}

export interface Tasbeeh {
  id: number
  name: string
  text?: string
  arabic_text?: string
  image?: string
  audio?: string
  description?: string
  count: number
  type: TasbeehType
  tags: string[]
  created_at: string
  updated_at: string
}

export interface CreateTasbeehRequest {
  name: string
  text?: string
  arabic_text?: string
  image?: string
  audio?: string
  description?: string
  count?: number
  type: TasbeehType
  tags?: string[]
}

export interface UpdateTasbeehRequest {
  name?: string
  text?: string
  arabic_text?: string
  image?: string
  audio?: string
  description?: string
  count?: number
  type?: TasbeehType
  tags?: string[]
}

export interface TasbeehFilters {
  name?: string
  type?: TasbeehType
  tags?: string[]
}

export interface TasbeehSearchResult {
  id: number
  name: string
  text?: string
  arabic_text?: string
  image?: string
  audio?: string
  description?: string
  count: number
  type: TasbeehType
  tags: string[]
  created_at: string
  updated_at: string
  rank: number
}
