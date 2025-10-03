# 🚀 Quick Setup Guide

## Step 1: Create Sample Tables

### Option A: Manual Setup (Recommended)

1. Go to your **Supabase Dashboard** → **SQL Editor**
2. Copy the contents of `scripts/sql/sample-tables.sql`
3. Paste and run the SQL in the SQL Editor
4. You should see "Success" message

### Option B: Automatic Setup (If exec_sql is available)

```bash
npm run create:sample
```

## Step 2: Run Schema Sync

```bash
npm run schema:sync
```

This will:

- ✅ Connect to your database
- ✅ Discover all tables
- ✅ Generate TypeScript types
- ✅ Generate CRUD services

## Step 3: Use Generated Code

```typescript
// Import generated types
import { User, Post, Comment } from '@lib/schema/types'

// Import generated services
import { UserService } from '@lib/api/generated/User'
import { PostService } from '@lib/api/generated/Post'
import { CommentService } from '@lib/api/generated/Comment'

// Use the services
const users = await UserService.getAll()
const posts = await PostService.getAll()
const comments = await CommentService.getAll()
```

## 📋 What Gets Created

### Tables

- **users** - User accounts with roles
- **posts** - Blog posts with author relationships
- **comments** - Comments on posts

### Generated Files

- `src/lib/schema/types.ts` - TypeScript interfaces
- `src/lib/api/generated/` - CRUD service classes

## 🔧 Commands

```bash
# Create sample tables (if exec_sql works)
npm run create:sample

# Sync schema and generate code
npm run schema:sync

# Check status
npm run schema:status
```

## 🎉 You're Ready!

Once you've created the tables and run the schema sync, you'll have:

- ✅ Fully typed database operations
- ✅ CRUD services for all tables
- ✅ Type-safe data handling
- ✅ Automatic code generation

## 🔄 Workflow

1. **Create tables** in Supabase (manual or automatic)
2. **Run schema sync** to generate types and services
3. **Use generated code** in your application
4. **Re-sync** when you add/modify tables

---

**That's it! Your schema sync system is ready to use! 🎉**
