export interface DailyDua {
  id: number
  library_id: number
  date: number
  month: number
  note?: string
  created_at: string
  updated_at: string
}

export interface CreateDailyDuaRequest {
  library_id: number
  date: number
  month: number
  note?: string
}

export interface UpdateDailyDuaRequest {
  library_id?: number
  date?: number
  month?: number
  note?: string
}

export interface DailyDuaFilters {
  library_id?: number
  date?: number
  month?: number
}

export interface DailyDuaWithLibrary extends DailyDua {
  library?: {
    id: number
    name: string
    description?: string
    audio_url?: string
    pdf_url?: string
    youtube_url?: string
    album?: string
  }
}
