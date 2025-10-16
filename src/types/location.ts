export interface Location {
  id: number
  type: string
  city: string
  country: string
  latitude: number
  longitude: number
  timezone: string
  state?: string
  created_at: string
  updated_at: string
}

export interface CreateLocationRequest {
  type?: string
  city: string
  country: string
  latitude: number
  longitude: number
  timezone: string
  state?: string
}

export interface UpdateLocationRequest {
  type?: string
  city?: string
  country?: string
  latitude?: number
  longitude?: number
  timezone?: string
  state?: string
}

export interface LocationFilters {
  type?: string
  city?: string
  country?: string
  state?: string
}
