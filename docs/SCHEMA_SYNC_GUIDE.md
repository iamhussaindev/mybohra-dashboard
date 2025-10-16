# Schema Sync System

A powerful script that automatically reads your Supabase database schema and generates TypeScript types and CRUD operations.

## 🚀 Quick Start

### 1. Ensure Environment Variables

Make sure you have these in your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Run Schema Sync

```bash
npm run schema:sync
```

### 3. Use Generated Code

```typescript
import { UserService } from '@lib/api/generated/User'
import { User, CreateUserData, UpdateUserData } from '@lib/schema/types'

// Use the services
const users = await UserService.getAll()
const newUser = await UserService.create({
  name: 'John Doe',
  email: 'john@example.com',
})
```

## 📋 Commands

```bash
# Sync schema and generate types/services
npm run schema:sync

# Check status and help
npm run schema:status
```

## 🔄 How It Works

### 1. **Database Discovery**

- Connects to your Supabase database
- Discovers all tables in the `public` schema
- Falls back to common table names if schema introspection fails

### 2. **Schema Analysis**

- Reads column information for each table
- Identifies data types, nullable fields, defaults
- Detects primary keys and foreign keys
- Handles both direct schema queries and sample data analysis

### 3. **Code Generation**

- **TypeScript Types**: Generates interfaces for each table
- **CRUD Services**: Creates service classes with full operations
- **Type Safety**: Ensures all generated code is fully typed

## 📁 Generated Files

### TypeScript Types (`src/lib/schema/types.ts`)

```typescript
export interface User {
  id: string
  name: string
  email: string
  created_at: string
  updated_at: string
}

export interface CreateUserData {
  name: string
  email: string
}

export interface UpdateUserData {
  name?: string
  email?: string
  created_at?: string
  updated_at?: string
}
```

### CRUD Services (`src/lib/api/generated/`)

```typescript
export class UserService {
  static async getAll(): Promise<User[]>
  static async getById(id: string): Promise<User | null>
  static async create(data: CreateUserData): Promise<User>
  static async update(id: string, data: UpdateUserData): Promise<User>
  static async delete(id: string): Promise<void>
  static async search(query: string): Promise<User[]>
}
```

## 🎯 Features

### ✅ **Automatic Schema Detection**

- Reads actual database schema
- No manual configuration needed
- Works with existing tables

### ✅ **Smart Type Inference**

- Automatically maps database types to TypeScript
- Handles nullable fields correctly
- Supports arrays, UUIDs, timestamps, etc.

### ✅ **Complete CRUD Operations**

- Full CRUD service for each table
- Error handling built-in
- Type-safe operations

### ✅ **Flexible Discovery**

- Multiple fallback methods for table discovery
- Works even if schema introspection is limited
- Handles empty tables gracefully

## 🔧 Advanced Usage

### Custom Table Discovery

If the script can't discover your tables automatically, you can modify the `commonTables` array in the script:

```javascript
const commonTables = ['users', 'posts', 'comments', 'your_custom_table']
```

### Schema Analysis Methods

The script tries multiple approaches:

1. **Direct Schema Queries**: Uses `information_schema` for complete metadata
2. **Sample Data Analysis**: Analyzes actual data to infer structure
3. **Default Schema**: Provides sensible defaults for empty tables

## 🚨 Troubleshooting

### No Tables Found

```bash
❌ No tables found in database
```

**Solution**: Create some tables in your Supabase database first, then run the sync again.

### Connection Issues

```bash
❌ Connection failed: [error message]
```

**Solution**: Check your environment variables and database connection.

### Schema Analysis Fails

```bash
⚠️ Could not get schema for [table_name]
```

**Solution**: The script will fall back to sample data analysis or provide defaults.

## 📊 Supported Database Features

### Data Types

- `uuid` → `string`
- `varchar/text` → `string`
- `integer/serial` → `number`
- `boolean` → `boolean`
- `timestamp` → `string` (ISO format)
- `text[]` → `string[]`

### Table Features

- Primary keys (auto-detected)
- Foreign keys (when available)
- Nullable fields
- Default values
- Array types

## 🔄 Workflow

1. **Set up your database**: Create tables in Supabase
2. **Run schema sync**: `npm run schema:sync`
3. **Use generated code**: Import types and services
4. **Re-sync when needed**: Run again when schema changes

## 💡 Best Practices

1. **Regular Sync**: Run schema sync after database changes
2. **Version Control**: Commit generated files to track schema evolution
3. **Type Safety**: Use generated types throughout your application
4. **Service Layer**: Use generated services for all database operations

## 🎉 Benefits

- **Zero Configuration**: Works with any Supabase database
- **Automatic Updates**: Re-sync when schema changes
- **Type Safety**: Full TypeScript support
- **Consistency**: Standardized CRUD operations
- **Time Saving**: No manual type definitions needed

---

**Your schema sync system is ready! 🚀**

Just run `npm run schema:sync` to get started!
