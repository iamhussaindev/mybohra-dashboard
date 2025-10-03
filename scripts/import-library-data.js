#!/usr/bin/env node

/**
 * Library Data Import Script
 *
 * This script imports library data from library.csv into the Supabase library table.
 *
 * Usage:
 *   node scripts/import-library-data.js
 *
 * Requirements:
 *   - NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables
 *   - library.csv file in the scripts directory
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

// Album enum mapping
const ALBUM_ENUM = {
  MADEH: 'MADEH',
  NOHA: 'NOHA',
  SALAAM: 'SALAAM',
  ILTEJA: 'ILTEJA',
  QURAN: 'QURAN',
  DUA: 'DUA',
  MUNAJAAT: 'MUNAJAAT',
  MANQABAT: 'MANQABAT',
  NAAT: 'NAAT',
  RASA: 'RASA',
  QASIDA: 'QASIDA',
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
 * Parse PostgreSQL array format like {item1,item2,item3}
 */
function parsePostgreSQLArray(arrayStr) {
  if (!arrayStr || arrayStr === 'NULL' || arrayStr === '{}') {
    return []
  }

  // Remove curly braces
  const content = arrayStr.replace(/^{|}$/g, '')
  if (!content) return []

  // Split by comma and clean up
  return content.split(',').map(item => item.trim().replace(/^"|"$/g, ''))
}

/**
 * Parse JSON metadata
 */
function parseMetadata(metadataStr) {
  if (!metadataStr || metadataStr === 'NULL' || metadataStr === '{}') {
    return {}
  }

  try {
    return JSON.parse(metadataStr)
  } catch (error) {
    console.warn(`⚠️  Failed to parse metadata: ${metadataStr}`)
    return {}
  }
}

/**
 * Transform CSV row to library object
 */
function transformRowToLibrary(row, headers) {
  const obj = {}

  headers.forEach((header, index) => {
    const value = row[index]

    switch (header) {
      case 'id':
        obj.id = parseInt(value) || null
        break
      case 'name':
        obj.name = value || ''
        break
      case 'description':
        obj.description = value || null
        break
      case 'audio':
        obj.audio_url = value && value !== 'NULL' ? value : null
        break
      case 'pdf':
        obj.pdf_url = value && value !== 'NULL' ? value : null
        break
      case 'youtube':
        obj.youtube_url = value && value !== 'NULL' ? value : null
        break
      case 'album':
        obj.album = value && ALBUM_ENUM[value] ? ALBUM_ENUM[value] : null
        break
      case 'metadata':
        obj.metadata = parseMetadata(value)
        break
      case 'created_at':
        obj.created_at = value || new Date().toISOString()
        break
      case 'updated_at':
        obj.updated_at = value || new Date().toISOString()
        break
      case 'tags':
        obj.tags = parsePostgreSQLArray(value)
        break
      case 'categories':
        obj.categories = parsePostgreSQLArray(value)
        break
      default:
        // Skip unknown fields
        break
    }
  })

  return obj
}

/**
 * Import library data
 */
async function importLibraryData() {
  try {
    console.log('🚀 Starting library data import...')

    // Read CSV file
    const csvPath = path.join(__dirname, 'library.csv')
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
    const libraryItems = []
    let skippedCount = 0

    for (let i = 0; i < dataRows.length; i++) {
      const line = dataRows[i]
      if (!line.trim()) continue

      try {
        const row = parseCSVLine(line)
        const libraryItem = transformRowToLibrary(row, headers)

        // Validate required fields
        if (!libraryItem.name) {
          console.warn(`⚠️  Skipping row ${i + 2}: Missing name`)
          skippedCount++
          continue
        }

        libraryItems.push(libraryItem)
      } catch (error) {
        console.warn(`⚠️  Skipping row ${i + 2}: ${error.message}`)
        skippedCount++
      }
    }

    console.log(`✅ Transformed ${libraryItems.length} items (skipped ${skippedCount})`)

    if (libraryItems.length === 0) {
      console.log('❌ No valid items to import')
      return
    }

    // Check if we should clear existing data
    const { count: existingCount, error: countError } = await supabase.from('library').select('*', { count: 'exact', head: true })

    if (countError) {
      throw new Error(`Failed to check existing data: ${countError.message}`)
    }

    console.log(`📊 Found ${existingCount || 0} existing library items`)

    if (existingCount > 0) {
      console.log('🗑️  Clearing existing library data...')
      const { error: deleteError } = await supabase.from('library').delete().neq('id', 0) // Delete all rows

      if (deleteError) {
        throw new Error(`Failed to clear existing data: ${deleteError.message}`)
      }
      console.log('✅ Cleared existing data')
    }

    // Import data in batches
    const batchSize = 100
    let importedCount = 0
    let errorCount = 0

    for (let i = 0; i < libraryItems.length; i += batchSize) {
      const batch = libraryItems.slice(i, i + batchSize)

      console.log(`📦 Importing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(libraryItems.length / batchSize)} (${batch.length} items)...`)

      const { data, error } = await supabase.from('library').insert(batch).select('id')

      if (error) {
        console.error(`❌ Batch import failed: ${error.message}`)
        errorCount += batch.length

        // Try individual inserts for this batch
        console.log('🔄 Attempting individual inserts...')
        for (const item of batch) {
          try {
            const { error: singleError } = await supabase.from('library').insert(item)

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
    const { count: verifyCount, error: verifyError } = await supabase.from('library').select('*', { count: 'exact', head: true })

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
  importLibraryData()
    .then(() => {
      console.log('✨ Script completed successfully')
      process.exit(0)
    })
    .catch(error => {
      console.error('💥 Script failed:', error.message)
      process.exit(1)
    })
}

module.exports = { importLibraryData }
