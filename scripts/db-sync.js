#!/usr/bin/env node

/**
 * Database Sync Script
 * Automatically syncs database schema and data with Supabase
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

// Database schema definitions
const schemas = {
  users: {
    table: 'users',
    columns: {
      id: 'uuid PRIMARY KEY DEFAULT gen_random_uuid()',
      email: 'varchar(255) UNIQUE NOT NULL',
      phone_number: 'varchar(20)',
      name: 'varchar(255) NOT NULL',
      roles: "text[] DEFAULT ARRAY['user']",
      created_at: 'timestamp with time zone DEFAULT now()',
      updated_at: 'timestamp with time zone DEFAULT now()',
      created_by: 'uuid REFERENCES auth.users(id)',
      updated_by: 'uuid REFERENCES auth.users(id)',
    },
    indexes: [
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);',
      'CREATE INDEX IF NOT EXISTS idx_users_roles ON users USING GIN(roles);',
      'CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);',
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

// RLS Policies
const rlsPolicies = {
  users: [
    `-- Enable RLS
     ALTER TABLE users ENABLE ROW LEVEL SECURITY;`,

    `-- Policy: Users can view their own data
     DROP POLICY IF EXISTS "Users can view own data" ON users;
     CREATE POLICY "Users can view own data" ON users
     FOR SELECT USING (auth.uid() = id);`,

    `-- Policy: Users can update their own data
     DROP POLICY IF EXISTS "Users can update own data" ON users;
     CREATE POLICY "Users can update own data" ON users
     FOR UPDATE USING (auth.uid() = id);`,

    `-- Policy: Service role can do everything
     DROP POLICY IF EXISTS "Service role full access" ON users;
     CREATE POLICY "Service role full access" ON users
     FOR ALL USING (auth.role() = 'service_role');`,
  ],
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

async function createTable(schemaName, schema) {
  console.log(`📋 Creating table: ${schemaName}`)

  const columns = Object.entries(schema.columns)
    .map(([name, definition]) => `  ${name} ${definition}`)
    .join(',\n')

  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS ${schemaName} (
      ${columns}
    );
  `

  await executeSQL(createTableSQL)

  // Create indexes
  for (const indexSQL of schema.indexes) {
    await executeSQL(indexSQL)
  }

  // Create triggers
  for (const triggerSQL of schema.triggers) {
    await executeSQL(triggerSQL)
  }

  console.log(`✅ Table ${schemaName} created successfully`)
}

async function setupRLS(schemaName, policies) {
  console.log(`🔒 Setting up RLS for: ${schemaName}`)

  for (const policySQL of policies) {
    await executeSQL(policySQL)
  }

  console.log(`✅ RLS policies for ${schemaName} created successfully`)
}

async function syncDatabase() {
  console.log('🚀 Starting database sync...\n')

  try {
    // Create tables
    for (const [schemaName, schema] of Object.entries(schemas)) {
      await createTable(schemaName, schema)
    }

    // Setup RLS policies
    for (const [schemaName, policies] of Object.entries(rlsPolicies)) {
      await setupRLS(schemaName, policies)
    }

    console.log('\n🎉 Database sync completed successfully!')
  } catch (error) {
    console.error('\n❌ Database sync failed:', error.message)
    process.exit(1)
  }
}

// Run the sync
if (require.main === module) {
  syncDatabase()
}

module.exports = { syncDatabase, schemas, rlsPolicies }
