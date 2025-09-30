#!/usr/bin/env node

/**
 * Database Verification Script
 * Verifies database connection and schema integrity
 */

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyConnection() {
  console.log('🔌 Testing database connection...')

  try {
    const { data, error } = await supabase.from('users').select('count').limit(1)

    if (error) throw error
    console.log('✅ Database connection successful')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    return false
  }
}

async function verifySchema() {
  console.log('📋 Verifying database schema...')

  const requiredTables = ['users', 'schema_migrations']
  const results = {}

  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1)

      if (error) throw error
      results[table] = true
      console.log(`✅ Table '${table}' exists and accessible`)
    } catch (error) {
      results[table] = false
      console.error(`❌ Table '${table}' verification failed:`, error.message)
    }
  }

  return Object.values(results).every(Boolean)
}

async function verifyRLS() {
  console.log('🔒 Verifying Row Level Security...')

  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT schemaname, tablename, rowsecurity 
        FROM pg_tables 
        WHERE tablename IN ('users') 
        AND schemaname = 'public';
      `,
    })

    if (error) throw error

    const rlsEnabled = data.every(row => row.rowsecurity === true)

    if (rlsEnabled) {
      console.log('✅ Row Level Security is enabled')
    } else {
      console.log('⚠️  Row Level Security may not be properly configured')
    }

    return rlsEnabled
  } catch (error) {
    console.error('❌ RLS verification failed:', error.message)
    return false
  }
}

async function verifyIndexes() {
  console.log('📊 Verifying database indexes...')

  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT indexname, tablename 
        FROM pg_indexes 
        WHERE tablename = 'users' 
        AND schemaname = 'public';
      `,
    })

    if (error) throw error

    const expectedIndexes = ['idx_users_email', 'idx_users_roles', 'idx_users_created_at']
    const existingIndexes = data.map(row => row.indexname)

    const missingIndexes = expectedIndexes.filter(idx => !existingIndexes.includes(idx))

    if (missingIndexes.length === 0) {
      console.log('✅ All required indexes are present')
      return true
    } else {
      console.log('⚠️  Missing indexes:', missingIndexes.join(', '))
      return false
    }
  } catch (error) {
    console.error('❌ Index verification failed:', error.message)
    return false
  }
}

async function runVerification() {
  console.log('🚀 Starting database verification...\n')

  const results = {
    connection: await verifyConnection(),
    schema: await verifySchema(),
    rls: await verifyRLS(),
    indexes: await verifyIndexes(),
  }

  console.log('\n📊 Verification Results:')
  console.log('========================')
  console.log(`Connection: ${results.connection ? '✅' : '❌'}`)
  console.log(`Schema: ${results.schema ? '✅' : '❌'}`)
  console.log(`RLS: ${results.rls ? '✅' : '❌'}`)
  console.log(`Indexes: ${results.indexes ? '✅' : '❌'}`)

  const allPassed = Object.values(results).every(Boolean)

  if (allPassed) {
    console.log('\n🎉 Database verification completed successfully!')
    process.exit(0)
  } else {
    console.log('\n❌ Database verification failed. Please check the issues above.')
    process.exit(1)
  }
}

// Run verification
if (require.main === module) {
  runVerification()
}

module.exports = { runVerification }
