#!/usr/bin/env node

/**
 * Simple Entity Sync (No exec_sql required)
 * Syncs database schema using direct Supabase client operations
 */

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Simple entity definitions
const entities = {
  users: {
    name: 'User',
    table: 'users',
    fields: {
      id: { type: 'uuid', primary: true, default: 'gen_random_uuid()' },
      email: { type: 'varchar(255)', nullable: false, unique: true, index: true },
      phone_number: { type: 'varchar(20)', nullable: true },
      name: { type: 'varchar(255)', nullable: false },
      roles: { type: 'text[]', default: "ARRAY['user']", ginIndex: true },
      created_at: { type: 'timestamp with time zone', default: 'now()', index: true },
      updated_at: { type: 'timestamp with time zone', default: 'now()' },
      created_by: { type: 'uuid', foreignKey: { table: 'auth.users', column: 'id', onDelete: 'SET NULL' } },
      updated_by: { type: 'uuid', foreignKey: { table: 'auth.users', column: 'id', onDelete: 'SET NULL' } },
    },
    rls: {
      policies: ['Users can view own data', 'Users can update own data', 'Service role full access'],
    },
    indexes: [
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_users_roles ON users USING GIN(roles)',
      'CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at)',
    ],
    triggers: [
      `CREATE OR REPLACE FUNCTION update_updated_at_column()
       RETURNS TRIGGER AS $$
       BEGIN
           NEW.updated_at = now();
           RETURN NEW;
       END;
       $$ language 'plpgsql';`,
      `DROP TRIGGER IF EXISTS update_users_updated_at ON users;
       CREATE TRIGGER update_users_updated_at
       BEFORE UPDATE ON users
       FOR EACH ROW
       EXECUTE FUNCTION update_updated_at_column();`,
    ],
  },
}

async function testConnection() {
  console.log('🔌 Testing database connection...')

  try {
    // Try a simple query to test connection
    const { data, error } = await supabase.from('users').select('count').limit(1)

    if (error) {
      if (error.message.includes('relation "users" does not exist')) {
        console.log('✅ Connection successful (users table not found - expected)')
        return true
      } else {
        console.log(`❌ Connection failed: ${error.message}`)
        return false
      }
    } else {
      console.log('✅ Connection successful')
      return true
    }
  } catch (error) {
    console.log(`❌ Connection failed: ${error.message}`)
    return false
  }
}

function generateTypeScriptTypes(entities) {
  const types = []

  Object.entries(entities).forEach(([entityName, entity]) => {
    const typeName = entity.name

    // Generate base type
    const fields = Object.entries(entity.fields)
      .map(([name, field]) => {
        let tsType = getTypeScriptType(field.type)
        if (field.nullable) tsType += ' | null'
        return `  ${name}: ${tsType}`
      })
      .join('\n')

    types.push(`export interface ${typeName} {\n${fields}\n}`)

    // Generate Insert type
    const insertFields = Object.entries(entity.fields)
      .filter(([, field]) => !field.primary && field.default === undefined)
      .map(([name, field]) => {
        let tsType = getTypeScriptType(field.type)
        if (field.nullable) tsType += ' | null'
        return `  ${name}: ${tsType}`
      })
      .join('\n')

    types.push(`export interface Create${typeName}Data {\n${insertFields}\n}`)

    // Generate Update type
    const updateFields = Object.entries(entity.fields)
      .filter(([, field]) => !field.primary)
      .map(([name, field]) => {
        let tsType = getTypeScriptType(field.type)
        if (field.nullable) tsType += ' | null'
        return `  ${name}?: ${tsType}`
      })
      .join('\n')

    types.push(`export interface Update${typeName}Data {\n${updateFields}\n}`)
  })

  return types.join('\n\n')
}

function getTypeScriptType(dbType) {
  if (dbType.includes('uuid')) return 'string'
  if (dbType.includes('varchar') || dbType.includes('text')) return 'string'
  if (dbType.includes('int') || dbType.includes('serial')) return 'number'
  if (dbType.includes('boolean')) return 'boolean'
  if (dbType.includes('timestamp')) return 'string' // ISO string
  if (dbType.includes('[]')) return 'string[]' // Array types
  return 'any'
}

function generateCRUDService(entityName, entity) {
  const typeName = entity.name
  const tableName = entity.table

  return `
import { supabase } from '@lib/config/supabase'
import { ${typeName}, Create${typeName}Data, Update${typeName}Data } from '@lib/schema/types'

export class ${typeName}Service {
  static async getAll(): Promise<${typeName}[]> {
    const { data, error } = await supabase
      .from('${tableName}')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  static async getById(id: string): Promise<${typeName} | null> {
    const { data, error } = await supabase
      .from('${tableName}')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  static async create(data: Create${typeName}Data): Promise<${typeName}> {
    const { data: result, error } = await supabase
      .from('${tableName}')
      .insert(data)
      .select()
      .single()
    
    if (error) throw error
    return result
  }

  static async update(id: string, data: Update${typeName}Data): Promise<${typeName}> {
    const { data: result, error } = await supabase
      .from('${tableName}')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return result
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('${tableName}')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  static async search(query: string): Promise<${typeName}[]> {
    const { data, error } = await supabase
      .from('${tableName}')
      .select('*')
      .or(\`name.ilike.%\${query}%,email.ilike.%\${query}%\`)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }
}`
}

async function syncDatabase() {
  console.log('🚀 Starting simple entity sync...\n')

  try {
    // Test connection first
    const connected = await testConnection()
    if (!connected) {
      console.log('❌ Cannot proceed without database connection')
      return
    }

    console.log('\n📝 Generating TypeScript types...')
    const types = generateTypeScriptTypes(entities)

    const typesDir = path.join(__dirname, '..', 'src', 'lib', 'schema')
    if (!fs.existsSync(typesDir)) {
      fs.mkdirSync(typesDir, { recursive: true })
    }

    fs.writeFileSync(path.join(typesDir, 'types.ts'), types)
    console.log('✅ TypeScript types generated')

    // Generate CRUD services
    console.log('🔧 Generating CRUD services...')
    const servicesDir = path.join(__dirname, '..', 'src', 'lib', 'api', 'generated')
    if (!fs.existsSync(servicesDir)) {
      fs.mkdirSync(servicesDir, { recursive: true })
    }

    for (const [entityName, entity] of Object.entries(entities)) {
      const service = generateCRUDService(entityName, entity)
      const serviceFile = path.join(servicesDir, `${entityName}.ts`)
      fs.writeFileSync(serviceFile, service)
    }

    console.log('✅ CRUD services generated')

    console.log('\n🎉 Simple entity sync completed successfully!')
    console.log('\n📁 Generated files:')
    console.log('   - src/lib/schema/types.ts (TypeScript types)')
    console.log('   - src/lib/api/generated/ (CRUD services)')

    console.log('\n💡 Next steps:')
    console.log('   1. Set up your database tables manually in Supabase dashboard')
    console.log('   2. Use the generated services in your components')
    console.log('   3. The services will work once tables are created')
  } catch (error) {
    console.error('\n❌ Entity sync failed:', error.message)
    process.exit(1)
  }
}

// Run the sync
if (require.main === module) {
  syncDatabase()
}

module.exports = { syncDatabase }
