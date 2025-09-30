#!/usr/bin/env node

/**
 * Entity-based Database Sync
 * Syncs database schema, generates types, and CRUD operations from entity definitions
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

// Import the schema generator (we'll need to transpile this)
async function loadSchemaGenerator() {
  try {
    // For now, we'll define the entities inline to avoid transpilation issues
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

    return { entities }
  } catch (error) {
    console.error('❌ Failed to load schema generator:', error.message)
    throw error
  }
}

async function executeSQL(sql) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql })
    if (error) throw error
    return data
  } catch (error) {
    console.error('SQL Execution Error:', error.message)
    throw error
  }
}

function generateTableDDL(entityName, entity) {
  const columns = Object.entries(entity.fields)
    .map(([name, field]) => {
      let columnDef = `  ${name} ${field.type}`

      if (field.primary) columnDef += ' PRIMARY KEY'
      if (!field.nullable && !field.primary) columnDef += ' NOT NULL'
      if (field.unique && !field.primary) columnDef += ' UNIQUE'
      if (field.default !== undefined) columnDef += ` DEFAULT ${field.default}`

      return columnDef
    })
    .join(',\n')

  return `CREATE TABLE IF NOT EXISTS ${entity.table} (\n${columns}\n);`
}

function generateForeignKeys(entityName, entity) {
  const constraints = []

  Object.entries(entity.fields).forEach(([name, field]) => {
    if (field.foreignKey) {
      const onDelete = field.foreignKey.onDelete || 'RESTRICT'
      constraints.push(
        `ALTER TABLE ${entity.table} ADD CONSTRAINT fk_${entity.table}_${name} 
         FOREIGN KEY (${name}) REFERENCES ${field.foreignKey.table}(${field.foreignKey.column}) 
         ON DELETE ${onDelete};`
      )
    }
  })

  return constraints
}

function generateIndexes(entityName, entity) {
  const indexes = []

  // Generate indexes from field definitions
  Object.entries(entity.fields).forEach(([name, field]) => {
    if (field.index) {
      const indexType = field.ginIndex ? 'USING GIN' : ''
      indexes.push(`CREATE INDEX IF NOT EXISTS idx_${entity.table}_${name} ON ${entity.table}(${name}) ${indexType};`)
    }
  })

  // Add custom indexes
  if (entity.indexes) {
    indexes.push(...entity.indexes)
  }

  return indexes
}

function generateRLSPolicies(entityName, entity) {
  if (!entity.rls) return []

  const policies = [`ALTER TABLE ${entity.table} ENABLE ROW LEVEL SECURITY;`]

  entity.rls.policies.forEach(policyName => {
    switch (policyName) {
      case 'Users can view own data':
        policies.push(
          `DROP POLICY IF EXISTS "Users can view own data" ON ${entity.table};
           CREATE POLICY "Users can view own data" ON ${entity.table}
           FOR SELECT USING (auth.uid() = id);`
        )
        break
      case 'Users can update own data':
        policies.push(
          `DROP POLICY IF EXISTS "Users can update own data" ON ${entity.table};
           CREATE POLICY "Users can update own data" ON ${entity.table}
           FOR UPDATE USING (auth.uid() = id);`
        )
        break
      case 'Service role full access':
        policies.push(
          `DROP POLICY IF EXISTS "Service role full access" ON ${entity.table};
           CREATE POLICY "Service role full access" ON ${entity.table}
           FOR ALL USING (auth.role() = 'service_role');`
        )
        break
    }
  })

  return policies
}

function generateEntitySQL(entityName, entity) {
  const parts = [
    generateTableDDL(entityName, entity),
    ...generateForeignKeys(entityName, entity),
    ...generateIndexes(entityName, entity),
    ...generateRLSPolicies(entityName, entity),
    ...(entity.triggers || []),
  ]

  return parts.join('\n\n')
}

function generateTypeScriptTypes(entities) {
  const types = []

  Object.entries(entities).forEach(([entityName, entity]) => {
    const typeName = entity.name
    const tableName = entity.table

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
      .filter(([name, field]) => !field.primary && field.default === undefined)
      .map(([name, field]) => {
        let tsType = getTypeScriptType(field.type)
        if (field.nullable) tsType += ' | null'
        return `  ${name}: ${tsType}`
      })
      .join('\n')

    types.push(`export interface Create${typeName}Data {\n${insertFields}\n}`)

    // Generate Update type
    const updateFields = Object.entries(entity.fields)
      .filter(([name, field]) => !field.primary)
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
  console.log('🚀 Starting entity-based database sync...\n')

  try {
    const { entities } = await loadSchemaGenerator()

    // Generate and execute SQL for each entity
    for (const [entityName, entity] of Object.entries(entities)) {
      console.log(`📋 Processing entity: ${entityName}`)

      const sql = generateEntitySQL(entityName, entity)
      await executeSQL(sql)

      console.log(`✅ Entity ${entityName} synced successfully`)
    }

    // Generate TypeScript types
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

    console.log('\n🎉 Entity-based sync completed successfully!')
    console.log('\n📁 Generated files:')
    console.log('   - src/lib/schema/types.ts (TypeScript types)')
    console.log('   - src/lib/api/generated/ (CRUD services)')
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
