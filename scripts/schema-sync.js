#!/usr/bin/env node

/**
 * Schema Sync Script
 * Reads Supabase database schema and generates TypeScript types and CRUD operations
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

// Table information cache
let tableInfo = new Map()

async function testConnection() {
  console.log('🔌 Testing database connection...')

  try {
    // Try a simple query to test connection
    const { data, error } = await supabase.from('users').select('count').limit(1)

    if (error) {
      if (error.message.includes('relation "users" does not exist') || error.message.includes('Could not find the table')) {
        console.log('✅ Connection successful (users table not found - will scan for available tables)')
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

async function getTableList() {
  console.log('📋 Discovering database tables...')

  try {
    // Query information_schema to get all tables
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT table_name, table_schema 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `,
    })

    if (error) {
      console.log('⚠️  exec_sql not available, trying alternative approach...')
      return await getTableListAlternative()
    }

    const tables = data.map(row => row.table_name)
    console.log(`✅ Found ${tables.length} tables: ${tables.join(', ')}`)
    return tables
  } catch (error) {
    console.log('⚠️  exec_sql failed, trying alternative approach...')
    return await getTableListAlternative()
  }
}

async function getTableListAlternative() {
  // Try to discover tables by attempting to query common table names
  const commonTables = ['users', 'posts', 'comments', 'categories', 'products', 'orders', 'profiles']
  const existingTables = []

  for (const tableName of commonTables) {
    try {
      const { error } = await supabase.from(tableName).select('*').limit(1)
      if (!error) {
        existingTables.push(tableName)
      }
    } catch (error) {
      // Table doesn't exist, continue
    }
  }

  if (existingTables.length > 0) {
    console.log(`✅ Found ${existingTables.length} tables: ${existingTables.join(', ')}`)
    return existingTables
  } else {
    console.log('⚠️  No tables found in common table names.')
    console.log('💡 Tip: Create some tables in your Supabase database, or the script will create example types.')
    return []
  }
}

async function getTableSchema(tableName) {
  console.log(`🔍 Analyzing table: ${tableName}`)

  try {
    // Get table columns information
    const { data: columns, error: columnsError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length,
          numeric_precision,
          numeric_scale
        FROM information_schema.columns 
        WHERE table_name = '${tableName}' 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `,
    })

    if (columnsError) {
      console.log(`⚠️  Could not get schema for ${tableName}, using sample data approach...`)
      return await getTableSchemaAlternative(tableName)
    }

    // Get primary key information
    const { data: primaryKeys, error: pkError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT column_name
        FROM information_schema.key_column_usage
        WHERE table_name = '${tableName}' 
        AND table_schema = 'public'
        AND constraint_name IN (
          SELECT constraint_name
          FROM information_schema.table_constraints
          WHERE table_name = '${tableName}' 
          AND table_schema = 'public'
          AND constraint_type = 'PRIMARY KEY'
        );
      `,
    })

    // Get foreign key information
    const { data: foreignKeys, error: fkError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          column_name,
          referenced_table_name,
          referenced_column_name
        FROM information_schema.key_column_usage
        WHERE table_name = '${tableName}' 
        AND table_schema = 'public'
        AND constraint_name IN (
          SELECT constraint_name
          FROM information_schema.table_constraints
          WHERE table_name = '${tableName}' 
          AND table_schema = 'public'
          AND constraint_type = 'FOREIGN KEY'
        );
      `,
    })

    const schema = {
      name: tableName,
      columns: columns || [],
      primaryKeys: primaryKeys || [],
      foreignKeys: foreignKeys || [],
    }

    tableInfo.set(tableName, schema)
    return schema
  } catch (error) {
    console.log(`⚠️  Error getting schema for ${tableName}: ${error.message}`)
    return await getTableSchemaAlternative(tableName)
  }
}

async function getTableSchemaAlternative(tableName) {
  try {
    // Try to get a sample row to understand the structure
    const { data, error } = await supabase.from(tableName).select('*').limit(1)

    if (error) {
      console.log(`❌ Could not access table ${tableName}: ${error.message}`)
      return null
    }

    if (data && data.length > 0) {
      const sampleRow = data[0]
      const columns = Object.keys(sampleRow).map(key => ({
        column_name: key,
        data_type: inferDataType(sampleRow[key]),
        is_nullable: sampleRow[key] === null ? 'YES' : 'NO',
        column_default: null,
      }))

      const schema = {
        name: tableName,
        columns: columns,
        primaryKeys: ['id'], // Assume id is primary key
        foreignKeys: [],
      }

      tableInfo.set(tableName, schema)
      return schema
    } else {
      console.log(`⚠️  Table ${tableName} is empty, using default schema...`)
      return {
        name: tableName,
        columns: [
          { column_name: 'id', data_type: 'uuid', is_nullable: 'NO', column_default: 'gen_random_uuid()' },
          { column_name: 'created_at', data_type: 'timestamp with time zone', is_nullable: 'NO', column_default: 'now()' },
          { column_name: 'updated_at', data_type: 'timestamp with time zone', is_nullable: 'NO', column_default: 'now()' },
        ],
        primaryKeys: ['id'],
        foreignKeys: [],
      }
    }
  } catch (error) {
    console.log(`❌ Error analyzing table ${tableName}: ${error.message}`)
    return null
  }
}

function inferDataType(value) {
  if (value === null) return 'text'
  if (typeof value === 'string') {
    if (value.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return 'uuid'
    }
    if (value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
      return 'timestamp with time zone'
    }
    return 'text'
  }
  if (typeof value === 'number') return 'integer'
  if (typeof value === 'boolean') return 'boolean'
  if (Array.isArray(value)) return 'text[]'
  return 'text'
}

function getTypeScriptType(column) {
  const { data_type, is_nullable } = column

  let tsType = 'any'

  if (data_type.includes('uuid')) tsType = 'string'
  else if (data_type.includes('varchar') || data_type.includes('text')) tsType = 'string'
  else if (data_type.includes('int') || data_type.includes('serial')) tsType = 'number'
  else if (data_type.includes('boolean')) tsType = 'boolean'
  else if (data_type.includes('timestamp')) tsType = 'string'
  else if (data_type.includes('[]')) tsType = 'string[]'

  if (is_nullable === 'YES') tsType += ' | null'

  return tsType
}

function generateTypeScriptTypes(schemas) {
  const types = []

  schemas.forEach(schema => {
    if (!schema) return

    const typeName = schema.name.charAt(0).toUpperCase() + schema.name.slice(1)

    // Generate base interface
    const fields = schema.columns
      .map(column => {
        const tsType = getTypeScriptType(column)
        return `  ${column.column_name}: ${tsType}`
      })
      .join('\n')

    types.push(`export interface ${typeName} {\n${fields}\n}`)

    // Generate Create interface (exclude auto-generated fields)
    const createFields = schema.columns
      .filter(column => !column.column_name.includes('id') && !column.column_name.includes('created_at') && !column.column_name.includes('updated_at') && !column.column_default)
      .map(column => {
        const tsType = getTypeScriptType(column)
        return `  ${column.column_name}: ${tsType}`
      })
      .join('\n')

    if (createFields) {
      types.push(`export interface Create${typeName}Data {\n${createFields}\n}`)
    }

    // Generate Update interface (all fields optional)
    const updateFields = schema.columns
      .filter(column => !column.column_name.includes('id'))
      .map(column => {
        const tsType = getTypeScriptType(column)
        return `  ${column.column_name}?: ${tsType}`
      })
      .join('\n')

    types.push(`export interface Update${typeName}Data {\n${updateFields}\n}`)
  })

  return types.join('\n\n')
}

function generateCRUDService(schema) {
  if (!schema) return ''

  const typeName = schema.name.charAt(0).toUpperCase() + schema.name.slice(1)
  const tableName = schema.name

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

async function syncSchema() {
  console.log('🚀 Starting schema sync...\n')

  try {
    // Test connection
    const connected = await testConnection()
    if (!connected) {
      console.log('❌ Cannot proceed without database connection')
      return
    }

    // Get list of tables
    const tables = await getTableList()
    if (tables.length === 0) {
      console.log('❌ No tables found in database')
      console.log('\n💡 To get started:')
      console.log('   1. Create some tables in your Supabase database')
      console.log('   2. Run this script again: npm run schema:sync')
      console.log('   3. Or check the SCHEMA_SYNC_GUIDE.md for more information')
      return
    }

    // Get schema for each table
    const schemas = []
    for (const tableName of tables) {
      const schema = await getTableSchema(tableName)
      if (schema) {
        schemas.push(schema)
      }
    }

    if (schemas.length === 0) {
      console.log('❌ No valid schemas found')
      return
    }

    console.log(`\n📝 Generating TypeScript types for ${schemas.length} tables...`)

    // Generate TypeScript types
    const types = generateTypeScriptTypes(schemas)

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

    for (const schema of schemas) {
      const service = generateCRUDService(schema)
      const serviceFile = path.join(servicesDir, `${schema.name}.ts`)
      fs.writeFileSync(serviceFile, service)
    }

    console.log('✅ CRUD services generated')

    console.log('\n🎉 Schema sync completed successfully!')
    console.log('\n📁 Generated files:')
    console.log('   - src/lib/schema/types.ts (TypeScript types)')
    console.log('   - src/lib/api/generated/ (CRUD services)')

    console.log('\n💡 Next steps:')
    console.log('   1. Use the generated types in your components')
    console.log('   2. Import and use the generated services')
    console.log('   3. Run this script again when your database schema changes')
  } catch (error) {
    console.error('\n❌ Schema sync failed:', error.message)
    process.exit(1)
  }
}

// CLI interface
const command = process.argv[2]

switch (command) {
  case 'sync':
  case 'run':
    syncSchema()
    break
  case 'status':
    console.log('📊 Schema Sync Status\n')
    console.log('This script will:')
    console.log('  1. Connect to your Supabase database')
    console.log('  2. Read the current schema')
    console.log('  3. Generate TypeScript types')
    console.log('  4. Generate CRUD services')
    console.log('')
    console.log('Usage:')
    console.log('  node scripts/schema-sync.js sync  - Run schema sync')
    console.log('  node scripts/schema-sync.js status - Show this help')
    break
  default:
    console.log('🗄️  Schema Sync System\n')
    console.log('Usage:')
    console.log('  node scripts/schema-sync.js sync  - Sync schema and generate code')
    console.log('  node scripts/schema-sync.js status - Show status information')
    console.log('')
    console.log('This system will:')
    console.log('  1. Connect to your Supabase database')
    console.log('  2. Read the current schema from all tables')
    console.log('  3. Generate TypeScript types automatically')
    console.log('  4. Generate CRUD services for each table')
    console.log('  5. Update your codebase with the latest schema')
    break
}

module.exports = { syncSchema }
