export interface User {
  id: number
  created_at: string
  name: string
  phone_number: string | null
  country: string | null
  email: string
  unverfied_email: string | null
  roles: string
  status: string
}

export interface CreateUserData {
  name: string
  phone_number: string | null
  country: string | null
  email: string
  unverfied_email: string | null
  roles: string
  status: string
}

export interface UpdateUserData {
  created_at?: string
  name?: string
  phone_number?: string | null
  country?: string | null
  email?: string
  unverfied_email?: string | null
  roles?: string
  status?: string
}
