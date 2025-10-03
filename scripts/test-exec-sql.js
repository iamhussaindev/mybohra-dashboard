#!/usr/bin/env node

/**
 * Test exec_sql Function
 * Tests if the exec_sql function is available and working
 */

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

async function testExecSQL() {
  console.log('🧪 Testing exec_sql function...\n')

  try {
    // Test 1: Simple query
    console.log('📋 Test 1: Simple table list query')
    const { data: tables, error: tablesError } = await supabase.rpc('exec_sql', {
      sql: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
    })

    if (tablesError) {
      console.log(`❌ exec_sql not available: ${tablesError.message}`)
      console.log('\n💡 To fix this:')
      console.log('   1. Go to your Supabase Dashboard > SQL Editor')
      console.log('   2. Copy and run the SQL from scripts/sql/enable-exec-sql.sql')
      console.log('   3. Run this test again: npm run test:exec-sql')
      return false
    }

    console.log('✅ exec_sql is working!')
    console.log(`📊 Found ${tables.length} tables: ${tables.map(t => t.table_name).join(', ')}`)

    // Test 2: Column information
    if (tables.length > 0) {
      const firstTable = tables[0].table_name
      console.log(`\n📋 Test 2: Column information for ${firstTable}`)

      const { data: columns, error: columnsError } = await supabase.rpc('exec_sql', {
        sql: `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = '${firstTable}' AND table_schema = 'public' ORDER BY ordinal_position`,
      })

      if (columnsError) {
        console.log(`⚠️  Column query failed: ${columnsError.message}`)
      } else {
        console.log('✅ Column query successful!')
        console.log(`📊 Found ${columns.length} columns in ${firstTable}`)
        columns.forEach(col => {
          console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
        })
      }
    }

    console.log('\n🎉 exec_sql is fully functional!')
    console.log('   Your schema sync scripts will now work properly.')
    return true
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    return false
  }
}

async function enableExecSQL() {
  console.log('🔧 Attempting to enable exec_sql function...\n')

  try {
    // Try to create the function
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION exec_sql(sql text)
        RETURNS json
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        DECLARE
            result json;
        BEGIN
            EXECUTE 'SELECT json_agg(row_to_json(t)) FROM (' || sql || ') t' INTO result;
            IF result IS NULL THEN
                result := '[]'::json;
            END IF;
            RETURN result;
        EXCEPTION
            WHEN OTHERS THEN
                RETURN json_build_object('error', true, 'message', SQLERRM, 'code', SQLSTATE);
        END;
        $$;
      `,
    })

    if (error) {
      console.log('❌ Could not create exec_sql function automatically')
      console.log('💡 Manual setup required:')
      console.log('   1. Go to your Supabase Dashboard > SQL Editor')
      console.log('   2. Copy and run the SQL from scripts/sql/enable-exec-sql.sql')
      return false
    }

    console.log('✅ exec_sql function created successfully!')
    return true
  } catch (error) {
    console.log('❌ Could not enable exec_sql:', error.message)
    return false
  }
}

// CLI interface
const command = process.argv[2]

switch (command) {
  case 'test':
    testExecSQL()
    break
  case 'enable':
    enableExecSQL()
    break
  default:
    console.log('🧪 exec_sql Test & Setup\n')
    console.log('Usage:')
    console.log('  node scripts/test-exec-sql.js test    - Test if exec_sql works')
    console.log('  node scripts/test-exec-sql.js enable  - Try to enable exec_sql')
    console.log('')
    console.log('This script will:')
    console.log('  1. Test if exec_sql function is available')
    console.log('  2. Show you how to enable it if missing')
    console.log('  3. Verify it works with your database')
    break
}

module.exports = { testExecSQL, enableExecSQL }
