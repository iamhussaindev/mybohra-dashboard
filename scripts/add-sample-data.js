#!/usr/bin/env node

/**
 * Add Sample Data Script
 * Adds sample data to your database tables for testing
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

// Table constants
const USER_TABLE = 'user'

async function addSampleData() {
  console.log('🚀 Adding sample data to your database...\n')

  try {
    // Test connection
    console.log('🔌 Testing database connection...')
    const { error: testError } = await supabase.from(USER_TABLE).select('count').limit(1)

    if (testError && !testError.message.includes('relation "user" does not exist') && !testError.message.includes('Could not find the table')) {
      console.log(`❌ Connection failed: ${testError.message}`)
      return
    }

    console.log('✅ Connection successful')

    // Add sample user data
    console.log('📝 Adding sample user data...')

    const sampleUsers = [
      {
        name: 'John Doe',
        email: 'john@example.com',
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
      },
      {
        name: 'Bob Johnson',
        email: 'bob@example.com',
      },
    ]

    for (const userData of sampleUsers) {
      const { data, error } = await supabase.from(USER_TABLE).insert(userData).select()

      if (error) {
        console.log(`⚠️  Could not insert user ${userData.name}: ${error.message}`)
      } else {
        console.log(`✅ Added user: ${userData.name}`)
      }
    }

    console.log('\n🎉 Sample data added successfully!')
    console.log('   Now run: npm run schema:sync')
  } catch (error) {
    console.error('\n❌ Failed to add sample data:', error.message)
    console.log('\n💡 Manual setup:')
    console.log('   1. Go to your Supabase Dashboard > Table Editor')
    console.log('   2. Add some sample data to your user table')
    console.log('   3. Then run: npm run schema:sync')
  }
}

// CLI interface
const command = process.argv[2]

switch (command) {
  case 'add':
  case 'run':
    addSampleData()
    break
  default:
    console.log('🗄️  Sample Data Adder\n')
    console.log('Usage:')
    console.log('  node scripts/add-sample-data.js add  - Add sample data')
    console.log('')
    console.log('This script will:')
    console.log('  1. Connect to your database')
    console.log('  2. Add sample user data')
    console.log('  3. Help the schema sync generate proper types')
    break
}

module.exports = { addSampleData }
