# Supabase Setup Guide

This guide will help you set up Supabase for your Next.js dashboard project.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - Name: `mybohra-dashboard`
   - Database Password: (choose a strong password)
   - Region: (select closest to your users)
6. Click "Create new project"

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## 3. Set Up Environment Variables

Create a `.env.local` file in your project root with the following content:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Optional: Service role key for server-side operations (keep this secret!)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 4. Test Your Connection

You can test your Supabase connection by importing and using the client:

```typescript
import { supabase } from '@lib/config/supabase'

// Test connection
const { data, error } = await supabase.from('your_table').select('*')
```

## 5. Database Schema (Optional)

You can create tables directly in the Supabase dashboard or use SQL migrations. Here are some common tables you might want to create:

```sql
-- Example: Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Example: Projects table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  tech_stack TEXT[],
  github_url TEXT,
  live_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 6. Row Level Security (RLS)

Enable Row Level Security on your tables for better security:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Example policies
CREATE POLICY "Users can view all projects" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);
```

## 7. Generate TypeScript Types (Optional)

To get full TypeScript support, you can generate types from your database schema:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-id

# Generate types
supabase gen types typescript --linked > src/types/database.types.ts
```

## 8. Usage Examples

### Authentication

```typescript
import { supabase } from '@lib/config/supabase'

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
})

// Sign out
await supabase.auth.signOut()
```

### Database Operations

```typescript
// Select data
const { data, error } = await supabase.from('projects').select('*')

// Insert data
const { data, error } = await supabase.from('projects').insert({ title: 'New Project', description: 'Project description' })

// Update data
const { data, error } = await supabase.from('projects').update({ title: 'Updated Title' }).eq('id', 'project-id')

// Delete data
const { data, error } = await supabase.from('projects').delete().eq('id', 'project-id')
```

### Real-time Subscriptions

```typescript
// Subscribe to changes
const subscription = supabase
  .channel('projects')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, payload => console.log('Change received!', payload))
  .subscribe()

// Unsubscribe
subscription.unsubscribe()
```

## 9. Next Steps

- Set up your database schema
- Configure Row Level Security policies
- Implement authentication if needed
- Add your first API endpoints
- Test your integration

For more information, visit the [Supabase Documentation](https://supabase.com/docs).
