/**
 * Schema Generator
 * Generates database schema, TypeScript types, and CRUD operations from entity definitions
 */

import { entities, Entity } from './entities'

export class SchemaGenerator {
  private entities: Record<string, Entity>

  constructor(entities: Record<string, Entity>) {
    this.entities = entities
  }

  /**
   * Generate SQL DDL for creating tables
   */
  generateTableDDL(entityName: string): string {
    const entity = this.entities[entityName]
    if (!entity) throw new Error(`Entity ${entityName} not found`)

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

  /**
   * Generate foreign key constraints
   */
  generateForeignKeys(entityName: string): string[] {
    const entity = this.entities[entityName]
    if (!entity) return []

    const constraints: string[] = []

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

  /**
   * Generate indexes
   */
  generateIndexes(entityName: string): string[] {
    const entity = this.entities[entityName]
    if (!entity) return []

    const indexes: string[] = []

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

  /**
   * Generate RLS policies
   */
  generateRLSPolicies(entityName: string): string[] {
    const entity = this.entities[entityName]
    if (!entity || !entity.rls) return []

    const policies: string[] = [`ALTER TABLE ${entity.table} ENABLE ROW LEVEL SECURITY;`]

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
        case 'Users can manage own preferences':
          policies.push(
            `DROP POLICY IF EXISTS "Users can manage own preferences" ON ${entity.table};
             CREATE POLICY "Users can manage own preferences" ON ${entity.table}
             FOR ALL USING (auth.uid() = user_id);`
          )
          break
        case 'Users can view published posts':
          policies.push(
            `DROP POLICY IF EXISTS "Users can view published posts" ON ${entity.table};
             CREATE POLICY "Users can view published posts" ON ${entity.table}
             FOR SELECT USING (status = 'published');`
          )
          break
        case 'Authors can manage own posts':
          policies.push(
            `DROP POLICY IF EXISTS "Authors can manage own posts" ON ${entity.table};
             CREATE POLICY "Authors can manage own posts" ON ${entity.table}
             FOR ALL USING (auth.uid() = author_id);`
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

  /**
   * Generate triggers
   */
  generateTriggers(entityName: string): string[] {
    const entity = this.entities[entityName]
    if (!entity || !entity.triggers) return []

    return entity.triggers
  }

  /**
   * Generate complete SQL for an entity
   */
  generateEntitySQL(entityName: string): string {
    const parts = [
      this.generateTableDDL(entityName),
      ...this.generateForeignKeys(entityName),
      ...this.generateIndexes(entityName),
      ...this.generateRLSPolicies(entityName),
      ...this.generateTriggers(entityName),
    ]

    return parts.join('\n\n')
  }

  /**
   * Generate TypeScript types
   */
  generateTypeScriptTypes(): string {
    const types: string[] = []

    Object.values(this.entities).forEach(entity => {
      const typeName = entity.name

      // Generate base type
      const fields = Object.entries(entity.fields)
        .map(([name, field]) => {
          let tsType = this.getTypeScriptType(field.type)
          if (field.nullable) tsType += ' | null'
          return `  ${name}: ${tsType}`
        })
        .join('\n')

      types.push(`export interface ${typeName} {\n${fields}\n}`)

      // Generate Insert type
      const insertFields = Object.entries(entity.fields)
        .filter(([, field]) => !field.primary && field.default === undefined)
        .map(([name, field]) => {
          let tsType = this.getTypeScriptType(field.type)
          if (field.nullable) tsType += ' | null'
          return `  ${name}: ${tsType}`
        })
        .join('\n')

      types.push(`export interface Create${typeName}Data {\n${insertFields}\n}`)

      // Generate Update type
      const updateFields = Object.entries(entity.fields)
        .filter(([, field]) => !field.primary)
        .map(([name, field]) => {
          let tsType = this.getTypeScriptType(field.type)
          if (field.nullable) tsType += ' | null'
          return `  ${name}?: ${tsType}`
        })
        .join('\n')

      types.push(`export interface Update${typeName}Data {\n${updateFields}\n}`)
    })

    return types.join('\n\n')
  }

  /**
   * Convert database type to TypeScript type
   */
  private getTypeScriptType(dbType: string): string {
    if (dbType.includes('uuid')) return 'string'
    if (dbType.includes('varchar') || dbType.includes('text')) return 'string'
    if (dbType.includes('int') || dbType.includes('serial')) return 'number'
    if (dbType.includes('boolean')) return 'boolean'
    if (dbType.includes('timestamp')) return 'string' // ISO string
    if (dbType.includes('[]')) return 'string[]' // Array types
    return 'any'
  }

  /**
   * Generate CRUD service class
   */
  generateCRUDService(entityName: string): string {
    const entity = this.entities[entityName]
    if (!entity) throw new Error(`Entity ${entityName} not found`)

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

  /**
   * Generate all CRUD services
   */
  generateAllCRUDServices(): string {
    const services = Object.keys(this.entities).map(entityName => this.generateCRUDService(entityName))

    return services.join('\n\n')
  }

  /**
   * Generate complete database schema
   */
  generateCompleteSchema(): string {
    const allSQL = Object.keys(this.entities).map(entityName => this.generateEntitySQL(entityName))

    return allSQL.join('\n\n')
  }
}

// Export singleton instance
export const schemaGenerator = new SchemaGenerator(entities)
