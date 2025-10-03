/**
 * Database Table Constants
 * Centralized table name constants for consistency across the application
 */

export const TABLES = {
  USER: 'user',
  USERS: 'users', // Alternative naming convention
  POSTS: 'posts',
  COMMENTS: 'comments',
  CATEGORIES: 'categories',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  PROFILES: 'profiles',
} as const

// Type for table names
export type TableName = (typeof TABLES)[keyof typeof TABLES]

// Individual table constants for convenience
export const USER_TABLE = TABLES.USER
export const USERS_TABLE = TABLES.USERS
export const POSTS_TABLE = TABLES.POSTS
export const COMMENTS_TABLE = TABLES.COMMENTS
export const CATEGORIES_TABLE = TABLES.CATEGORIES
export const PRODUCTS_TABLE = TABLES.PRODUCTS
export const ORDERS_TABLE = TABLES.ORDERS
export const PROFILES_TABLE = TABLES.PROFILES
