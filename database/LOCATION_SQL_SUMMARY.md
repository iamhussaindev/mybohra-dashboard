# Location Table SQL Scripts - Quick Reference

## 📦 Available SQL Scripts

### 1. **`location_setup_quick.sql`** ⭐ RECOMMENDED

**One-click setup with sample data**

- Complete table setup
- All indexes and constraints
- RLS policies configured
- 5 sample locations included
- Copy → Paste → Run → Done!

**Use case:** Quick start for development or testing

---

### 2. **`location_table.sql`**

**Full production setup with documentation**

- Complete table structure
- 6 performance indexes
- Data validation constraints
- Detailed RLS policies
- Auto-update triggers
- Sample data (commented)
- Verification queries
- Extensive comments

**Use case:** Production deployment with full documentation

---

### 3. **`location_table_simple.sql`**

**Minimal setup for basic needs**

- Table creation
- 2 basic indexes
- Simple RLS policy
- Essential permissions

**Use case:** Minimal setup for testing

---

## 🚀 Quick Start (30 seconds)

### Step 1: Choose Your Script

For most users: **`location_setup_quick.sql`**

### Step 2: Run in Supabase

1. Open **Supabase Dashboard**
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy entire content of `location_setup_quick.sql`
5. Paste into editor
6. Click **RUN** (or Ctrl/Cmd + Enter)

### Step 3: Verify

```sql
SELECT * FROM public.location;
```

You should see 5 sample locations!

### Step 4: Use the App

Navigate to `/dashboard/location` in your app - it's ready!

---

## 📊 What Gets Created

### Table Structure

```
location
├── id (PK, auto-increment)
├── type (city/state/country/region/other)
├── city (required)
├── country (required)
├── latitude (required, -90 to 90)
├── longitude (required, -180 to 180)
├── timezone (required, IANA format)
├── state (optional)
├── created_at (auto)
└── updated_at (auto-updates)
```

### Indexes (Performance)

- `id` (Primary Key)
- `type` (Filter optimization)
- `city` (Search optimization)
- `country` (Search optimization)
- `state` (Search optimization)

### Security (RLS)

- ✅ SELECT - Authenticated users
- ✅ INSERT - Authenticated users
- ✅ UPDATE - Authenticated users
- ✅ DELETE - Authenticated users

### Validation

- ✅ Latitude: -90 to 90
- ✅ Longitude: -180 to 180
- ✅ Type: Valid enum values

---

## 📝 Sample Data Included

The quick setup includes 5 cities:

| City     | Country        | Timezone         |
| -------- | -------------- | ---------------- |
| New York | United States  | America/New_York |
| London   | United Kingdom | Europe/London    |
| Dubai    | UAE            | Asia/Dubai       |
| Mumbai   | India          | Asia/Kolkata     |
| Tokyo    | Japan          | Asia/Tokyo       |

---

## 🔧 Script Comparison

| Feature             | Quick  | Full      | Simple  |
| ------------------- | ------ | --------- | ------- |
| Table Creation      | ✅     | ✅        | ✅      |
| Sequence            | ✅     | ✅        | ✅      |
| Indexes             | 4      | 6         | 2       |
| Constraints         | ✅     | ✅        | ❌      |
| RLS Policies        | ✅     | ✅        | ✅      |
| Auto-update Trigger | ✅     | ✅        | ❌      |
| Sample Data         | ✅ (5) | ✅ (10)\* | ❌      |
| Documentation       | Basic  | Extensive | Minimal |
| Comments            | Some   | Many      | Few     |
| Verification        | ✅     | ✅        | ❌      |

\*Sample data is commented in full version

---

## 🛠️ Common Operations

### Add More Sample Data

```sql
INSERT INTO public.location (type, city, country, latitude, longitude, timezone, state)
VALUES ('city', 'Your City', 'Your Country', 0.0, 0.0, 'UTC', NULL);
```

### Remove All Data (Keep Table)

```sql
TRUNCATE TABLE public.location RESTART IDENTITY;
```

### Drop Table Completely

```sql
DROP TABLE IF EXISTS public.location CASCADE;
DROP SEQUENCE IF EXISTS location_id_seq CASCADE;
```

### Check Current Data

```sql
SELECT id, type, city, country, state FROM public.location ORDER BY id;
```

### Count Locations by Type

```sql
SELECT type, count(*) FROM public.location GROUP BY type ORDER BY count DESC;
```

---

## 🔍 Troubleshooting

### "Table already exists"

```sql
-- Option 1: Drop and recreate
DROP TABLE IF EXISTS public.location CASCADE;
-- Then run the script again

-- Option 2: Alter existing table
-- Use migration queries in README_LOCATION_SQL.md
```

### "Permission denied"

```sql
-- Grant permissions to your user
GRANT ALL ON public.location TO your_user;
GRANT USAGE, SELECT ON SEQUENCE location_id_seq TO your_user;
```

### "RLS policy already exists"

```sql
-- Drop existing policies first
DROP POLICY IF EXISTS "location_select_policy" ON public.location;
DROP POLICY IF EXISTS "location_insert_policy" ON public.location;
DROP POLICY IF EXISTS "location_update_policy" ON public.location;
DROP POLICY IF EXISTS "location_delete_policy" ON public.location;
-- Then run the script again
```

---

## 📚 Documentation Files

1. **`README_LOCATION_SQL.md`** - Detailed setup guide
2. **`LOCATION_SQL_SUMMARY.md`** - This file (quick reference)
3. **`/docs/LOCATION_MODULE.md`** - Frontend module docs
4. **`/docs/LOCATION_MODULE_SUMMARY.md`** - Module quick reference

---

## ✅ Post-Setup Checklist

- [ ] Run SQL script in Supabase
- [ ] Verify table exists: `SELECT * FROM location;`
- [ ] Check RLS is enabled: `SELECT * FROM pg_policies WHERE tablename = 'location';`
- [ ] Test app at `/dashboard/location`
- [ ] Create a test location
- [ ] Search functionality works
- [ ] Edit/Delete works

---

## 🎯 Next Steps

1. **Run the SQL script** → Use `location_setup_quick.sql`
2. **Navigate to app** → Go to `/dashboard/location`
3. **Test CRUD operations** → Create, Read, Update, Delete
4. **Add your data** → Import your locations
5. **Customize as needed** → Modify for your requirements

---

## 💡 Tips

- **Use Quick Setup** for fastest results
- **Read Full Script** for production understanding
- **Backup before changes** - always!
- **Test in development** first
- **Monitor performance** and adjust indexes as needed

---

## 📞 Support

- **Supabase Docs**: https://supabase.com/docs/guides/database
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Module Docs**: `/docs/LOCATION_MODULE.md`
- **App Route**: `/dashboard/location`

---

**That's it! Your location table is ready to use! 🚀**
