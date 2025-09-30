#!/usr/bin/env node

/**
 * Environment Variables Checker
 * Simple script to check if environment variables are set correctly
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Environment Variables Check\n')

console.log('📋 Current Environment Variables:')
console.log('================================')

if (!supabaseUrl) {
  console.log('❌ NEXT_PUBLIC_SUPABASE_URL: Missing')
  console.log('   Expected format: https://your-project-id.supabase.co')
} else {
  console.log('✅ NEXT_PUBLIC_SUPABASE_URL: Present')
  console.log(`   Value: ${supabaseUrl}`)

  // Validate URL format
  if (supabaseUrl.includes('supabase.co') && supabaseUrl.startsWith('https://')) {
    console.log('✅ URL format looks correct')
  } else {
    console.log('⚠️  URL format might be incorrect')
    console.log('   Should be: https://your-project-id.supabase.co')
  }
}

if (!supabaseAnonKey) {
  console.log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY: Missing')
  console.log('   Get this from: Supabase Dashboard > Settings > API')
} else {
  console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: Present')
  console.log(`   Length: ${supabaseAnonKey.length} characters`)
  console.log(`   Starts with: ${supabaseAnonKey.substring(0, 20)}...`)

  // Validate JWT format
  if (supabaseAnonKey.startsWith('eyJ')) {
    console.log('✅ Anon key format looks correct (JWT)')
  } else {
    console.log('⚠️  Anon key format might be incorrect')
    console.log('   Should start with: eyJ')
  }
}

if (!supabaseServiceKey) {
  console.log('❌ SUPABASE_SERVICE_ROLE_KEY: Missing')
  console.log('   Get this from: Supabase Dashboard > Settings > API')
} else {
  console.log('✅ SUPABASE_SERVICE_ROLE_KEY: Present')
  console.log(`   Length: ${supabaseServiceKey.length} characters`)
  console.log(`   Starts with: ${supabaseServiceKey.substring(0, 20)}...`)

  // Validate JWT format
  if (supabaseServiceKey.startsWith('eyJ')) {
    console.log('✅ Service key format looks correct (JWT)')
  } else {
    console.log('⚠️  Service key format might be incorrect')
    console.log('   Should start with: eyJ')
  }
}

console.log('\n🔧 Common Issues:')
console.log('=================')

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.log('❌ Missing environment variables')
  console.log('   Create a .env.local file with:')
  console.log('   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co')
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key')
  console.log('   SUPABASE_SERVICE_ROLE_KEY=your_service_key')
} else {
  console.log('✅ All environment variables are present')

  // Check for common issues
  if (supabaseUrl.includes('your-project-id')) {
    console.log('⚠️  URL contains placeholder text')
    console.log('   Replace with your actual Supabase project URL')
  }

  if (supabaseAnonKey.includes('your_anon_key') || supabaseServiceKey.includes('your_service_key')) {
    console.log('⚠️  Keys contain placeholder text')
    console.log('   Replace with your actual Supabase keys')
  }

  if (supabaseAnonKey === supabaseServiceKey) {
    console.log('⚠️  Anon key and service key are the same')
    console.log('   They should be different keys')
  }
}

console.log('\n📋 How to Get Your Keys:')
console.log('========================')
console.log('1. Go to: https://supabase.com/dashboard')
console.log('2. Select your project')
console.log('3. Go to: Settings > API')
console.log('4. Copy the following:')
console.log('   • Project URL (for NEXT_PUBLIC_SUPABASE_URL)')
console.log('   • anon public key (for NEXT_PUBLIC_SUPABASE_ANON_KEY)')
console.log('   • service_role key (for SUPABASE_SERVICE_ROLE_KEY)')

console.log('\n📝 Example .env.local file:')
console.log('===========================')
console.log('NEXT_PUBLIC_SUPABASE_URL=https://xyzabc123.supabase.co')
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
console.log('SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')

console.log('\n🚀 Next Steps:')
console.log('===============')
if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.log('1. Set up your .env.local file')
  console.log('2. Run: npm run check:env')
  console.log('3. Then run: npm run entity:sync')
} else {
  console.log('1. Try running: npm run entity:sync')
  console.log('2. If it fails, check your Supabase project settings')
  console.log('3. Make sure your project is active and accessible')
}
