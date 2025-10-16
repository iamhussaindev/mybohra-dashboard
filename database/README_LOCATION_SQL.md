# Location Table SQL Setup Guide

## Overview

This directory contains SQL scripts to set up the location table in Supabase PostgreSQL database.

## Files

### 1. `location_table.sql` (Full Version)

**Complete setup with all features:**

- ✅ Sequence creation for auto-incrementing IDs
- ✅ Table creation with all columns
- ✅ Performance indexes (6 indexes)
- ✅ Auto-update trigger for `updated_at` timestamp
- ✅ Row Level Security (RLS) policies
- ✅ Data validation constraints
- ✅ Detailed comments and documentation
- ✅ Sample data (commented out)
- ✅ Verification queries (commented out)

**Use this if you want:**

- Production-ready setup
- Optimized performance
- Data validation
- Comprehensive security

### 2. `location_table_simple.sql` (Simple Version)

**Minimal setup for quick start:**

- ✅ Sequence and table creation
- ✅ Basic indexes (2 indexes)
- ✅ RLS enabled with simple policy
- ✅ Permissions granted

**Use this if you want:**

- Quick development setup
- Minimal configuration
- Get started fast

## How to Run

### Method 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the SQL script
5. Click **Run** or press `Ctrl+Enter` (Windows) or `Cmd+Enter` (Mac)

### Method 2: Supabase CLI

```bash
# Make sure you're in your project directory
supabase db reset  # (optional) reset database

# Run the SQL file
supabase db execute -f database/location_table.sql

# Or for simple version
supabase db execute -f database/location_table_simple.sql
```

### Method 3: psql Command Line

```bash
psql -h db.your-project.supabase.co \
     -p 5432 \
     -d postgres \
     -U postgres \
     -f database/location_table.sql
```

## Table Structure

```sql
id          integer          PRIMARY KEY (auto-increment)
type        varchar          DEFAULT 'city' (city|state|country|region|other)
city        varchar          NOT NULL
country     varchar          NOT NULL
latitude    double precision NOT NULL (range: -90 to 90)
longitude   double precision NOT NULL (range: -180 to 180)
timezone    varchar          NOT NULL (IANA timezone)
state       varchar          NULLABLE
created_at  timestamp        DEFAULT now()
updated_at  timestamp        DEFAULT now() (auto-updates)
```

## Security (RLS Policies)

### Full Version Policies

1. **Read Policy**: Allow authenticated users to SELECT all locations
2. **Insert Policy**: Allow authenticated users to INSERT new locations
3. **Update Policy**: Allow authenticated users to UPDATE locations
4. **Delete Policy**: Allow authenticated users to DELETE locations

### Simple Version Policy

- **All Operations**: Allow authenticated users full access (SELECT, INSERT, UPDATE, DELETE)

## Indexes Created

### Full Version (6 indexes)

```sql
idx_location_type            -- Type filter optimization
idx_location_city            -- City search optimization
idx_location_country         -- Country search optimization
idx_location_state           -- State search optimization
idx_location_created_at      -- Date sorting optimization
idx_location_city_country    -- Composite search optimization
```

### Simple Version (2 indexes)

```sql
idx_location_city            -- City search optimization
idx_location_country         -- Country search optimization
```

## Data Validation Constraints

The full version includes:

- ✅ Latitude range: -90 to 90
- ✅ Longitude range: -180 to 180
- ✅ Type must be: 'city', 'state', 'country', 'region', or 'other'

## Sample Data

The full version includes commented sample data for 10 major cities:

- New York, USA
- London, UK
- Tokyo, Japan
- Dubai, UAE
- Mumbai, India
- Sydney, Australia
- Paris, France
- Singapore
- Los Angeles, USA
- Chicago, USA

To use sample data, uncomment the INSERT statement in `location_table.sql`.

## Verification

After running the script, verify the setup:

```sql
-- Check table exists
SELECT * FROM public.location LIMIT 5;

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'location' AND schemaname = 'public';

-- Check RLS policies
SELECT policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'location';

-- Check constraints
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.location'::regclass;
```

## Troubleshooting

### Error: "relation already exists"

```sql
-- Drop existing table first (WARNING: This deletes all data!)
DROP TABLE IF EXISTS public.location CASCADE;
DROP SEQUENCE IF EXISTS location_id_seq CASCADE;

-- Then run the script again
```

### Error: "policy already exists"

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read locations" ON public.location;
-- (repeat for other policies)

-- Then run the script again
```

### Error: "permission denied"

Make sure you're using the postgres role or a role with sufficient privileges:

```sql
-- Grant necessary permissions
GRANT ALL ON SCHEMA public TO postgres;
```

## Integration with Frontend

After running the SQL script, the location module in your dashboard will work automatically with:

- `/src/lib/api/location.ts` - API service
- `/src/components/location/*` - React components
- `/app/dashboard/location/page.tsx` - Location page

No additional configuration needed!

## Migration Notes

### From Simple to Full Version

If you started with the simple version and want to upgrade:

```sql
-- Add the additional indexes
CREATE INDEX idx_location_type ON public.location(type);
CREATE INDEX idx_location_state ON public.location(state);
CREATE INDEX idx_location_created_at ON public.location(created_at DESC);
CREATE INDEX idx_location_city_country ON public.location(city, country);

-- Add constraints
ALTER TABLE public.location
    ADD CONSTRAINT check_latitude_range
    CHECK (latitude >= -90 AND latitude <= 90);

ALTER TABLE public.location
    ADD CONSTRAINT check_longitude_range
    CHECK (longitude >= -180 AND longitude <= 180);

ALTER TABLE public.location
    ADD CONSTRAINT check_type_valid
    CHECK (type IN ('city', 'state', 'country', 'region', 'other'));

-- Add auto-update trigger
CREATE OR REPLACE FUNCTION update_location_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_location_updated_at
    BEFORE UPDATE ON public.location
    FOR EACH ROW
    EXECUTE FUNCTION update_location_updated_at();
```

## Best Practices

1. **Always backup** before running migrations
2. **Test in development** environment first
3. **Review RLS policies** for your security requirements
4. **Monitor index usage** and adjust as needed
5. **Keep sample data commented** in production

## Support

For issues or questions:

- Check Supabase documentation: https://supabase.com/docs
- Review PostgreSQL docs: https://www.postgresql.org/docs/
- Check the module documentation: `/docs/LOCATION_MODULE.md`
