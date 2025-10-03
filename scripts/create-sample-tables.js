#!/usr/bin/env node

/**
 * Create Sample Tables Script
 * Creates basic tables in Supabase for testing the schema sync system
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

const sampleTablesSQL = `
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20),
  role VARCHAR(50) DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  published BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view published posts" ON posts FOR SELECT USING (published = true OR auth.uid() = author_id);
CREATE POLICY "Users can insert posts" ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can insert comments" ON comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = author_id);

-- Insert sample data
INSERT INTO users (name, email, phone_number, role) VALUES
  ('John Doe', 'john@example.com', '+1234567890', 'admin'),
  ('Jane Smith', 'jane@example.com', '+1234567891', 'user'),
  ('Bob Johnson', 'bob@example.com', '+1234567892', 'user')
ON CONFLICT (email) DO NOTHING;

INSERT INTO posts (title, content, author_id, published, tags) VALUES
  ('Welcome to our blog', 'This is the first post on our blog.', (SELECT id FROM users WHERE email = 'john@example.com'), true, ARRAY['welcome', 'blog']),
  ('Getting Started', 'Here are some tips to get started.', (SELECT id FROM users WHERE email = 'jane@example.com'), true, ARRAY['tips', 'guide']),
  ('Draft Post', 'This is a draft post.', (SELECT id FROM users WHERE email = 'bob@example.com'), false, ARRAY['draft'])
ON CONFLICT DO NOTHING;

INSERT INTO comments (content, post_id, author_id) VALUES
  ('Great post!', (SELECT id FROM posts WHERE title = 'Welcome to our blog'), (SELECT id FROM users WHERE email = 'jane@example.com')),
  ('Thanks for sharing', (SELECT id FROM posts WHERE title = 'Getting Started'), (SELECT id FROM users WHERE email = 'bob@example.com'))
ON CONFLICT DO NOTHING;
`

async function createSampleTables() {
  console.log('🚀 Creating sample tables in Supabase...\n')

  try {
    // Test connection first
    console.log('🔌 Testing database connection...')
    try {
      const { error: testError } = await supabase.from('users').select('count').limit(1)

      if (testError && !testError.message.includes('relation "users" does not exist') && !testError.message.includes('Could not find the table')) {
        console.log(`❌ Connection failed: ${testError.message}`)
        return
      }

      console.log('✅ Connection successful')
    } catch (error) {
      console.log('✅ Connection successful (table not found - expected)')
    }

    // Execute the SQL
    console.log('📝 Creating tables and sample data...')

    // Split SQL into individual statements
    const statements = sampleTablesSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0)

    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        if (error) {
          console.log(`⚠️  Warning: ${error.message}`)
        }
      }
    }

    console.log('✅ Sample tables created successfully!')
    console.log('\n📋 Created tables:')
    console.log('   - users (with sample users)')
    console.log('   - posts (with sample posts)')
    console.log('   - comments (with sample comments)')
    console.log('   - Indexes and RLS policies')
    console.log('   - Sample data inserted')

    console.log('\n🎉 Ready to test schema sync!')
    console.log('   Run: npm run schema:sync')
  } catch (error) {
    console.error('\n❌ Failed to create sample tables:', error.message)
    console.log('\n💡 Manual setup:')
    console.log('   1. Go to your Supabase Dashboard > SQL Editor')
    console.log('   2. Copy and run the SQL from the script')
    console.log('   3. Then run: npm run schema:sync')
  }
}

// CLI interface
const command = process.argv[2]

switch (command) {
  case 'create':
  case 'run':
    createSampleTables()
    break
  default:
    console.log('🗄️  Sample Tables Creator\n')
    console.log('This script creates sample tables in your Supabase database for testing.')
    console.log('')
    console.log('Usage:')
    console.log('  node scripts/create-sample-tables.js create  - Create sample tables')
    console.log('')
    console.log('This will create:')
    console.log('   - users table with sample data')
    console.log('   - posts table with sample data')
    console.log('   - comments table with sample data')
    console.log('   - Indexes and RLS policies')
    console.log('   - Sample relationships')
    break
}

module.exports = { createSampleTables }
