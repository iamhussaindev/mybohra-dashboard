# Database Sync & Migration System

This repository includes automated database synchronization with Supabase, including migrations, schema management, and CI/CD integration.

## 🚀 Quick Start

### Prerequisites

1. **Environment Variables**: Ensure you have the following in your `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. **Supabase Project**: Make sure your Supabase project is set up and accessible.

### Available Commands

```bash
# Run database migrations
npm run db:migrate

# Sync database schema and data
npm run db:sync

# Verify database connection and schema
npm run db:verify

# Reset database (migrate + sync)
npm run db:reset

# Check database status
npm run db:status
```

## 📁 Project Structure

```
scripts/
├── migrate.js              # Migration runner
├── db-sync.js              # Database sync utility
├── verify-db.js            # Database verification
└── migrations/
    └── 001_initial_schema.sql  # Initial schema migration

.github/workflows/
└── supabase-sync.yml       # GitHub Actions workflow
```

## 🔄 Migration System

### Creating Migrations

1. **Create a new migration file** in `scripts/migrations/`:

   ```bash
   # Example: 002_add_user_preferences.sql
   ```

2. **Write your SQL migration**:

   ```sql
   -- Migration: 002_add_user_preferences.sql
   -- Description: Add user preferences table
   -- Created: 2024-01-02

   CREATE TABLE IF NOT EXISTS user_preferences (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id uuid REFERENCES users(id) ON DELETE CASCADE,
     theme varchar(20) DEFAULT 'light',
     notifications boolean DEFAULT true,
     created_at timestamp with time zone DEFAULT now(),
     updated_at timestamp with time zone DEFAULT now()
   );

   -- Add indexes
   CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

   -- Enable RLS
   ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

   -- Add RLS policies
   CREATE POLICY "Users can manage own preferences" ON user_preferences
   FOR ALL USING (auth.uid() = user_id);
   ```

3. **Run the migration**:

   ```bash
   npm run db:migrate
   ```

### Migration Best Practices

- ✅ **Always use IF NOT EXISTS** for tables and indexes
- ✅ **Include proper indexes** for performance
- ✅ **Enable RLS** and add appropriate policies
- ✅ **Use descriptive comments** in your SQL
- ✅ **Test migrations** in development first
- ❌ **Never modify existing migrations** (create new ones instead)
- ❌ **Don't drop columns** without careful consideration

## 🔒 Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

### Users Table Policies

- **View own data**: Users can only see their own records
- **Update own data**: Users can only update their own records
- **Service role access**: Full access for service operations

### Adding New Policies

When creating new tables, always include RLS policies:

```sql
-- Enable RLS
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

-- Policy for user access
CREATE POLICY "Users can access own data" ON your_table
FOR ALL USING (auth.uid() = user_id);

-- Policy for service role
CREATE POLICY "Service role full access" ON your_table
FOR ALL USING (auth.role() = 'service_role');
```

## 🤖 CI/CD Integration

### GitHub Actions Workflow

The repository includes automated database synchronization via GitHub Actions:

- **Triggers**: Push to main/develop branches, PRs, manual dispatch
- **Steps**:
  1. Install dependencies
  2. Run migrations
  3. Sync database schema
  4. Verify database integrity
  5. Deploy to production (main branch only)

### Required Secrets

Add these secrets to your GitHub repository:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
```

## 🔧 Database Schema Management

### Current Schema

#### Users Table

```sql
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(255) UNIQUE NOT NULL,
  phone_number varchar(20),
  name varchar(255) NOT NULL,
  roles text[] DEFAULT ARRAY['user'],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);
```

#### Indexes

- `idx_users_email`: Email lookup
- `idx_users_roles`: Role-based queries (GIN index)
- `idx_users_created_at`: Time-based queries

#### Triggers

- `update_users_updated_at`: Automatically updates `updated_at` timestamp

### Schema Evolution

1. **Add new tables**: Create migration files
2. **Modify existing tables**: Use ALTER TABLE in migrations
3. **Add indexes**: Include in migration files
4. **Update RLS policies**: Modify policies in migrations

## 🛠️ Development Workflow

### Local Development

1. **Start development server**:

   ```bash
   npm run dev
   ```

2. **Run database setup**:

   ```bash
   npm run db:reset
   ```

3. **Verify everything works**:

   ```bash
   npm run db:verify
   ```

### Making Schema Changes

1. **Create migration file**:

   ```bash
   # Create: scripts/migrations/003_add_new_feature.sql
   ```

2. **Write your changes**:

   ```sql
   -- Your schema changes here
   ```

3. **Test locally**:

   ```bash
   npm run db:migrate
   npm run db:verify
   ```

4. **Commit and push**:

   ```bash
   git add .
   git commit -m "Add new feature migration"
   git push
   ```

## 📊 Monitoring & Verification

### Database Health Checks

The verification script checks:

- ✅ **Connection**: Database connectivity
- ✅ **Schema**: Required tables exist
- ✅ **RLS**: Row Level Security enabled
- ✅ **Indexes**: Performance indexes present

### Running Health Checks

```bash
# Check database status
npm run db:status

# Full verification
npm run db:verify
```

## 🚨 Troubleshooting

### Common Issues

1. **Migration fails**:

   - Check SQL syntax
   - Verify environment variables
   - Check Supabase project permissions

2. **RLS policies not working**:

   - Verify policies are created correctly
   - Check user authentication
   - Test with service role key

3. **Indexes missing**:
   - Re-run migrations
   - Check for SQL errors
   - Verify table structure

### Debug Commands

```bash
# Check migration status
npm run db:status

# Re-run all migrations
npm run db:reset

# Verify specific table
# (Check Supabase dashboard)
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Migrations Best Practices](https://supabase.com/docs/guides/database/migrations)

## 🤝 Contributing

When contributing to database changes:

1. **Always create migrations** for schema changes
2. **Test migrations locally** before pushing
3. **Include proper RLS policies** for new tables
4. **Update documentation** for new features
5. **Follow naming conventions** for files and functions

---

**Note**: This system ensures your database schema stays in sync with your codebase automatically. Always test changes in development before deploying to production.
