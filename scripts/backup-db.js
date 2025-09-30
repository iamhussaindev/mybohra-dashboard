#!/usr/bin/env node

/**
 * Database Backup Script
 * Creates backups of critical database data
 */

const fs = require('fs')
const path = require('path')
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

async function backupTable(tableName) {
  console.log(`📋 Backing up table: ${tableName}`)

  try {
    const { data, error } = await supabase.from(tableName).select('*')

    if (error) throw error

    const backup = {
      table: tableName,
      timestamp: new Date().toISOString(),
      recordCount: data.length,
      data: data,
    }

    return backup
  } catch (error) {
    console.error(`❌ Failed to backup ${tableName}:`, error.message)
    return null
  }
}

async function createBackup() {
  console.log('🚀 Starting database backup...\n')

  const backupDir = path.join(__dirname, '..', 'backups')

  // Create backups directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupFile = path.join(backupDir, `backup-${timestamp}.json`)

  try {
    // Backup critical tables
    const tables = ['users', 'schema_migrations']
    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      tables: {},
    }

    for (const table of tables) {
      const tableBackup = await backupTable(table)
      if (tableBackup) {
        backup.tables[table] = tableBackup
      }
    }

    // Write backup file
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2))

    console.log(`\n✅ Backup created successfully: ${backupFile}`)
    console.log(`📊 Tables backed up: ${Object.keys(backup.tables).length}`)

    // Show summary
    for (const [tableName, tableBackup] of Object.entries(backup.tables)) {
      console.log(`   ${tableName}: ${tableBackup.recordCount} records`)
    }
  } catch (error) {
    console.error('❌ Backup failed:', error.message)
    process.exit(1)
  }
}

// Run backup
if (require.main === module) {
  createBackup()
}

module.exports = { createBackup }
