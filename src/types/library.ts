export enum AlbumEnum {
  MADEH = 'MADEH',
  NOHA = 'NOHA',
  SALAAM = 'SALAAM',
  ILTEJA = 'ILTEJA',
  QURAN = 'QURAN',
  DUA = 'DUA',
  MUNAJAAT = 'MUNAJAAT',
  MANQABAT = 'MANQABAT',
  NAAT = 'NAAT',
  RASA = 'RASA',
  QASIDA = 'QASIDA',
}

export interface Library {
  id: number
  name: string
  description?: string
  audio_url?: string
  pdf_url?: string
  youtube_url?: string
  album?: AlbumEnum
  metadata?: Record<string, any>
  tags?: string[]
  categories?: string[]
  search_text?: string
  search_vector?: any
  created_at: string
  updated_at: string
}

export interface CreateLibraryRequest {
  name: string
  description?: string
  audio_url?: string
  pdf_url?: string
  youtube_url?: string
  album?: AlbumEnum
  metadata?: Record<string, any>
  tags?: string[]
  categories?: string[]
}

export interface UpdateLibraryRequest {
  name?: string
  description?: string
  audio_url?: string
  pdf_url?: string
  youtube_url?: string
  album?: AlbumEnum
  metadata?: Record<string, any>
  tags?: string[]
  categories?: string[]
}

export interface LibraryFilters {
  name?: string
  album?: AlbumEnum
  tags?: string[]
  categories?: string[]
}

export interface LibrarySearchResult {
  id: number
  name: string
  description?: string
  album?: AlbumEnum
  tags?: string[]
  categories?: string[]
}
