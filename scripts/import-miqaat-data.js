#!/usr/bin/env node

/**
 * Miqaat Data Import Script
 *
 * This script imports miqaat data from miqaat.csv into the Supabase miqaat table.
 *
 * Usage:
 *   node scripts/import-miqaat-data.js
 *
 * Requirements:
 *   - NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables
 *   - miqaat.csv file in the root directory
 */

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables.')
  console.error('Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Enum mappings
const PHASE_ENUM = {
  DAY: 'DAY',
  NIGHT: 'NIGHT',
}

const MIQAAT_TYPE_ENUM = {
  URS: 'URS',
  MILAD: 'MILAD',
  WASHEQ: 'WASHEQ',
  PEHLI_RAAT: 'PEHLI_RAAT',
  SHAHADAT: 'SHAHADAT',
  ASHARA: 'ASHARA',
  IMPORTANT_NIGHT: 'IMPORTANT_NIGHT',
  EID: 'EID',
  OTHER: 'OTHER',
}

/**
 * Parse CSV line with proper handling of quoted fields
 */
function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  let i = 0

  while (i < line.length) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"'
        i += 2
        continue
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
    i++
  }

  // Add the last field
  result.push(current.trim())
  return result
}

/**
 * Convert string to boolean
 */
function parseBoolean(value) {
  if (!value || value === 'NULL' || value === '') return false
  return value.toLowerCase() === 'true'
}

/**
 * Convert string to integer or null
 */
function parseInteger(value) {
  if (!value || value === 'NULL' || value === '') return null
  const num = parseInt(value)
  return isNaN(num) ? null : num
}

/**
 * Transform CSV row to miqaat object
 */
function transformRowToMiqaat(row, headers) {
  const obj = {}

  headers.forEach((header, index) => {
    const value = row[index]

    switch (header) {
      case 'id':
        // Skip id - let database auto-generate
        break
      case 'name':
        obj.name = value || ''
        break
      case 'description':
        obj.description = value && value !== 'NULL' ? value : null
        break
      case 'date':
        obj.date = parseInteger(value)
        break
      case 'month':
        obj.month = parseInteger(value)
        break
      case 'location':
        obj.location = value && value !== 'NULL' ? value : null
        break
      case 'phase':
        obj.phase = value && PHASE_ENUM[value] ? PHASE_ENUM[value] : 'DAY'
        break
      case 'type':
        obj.type = value && MIQAAT_TYPE_ENUM[value] ? MIQAAT_TYPE_ENUM[value] : null
        break
      case 'date_night':
        obj.date_night = parseInteger(value)
        break
      case 'month_night':
        obj.month_night = parseInteger(value)
        break
      case 'priority':
        obj.priority = parseInteger(value)
        break
      case 'important':
        obj.important = parseBoolean(value)
        break
      case 'html':
      case 'is_night':
      case 'old_name':
      case 'processed':
        // Skip these fields - not in database schema
        break
      default:
        // Skip unknown fields
        break
    }
  })

  return obj
}

/**
 * Import miqaat data
 */
async function importMiqaatData() {
  try {
    console.log('🚀 Starting miqaat data import...')

    // Read CSV file from root directory
    const csvPath = path.join(__dirname, '..', 'miqaat.csv')
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found: ${csvPath}`)
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const lines = csvContent.split('\n').filter(line => line.trim())

    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header and one data row')
    }

    // Parse headers
    const headers = parseCSVLine(lines[0])
    console.log(`📋 Found ${headers.length} columns: ${headers.join(', ')}`)

    // Parse data rows
    const dataRows = lines.slice(1)
    console.log(`📊 Found ${dataRows.length} data rows`)

    // Transform data
    const miqaatItems = []
    let skippedCount = 0

    for (let i = 0; i < dataRows.length; i++) {
      const line = dataRows[i]
      if (!line.trim()) continue

      try {
        const row = parseCSVLine(line)
        const miqaatItem = transformRowToMiqaat(row, headers)

        // Validate required fields
        if (!miqaatItem.name) {
          console.warn(`⚠️  Skipping row ${i + 2}: Missing name`)
          skippedCount++
          continue
        }

        if (!miqaatItem.phase) {
          console.warn(`⚠️  Skipping row ${i + 2}: Missing phase`)
          skippedCount++
          continue
        }

        miqaatItems.push(miqaatItem)
      } catch (error) {
        console.warn(`⚠️  Skipping row ${i + 2}: ${error.message}`)
        skippedCount++
      }
    }

    console.log(`✅ Transformed ${miqaatItems.length} items (skipped ${skippedCount})`)

    if (miqaatItems.length === 0) {
      console.log('❌ No valid items to import')
      return
    }

    // Check if we should clear existing data
    const { count: existingCount, error: countError } = await supabase.from('miqaat').select('*', { count: 'exact', head: true })

    if (countError) {
      throw new Error(`Failed to check existing data: ${countError.message}`)
    }

    console.log(`📊 Found ${existingCount || 0} existing miqaat items`)

    if (existingCount > 0) {
      console.log('🗑️  Clearing existing miqaat data...')
      const { error: deleteError } = await supabase.from('miqaat').delete().neq('id', 0) // Delete all rows

      if (deleteError) {
        throw new Error(`Failed to clear existing data: ${deleteError.message}`)
      }
      console.log('✅ Cleared existing data')
    }

    // Import data in batches
    const batchSize = 100
    let importedCount = 0
    let errorCount = 0

    for (let i = 0; i < miqaatItems.length; i += batchSize) {
      const batch = miqaatItems.slice(i, i + batchSize)

      console.log(`📦 Importing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(miqaatItems.length / batchSize)} (${batch.length} items)...`)

      const { data, error } = await supabase.from('miqaat').insert(batch).select('id')

      if (error) {
        console.error(`❌ Batch import failed: ${error.message}`)
        errorCount += batch.length

        // Try individual inserts for this batch
        console.log('🔄 Attempting individual inserts...')
        for (const item of batch) {
          try {
            const { error: singleError } = await supabase.from('miqaat').insert(item)

            if (singleError) {
              console.error(`❌ Failed to import "${item.name}": ${singleError.message}`)
              errorCount++
            } else {
              importedCount++
            }
          } catch (singleError) {
            console.error(`❌ Failed to import "${item.name}": ${singleError.message}`)
            errorCount++
          }
        }
      } else {
        importedCount += data.length
        console.log(`✅ Imported ${data.length} items`)
      }
    }

    console.log('\n🎉 Import completed!')
    console.log(`✅ Successfully imported: ${importedCount} items`)
    if (errorCount > 0) {
      console.log(`❌ Failed to import: ${errorCount} items`)
    }

    // Verify import
    const { count: verifyCount, error: verifyError } = await supabase.from('miqaat').select('*', { count: 'exact', head: true })

    if (verifyError) {
      console.warn(`⚠️  Could not verify import: ${verifyError.message}`)
    } else {
      console.log(`📊 Total items in database: ${verifyCount || 0}`)
    }
  } catch (error) {
    console.error('❌ Import failed:', error.message)
    process.exit(1)
  }
}

// Run the import
if (require.main === module) {
  importMiqaatData()
    .then(() => {
      console.log('✨ Script completed successfully')
      process.exit(0)
    })
    .catch(error => {
      console.error('💥 Script failed:', error.message)
      process.exit(1)
    })
}

module.exports = { importMiqaatData }
