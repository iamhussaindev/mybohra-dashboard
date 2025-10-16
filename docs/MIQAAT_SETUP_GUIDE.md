# Miqaat Module Setup Guide

This guide will help you set up the miqaat (Islamic calendar dates) module in your dashboard.

## 📋 Overview

The miqaat module consists of:

1. **Database schema** - SQL table definition with RLS policies
2. **Import script** - Node.js script to import data from CSV
3. **Type definitions** - TypeScript interfaces and enums
4. **CSV data** - 242 miqaat entries ready to import

## 🚀 Quick Setup (3 Steps)

### Step 1: Create the Database Table

Run the SQL script in your Supabase SQL Editor:

```bash
# The SQL file is located at:
database/miqaat_table.sql
```

This creates:

- ✅ `miqaat` table with all required columns
- ✅ Two enum types: `phase_enum` and `miqaat_type_enum`
- ✅ Indexes for optimal query performance
- ✅ Check constraints for data validation
- ✅ Auto-update trigger for `updated_at` field
- ✅ RLS policies for secure access
- ✅ Optional `important_miqaats` view

### Step 2: Verify Your Environment Variables

Ensure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Step 3: Import the Data

Run the import script from your project root:

```bash
node scripts/import-miqaat-data.js
```

Expected output:

```
🚀 Starting miqaat data import...
📋 Found 16 columns
📊 Found 242 data rows
✅ Transformed 242 items (skipped 0)
📦 Importing batch 1/3 (100 items)...
✅ Imported 100 items
...
🎉 Import completed!
✅ Successfully imported: 242 items
📊 Total items in database: 242
✨ Script completed successfully
```

## 📊 Data Overview

The CSV contains 242 miqaat entries including:

- **URS** (Urs Mubarak) - Commemorative dates
- **MILAD** (Milad) - Birth celebrations
- **SHAHADAT** (Martyrdom) - Martyrdom dates
- **WASHEQ** (Washeq) - Special nights
- **ASHARA** (Ashara) - First 10 days of Muharram
- **PEHLI_RAAT** - First nights of Islamic months
- **EID** - Festival days
- **IMPORTANT_NIGHT** - Significant nights
- **OTHER** - Other important dates

## 🗂️ Database Schema

```sql
CREATE TABLE public.miqaat (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    date INTEGER,                    -- 1-31
    month INTEGER,                   -- 1-12
    location VARCHAR(255),
    type miqaat_type_enum,
    date_night INTEGER,
    month_night INTEGER,
    priority INTEGER,
    important BOOLEAN DEFAULT false,
    phase phase_enum NOT NULL,       -- DAY or NIGHT
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);
```

## 🔍 Query Examples

Once imported, you can query the data:

```sql
-- Get all important miqaats
SELECT * FROM important_miqaats;

-- Get miqaats for a specific month
SELECT * FROM miqaat WHERE month = 1 ORDER BY date;

-- Get all Urs Mubarak dates
SELECT * FROM miqaat WHERE type = 'URS';

-- Get night phase miqaats
SELECT * FROM miqaat WHERE phase = 'NIGHT';
```

## 🔧 Troubleshooting

### Issue: Table already exists

**Solution**: Drop the table first or modify the SQL script to skip table creation

### Issue: Permission denied

**Solution**: Ensure you're running the SQL as a superuser or service_role in Supabase

### Issue: Import fails with "invalid input syntax"

**Solution**: The CSV has been pre-cleaned. Ensure you're using the latest version of `miqaat.csv`

### Issue: Month range constraint violation

**Solution**: This was fixed in the CSV. All month values are now 1-12

## 📁 File Locations

```
mybohra-dashboard/
├── miqaat.csv                              # Source data (242 entries)
├── database/
│   └── miqaat_table.sql                    # Database schema
├── scripts/
│   ├── import-miqaat-data.js               # Import script
│   └── README-import-miqaat.md             # Detailed documentation
├── src/
│   └── types/
│       └── miqaat.ts                       # TypeScript definitions
└── MIQAAT_SETUP_GUIDE.md                   # This file
```

## ✅ Verification Checklist

After setup, verify:

- [ ] Table `miqaat` exists in Supabase
- [ ] Enums `phase_enum` and `miqaat_type_enum` are created
- [ ] RLS policies are enabled
- [ ] 242 records imported successfully
- [ ] View `important_miqaats` is accessible
- [ ] Indexes are created (check in Supabase dashboard)

## 🎯 Next Steps

After successful import, you can:

1. **Create API endpoints** - Add CRUD operations in `src/lib/api/miqaat.ts`
2. **Build UI components** - Create miqaat list/detail views
3. **Add to dashboard** - Include miqaat calendar in your dashboard
4. **Link to library** - Associate library items with miqaats

## 📚 Additional Resources

- **Detailed import docs**: `scripts/README-import-miqaat.md`
- **Type definitions**: `src/types/miqaat.ts`
- **CSV data**: `miqaat.csv` (root directory)

## 💡 Tips

- The import script **clears existing data** before importing
- Empty/NULL values in CSV are handled automatically
- Month values follow Islamic calendar (1-12)
- Both day and night phases can be stored for the same event
- Use the `important` flag to highlight key dates

---

**Need help?** Check the detailed documentation in `scripts/README-import-miqaat.md`
