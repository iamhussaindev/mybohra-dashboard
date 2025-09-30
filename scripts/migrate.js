#!/usr/bin/env node

/**
 * Database Migration Runner
 * Executes SQL migrations in order
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

// Migration tracking table
const MIGRATIONS_TABLE = 'schema_migrations'

async function createMigrationsTable() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      id SERIAL PRIMARY KEY,
      version VARCHAR(255) UNIQUE NOT NULL,
      filename VARCHAR(255) NOT NULL,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  `

  try {
    await supabase.rpc('exec_sql', { sql: createTableSQL })
    console.log('✅ Migrations table ready')
  } catch (error) {
    console.error('❌ Failed to create migrations table:', error.message)
    throw error
  }
}

async function getExecutedMigrations() {
  try {
    const { data, error } = await supabase.from(MIGRATIONS_TABLE).select('version').order('version')

    if (error) throw error
    return data.map(row => row.version)
  } catch (error) {
    console.error('❌ Failed to get executed migrations:', error.message)
    return []
  }
}

async function markMigrationExecuted(version, filename) {
  try {
    const { error } = await supabase.from(MIGRATIONS_TABLE).insert({ version, filename })

    if (error) throw error
  } catch (error) {
    console.error('❌ Failed to mark migration as executed:', error.message)
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

async function runMigrations() {
  console.log('🚀 Starting database migrations...\n')

  try {
    // Create migrations table if it doesn't exist
    await createMigrationsTable()

    // Get list of migration files
    const migrationsDir = path.join(__dirname, 'migrations')
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort()

    if (migrationFiles.length === 0) {
      console.log('📝 No migration files found')
      return
    }

    // Get already executed migrations
    const executedMigrations = await getExecutedMigrations()

    let executedCount = 0

    for (const filename of migrationFiles) {
      const version = filename.replace('.sql', '')

      if (executedMigrations.includes(version)) {
        console.log(`⏭️  Skipping ${filename} (already executed)`)
        continue
      }

      console.log(`📋 Executing migration: ${filename}`)

      try {
        const sql = fs.readFileSync(path.join(migrationsDir, filename), 'utf8')
        await executeSQL(sql)
        await markMigrationExecuted(version, filename)

        console.log(`✅ Migration ${filename} executed successfully`)
        executedCount++
      } catch (error) {
        console.error(`❌ Migration ${filename} failed:`, error.message)
        throw error
      }
    }

    if (executedCount === 0) {
      console.log('📝 No new migrations to execute')
    } else {
      console.log(`\n🎉 Successfully executed ${executedCount} migration(s)`)
    }
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    process.exit(1)
  }
}

// Run migrations
if (require.main === module) {
  runMigrations()
}

module.exports = { runMigrations }
