export interface User {
  id: string
  email: string
  name: string
  roles: string
  created_at: string
  updated_at: string
}

export interface CreateUserData {
  email: string
  name: string
}

export interface UpdateUserData {
  email?: string
  name?: string
  roles?: string
  created_at?: string
  updated_at?: string
}