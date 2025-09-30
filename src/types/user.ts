export interface User {
  id: string
  email: string
  phone_number: string | null
  name: string
  roles: string[]
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
}

export interface CreateUserData {
  email: string
  phone_number?: string
  name: string
  roles?: string[]
}

export interface UpdateUserData {
  email?: string
  phone_number?: string
  name?: string
  roles?: string[]
}

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
} as const

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]
