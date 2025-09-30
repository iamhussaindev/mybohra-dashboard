# Entity-Based Database Management System

This system allows you to define your database schema in a single place and automatically generates:

- Database schema (tables, indexes, RLS policies, triggers)
- TypeScript types
- CRUD service classes
- API endpoints

## 🚀 Quick Start

### 1. Define Your Entities

Edit `src/lib/schema/entities.ts` to define your database entities:

```typescript
export const entities: Record<string, Entity> = {
  users: {
    name: 'User',
    table: 'users',
    fields: {
      id: {
        type: 'uuid',
        primary: true,
        default: 'gen_random_uuid()',
      },
      email: {
        type: 'varchar(255)',
        nullable: false,
        unique: true,
        index: true,
      },
      name: {
        type: 'varchar(255)',
        nullable: false,
      },
      roles: {
        type: 'text[]',
        default: "ARRAY['user']",
        ginIndex: true,
      },
      created_at: {
        type: 'timestamp with time zone',
        default: 'now()',
        index: true,
      },
      updated_at: {
        type: 'timestamp with time zone',
        default: 'now()',
      },
    },
    rls: {
      policies: ['Users can view own data', 'Service role full access'],
    },
    indexes: ['CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)'],
    triggers: [
      `CREATE TRIGGER update_users_updated_at
       BEFORE UPDATE ON users
       FOR EACH ROW
       EXECUTE FUNCTION update_updated_at_column();`,
    ],
  },
}
```

### 2. Sync Everything

```bash
# Sync database schema and generate code
npm run entity:sync

# Or just generate code without database changes
npm run entity:generate
```

### 3. Use Generated Code

```typescript
import { UserService } from '@lib/api/generated/users'
import { User, CreateUserData } from '@lib/schema/types'

// Use the generated service
const users = await UserService.getAll()
const newUser = await UserService.create({ name: 'John', email: 'john@example.com' })
```

## 📋 Available Commands

```bash
# Entity Management
npm run entity:sync          # Sync database and generate code
npm run entity:generate      # Generate types and CRUD services only
npm run entity:list          # List all entities
npm run entity:validate      # Validate entity definitions
npm run entity:add <name>    # Get template for new entity

# Database Management (legacy)
npm run db:migrate           # Run SQL migrations
npm run db:sync              # Sync database schema
npm run db:verify           # Verify database integrity
npm run db:backup            # Create database backup
```

## 🏗️ Entity Definition

### Field Types

```typescript
interface EntityField {
  type: string // Database type (varchar(255), uuid, etc.)
  nullable?: boolean // Allow NULL values
  default?: any // Default value
  unique?: boolean // Unique constraint
  primary?: boolean // Primary key
  foreignKey?: {
    // Foreign key relationship
    table: string
    column: string
    onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT'
  }
  index?: boolean // Create regular index
  ginIndex?: boolean // Create GIN index (for arrays)
}
```

### Entity Structure

```typescript
interface Entity {
  name: string // TypeScript type name
  table: string // Database table name
  fields: Record<string, EntityField>
  relations?: Record<string, EntityRelation>
  rls?: {
    // Row Level Security
    policies: string[]
  }
  indexes?: string[] // Custom indexes
  triggers?: string[] // Custom triggers
}
```

## 🔧 Field Configuration Examples

### Basic Fields

```typescript
// Primary key
id: {
  type: 'uuid',
  primary: true,
  default: 'gen_random_uuid()',
}

// Required string
name: {
  type: 'varchar(255)',
  nullable: false,
}

// Optional string with default
status: {
  type: 'varchar(20)',
  default: "'active'",
}

// Unique email
email: {
  type: 'varchar(255)',
  nullable: false,
  unique: true,
  index: true,
}

// Array field with GIN index
tags: {
  type: 'text[]',
  ginIndex: true,
}

// Foreign key
user_id: {
  type: 'uuid',
  foreignKey: {
    table: 'users',
    column: 'id',
    onDelete: 'CASCADE',
  },
  index: true,
}
```

### Advanced Configuration

```typescript
// Timestamp with auto-update
created_at: {
  type: 'timestamp with time zone',
  default: 'now()',
  index: true,
}

updated_at: {
  type: 'timestamp with time zone',
  default: 'now()',
}

// JSON field
metadata: {
  type: 'jsonb',
  default: "'{}'",
}

// Enum-like field
status: {
  type: 'varchar(20)',
  default: "'draft'",
  index: true,
}
```

## 🔒 Row Level Security (RLS)

### Available Policies

```typescript
rls: {
  policies: [
    'Users can view own data', // SELECT where auth.uid() = id
    'Users can update own data', // UPDATE where auth.uid() = id
    'Users can manage own preferences', // ALL where auth.uid() = user_id
    'Users can view published posts', // SELECT where status = 'published'
    'Authors can manage own posts', // ALL where auth.uid() = author_id
    'Service role full access', // ALL for service_role
  ]
}
```

### Custom Policies

For complex RLS policies, add them to the `triggers` array:

```typescript
triggers: [
  `CREATE POLICY "Custom policy" ON ${entity.table}
   FOR SELECT USING (custom_condition);`,
]
```

## 🔗 Relations

### One-to-One

```typescript
relations: {
  preferences: {
    type: 'one-to-one',
    target: 'user_preferences',
    foreignKey: 'user_id',
  },
}
```

### One-to-Many

```typescript
relations: {
  posts: {
    type: 'one-to-many',
    target: 'posts',
    foreignKey: 'author_id',
  },
}
```

### Many-to-Many

```typescript
relations: {
  tags: {
    type: 'many-to-many',
    target: 'tags',
    through: 'post_tags',
  },
}
```

## 📊 Generated Code

### TypeScript Types

```typescript
// Generated in src/lib/schema/types.ts
export interface User {
  id: string
  email: string
  name: string
  roles: string[]
  created_at: string
  updated_at: string
}

export interface CreateUserData {
  email: string
  name: string
  roles?: string[]
}

export interface UpdateUserData {
  email?: string
  name?: string
  roles?: string[]
}
```

### CRUD Services

```typescript
// Generated in src/lib/api/generated/users.ts
export class UserService {
  static async getAll(): Promise<User[]>
  static async getById(id: string): Promise<User | null>
  static async create(data: CreateUserData): Promise<User>
  static async update(id: string, data: UpdateUserData): Promise<User>
  static async delete(id: string): Promise<void>
  static async search(query: string): Promise<User[]>
}
```

## 🛠️ Workflow

### Adding a New Entity

1. **Define the entity** in `src/lib/schema/entities.ts`:

```typescript
posts: {
  name: 'Post',
  table: 'posts',
  fields: {
    id: { type: 'uuid', primary: true, default: 'gen_random_uuid()' },
    title: { type: 'varchar(255)', nullable: false, index: true },
    content: { type: 'text', nullable: false },
    author_id: {
      type: 'uuid',
      foreignKey: { table: 'users', column: 'id', onDelete: 'CASCADE' },
      index: true
    },
    status: { type: 'varchar(20)', default: "'draft'", index: true },
    created_at: { type: 'timestamp with time zone', default: 'now()', index: true },
    updated_at: { type: 'timestamp with time zone', default: 'now()' },
  },
  rls: {
    policies: ['Authors can manage own posts', 'Service role full access'],
  },
}
```

2. **Sync everything**:

```bash
npm run entity:sync
```

3. **Use the generated code**:

```typescript
import { PostService } from '@lib/api/generated/posts'
import { Post, CreatePostData } from '@lib/schema/types'

const posts = await PostService.getAll()
const newPost = await PostService.create({
  title: 'My Post',
  content: 'Post content',
  author_id: 'user-id',
})
```

### Modifying Existing Entities

1. **Update the entity definition** in `entities.ts`
2. **Run sync**: `npm run entity:sync`
3. **The system will**:
   - Update database schema
   - Regenerate TypeScript types
   - Update CRUD services
   - Preserve existing data

## 🔍 Validation

### Check Entity Definitions

```bash
npm run entity:validate
```

### List All Entities

```bash
npm run entity:list
```

### Get Template for New Entity

```bash
npm run entity:add user_preferences
```

## 📁 File Structure

```
src/lib/schema/
├── entities.ts              # Entity definitions
├── generator.ts             # Schema generator
└── types.ts                 # Generated TypeScript types

src/lib/api/generated/
├── users.ts                 # Generated CRUD service
├── posts.ts                 # Generated CRUD service
└── ...

scripts/
├── entity-sync.js           # Main sync script
└── entity-cli.js            # CLI tool
```

## 🚨 Best Practices

### Entity Design

- ✅ **Use descriptive names** for entities and fields
- ✅ **Always include timestamps** (created_at, updated_at)
- ✅ **Use UUIDs** for primary keys
- ✅ **Add proper indexes** for performance
- ✅ **Enable RLS** for security
- ✅ **Use foreign keys** for relationships

### Field Configuration

- ✅ **Set appropriate defaults** for common fields
- ✅ **Use nullable: false** for required fields
- ✅ **Add indexes** for frequently queried fields
- ✅ **Use GIN indexes** for array fields
- ✅ **Set foreign key constraints** properly

### RLS Policies

- ✅ **Always include service role access**
- ✅ **Use specific policies** for different operations
- ✅ **Test policies** thoroughly
- ✅ **Document custom policies**

## 🔧 Troubleshooting

### Common Issues

1. **Entity sync fails**:

   - Check entity definitions for syntax errors
   - Verify database connection
   - Run `npm run entity:validate`

2. **Generated types are wrong**:

   - Check field type mappings
   - Regenerate with `npm run entity:generate`

3. **RLS policies not working**:
   - Verify policy names are correct
   - Check user authentication
   - Test with service role

### Debug Commands

```bash
# Validate entities
npm run entity:validate

# Check database status
npm run db:status

# List all entities
npm run entity:list
```

## 🎯 Benefits

- **Single source of truth** for database schema
- **Automatic type safety** with TypeScript
- **Generated CRUD operations** for all entities
- **Consistent RLS policies** across all tables
- **Easy to maintain** and extend
- **Version controlled** schema changes
- **Automated deployment** with CI/CD

---

This system ensures your database schema, TypeScript types, and CRUD operations stay in perfect sync with minimal manual work! 🎉
