#!/usr/bin/env node

/**
 * Test Library Import Script
 *
 * This script tests that the library data was imported correctly and can be accessed.
 *
 * Usage:
 *   node scripts/test-library-import.js
 */

const { createClient } = require('@supabase/supabase-js')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testLibraryImport() {
  try {
    console.log('🧪 Testing library data import...')

    // Test 1: Count total items
    const { count, error: countError } = await supabase.from('library').select('*', { count: 'exact', head: true })

    if (countError) {
      throw new Error(`Failed to count items: ${countError.message}`)
    }

    console.log(`✅ Total library items: ${count}`)

    // Test 2: Get a few sample items
    const { data: sampleData, error: sampleError } = await supabase.from('library').select('id, name, album, tags, categories').limit(5).order('id')

    if (sampleError) {
      throw new Error(`Failed to get sample data: ${sampleError.message}`)
    }

    console.log('\n📋 Sample library items:')
    sampleData.forEach(item => {
      console.log(`  ${item.id}: ${item.name} (${item.album || 'No album'})`)
      if (item.tags && item.tags.length > 0) {
        console.log(`    Tags: ${item.tags.join(', ')}`)
      }
      if (item.categories && item.categories.length > 0) {
        console.log(`    Categories: ${item.categories.join(', ')}`)
      }
    })

    // Test 3: Test filtering by album
    const { data: duaItems, error: duaError } = await supabase.from('library').select('id, name').eq('album', 'DUA').limit(3)

    if (duaError) {
      throw new Error(`Failed to filter by album: ${duaError.message}`)
    }

    console.log(`\n🕌 DUA items (showing ${duaItems.length} of many):`)
    duaItems.forEach(item => {
      console.log(`  ${item.id}: ${item.name}`)
    })

    // Test 4: Test search functionality
    const { data: searchResults, error: searchError } = await supabase.from('library').select('id, name, album').ilike('name', '%quran%').limit(3)

    if (searchError) {
      throw new Error(`Failed to search: ${searchError.message}`)
    }

    console.log(`\n🔍 Search results for "quran" (${searchResults.length} items):`)
    searchResults.forEach(item => {
      console.log(`  ${item.id}: ${item.name} (${item.album})`)
    })

    // Test 5: Test items with tags
    const { data: taggedItems, error: tagError } = await supabase.from('library').select('id, name, tags, categories').not('tags', 'eq', '{}').limit(3)

    if (tagError) {
      throw new Error(`Failed to get tagged items: ${tagError.message}`)
    }

    console.log(`\n🏷️  Items with tags (${taggedItems.length} items):`)
    taggedItems.forEach(item => {
      console.log(`  ${item.id}: ${item.name}`)
      if (item.tags && item.tags.length > 0) {
        console.log(`    Tags: ${item.tags.join(', ')}`)
      }
      if (item.categories && item.categories.length > 0) {
        console.log(`    Categories: ${item.categories.join(', ')}`)
      }
    })

    // Test 6: Test items with media URLs
    const { data: mediaItems, error: mediaError } = await supabase
      .from('library')
      .select('id, name, audio_url, pdf_url, youtube_url')
      .or('audio_url.not.is.null,pdf_url.not.is.null,youtube_url.not.is.null')
      .limit(3)

    if (mediaError) {
      throw new Error(`Failed to get media items: ${mediaError.message}`)
    }

    console.log(`\n🎵 Items with media URLs (${mediaItems.length} items):`)
    mediaItems.forEach(item => {
      console.log(`  ${item.id}: ${item.name}`)
      if (item.audio_url) console.log(`    Audio: ${item.audio_url}`)
      if (item.pdf_url) console.log(`    PDF: ${item.pdf_url}`)
      if (item.youtube_url) console.log(`    YouTube: ${item.youtube_url}`)
    })

    console.log('\n🎉 All tests passed! Library data import was successful.')
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  }
}

// Run the test
if (require.main === module) {
  testLibraryImport()
    .then(() => {
      console.log('✨ Test completed successfully')
      process.exit(0)
    })
    .catch(error => {
      console.error('💥 Test failed:', error.message)
      process.exit(1)
    })
}

module.exports = { testLibraryImport }
