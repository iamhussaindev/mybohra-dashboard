#!/usr/bin/env node

/**
 * Database Setup Helper
 * Provides SQL commands to set up your database manually
 */

const fs = require('fs')
const path = require('path')

console.log('🗄️  Database Setup Helper\n')

console.log('📋 Step 1: Create the users table in Supabase')
console.log('==============================================')
console.log('Go to your Supabase Dashboard > SQL Editor and run this SQL:')
console.log('')

const usersTableSQL = `-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  phone_number VARCHAR(20),
  name VARCHAR(255) NOT NULL,
  roles TEXT[] DEFAULT ARRAY['user'],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_roles ON users USING GIN(roles);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role full access" ON users
    FOR ALL USING (auth.role() = 'service_role');`

console.log(usersTableSQL)

console.log('\n📋 Step 2: Generate TypeScript types and services')
console.log('==================================================')
console.log('After creating the table, run: npm run entity:sync-simple')
console.log('')

// Save SQL to file for easy copying
const sqlDir = path.join(__dirname, 'sql')
if (!fs.existsSync(sqlDir)) {
  fs.mkdirSync(sqlDir, { recursive: true })
}

fs.writeFileSync(path.join(sqlDir, 'users_table.sql'), usersTableSQL)

console.log('💾 SQL saved to: scripts/sql/users_table.sql')
console.log('   You can copy this file content to Supabase SQL Editor')

console.log('\n🚀 Quick Setup Steps:')
console.log('=====================')
console.log('1. Copy the SQL above to Supabase Dashboard > SQL Editor')
console.log('2. Run the SQL to create the users table')
console.log('3. Run: npm run entity:sync-simple')
console.log('4. Start using the generated services!')

console.log('\n🔗 Helpful Links:')
console.log('=================')
console.log('• Supabase Dashboard: https://supabase.com/dashboard')
console.log('• SQL Editor: https://supabase.com/dashboard/project/[your-project]/sql')
console.log('• RLS Guide: https://supabase.com/docs/guides/auth/row-level-security')

module.exports = { usersTableSQL }
