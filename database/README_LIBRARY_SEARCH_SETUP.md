# Library Search Setup Guide

## Problem

Library search is not working because the `search_library` database function doesn't exist in your Supabase database.

## Solution

### Step 1: Run the SQL Script

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Open the file: `database/library_table.sql`
4. Copy all the content
5. Paste it into the SQL Editor
6. Click **Run** or press `Ctrl+Enter`

### Step 2: Verify Setup

After running the SQL, verify everything is set up correctly:

```sql
-- Check if the library table exists
SELECT * FROM public.library LIMIT 5;

-- Check if the search function exists
SELECT search_library('test', 10);

-- Check indexes
SELECT * FROM pg_indexes WHERE tablename = 'library';
```

### What This SQL Does

1. **Creates the `library` table** with the following fields:

   - `id` - Primary key
   - `name` - Library item name
   - `description` - Description
   - `audio_url` - Audio file URL
   - `pdf_url` - PDF file URL
   - `youtube_url` - YouTube video URL
   - `video_url` - Video file URL
   - `album` - Album/category (e.g., MADEH, NOHA, SALAAM)
   - `metadata` - JSONB for additional data
   - `tags` - Array of tags
   - `categories` - Array of categories
   - `arabic_text` - Arabic text content
   - `transliteration` - Romanized text
   - `translation` - English translation
   - `search_text` - Generated field combining all searchable text
   - `search_vector` - Full-text search vector (auto-generated)
   - `created_at`, `updated_at` - Timestamps

2. **Creates indexes** for:

   - Name search
   - Album filtering
   - Tag and category searches (GIN indexes)
   - Full-text search (GIN index on search_vector)
   - Date sorting

3. **Creates `search_library` function** that:

   - Performs full-text search across all fields
   - Supports partial matching (ILIKE)
   - Returns results ranked by relevance
   - Prioritizes exact name matches
   - Searches in: name, description, album, tags, categories, arabic_text, transliteration, translation

4. **Sets up Row Level Security (RLS)**:
   - Allows authenticated users to read, create, update, and delete

### How Search Works

The search function uses multiple strategies:

1. **Full-Text Search** - Fast, weighted search using PostgreSQL's `tsvector`

   - Name has highest weight (A)
   - Description has medium weight (B)
   - Album, tags, categories have lower weight (C)
   - Text fields have lowest weight (D)

2. **Partial Matching** - ILIKE patterns for user-friendly search

   - Searches within names, descriptions, albums
   - Searches array fields (tags, categories)
   - Searches text content fields

3. **Smart Ranking** - Results ordered by:
   - Exact prefix match on name (highest priority)
   - Partial match on name
   - Full-text search rank
   - Alphabetical order

### Testing the Search

After setup, test the search:

```sql
-- Search for a specific term
SELECT * FROM search_library('sahifa', 20);

-- Search with multiple words
SELECT * FROM search_library('dua month', 50);

-- Search in Arabic text (if your data has it)
SELECT * FROM search_library('اللهم', 10);
```

### Using in the App

The search is already integrated in your app:

1. Go to **Library Management** page
2. Type in the search box at the top
3. Results will filter automatically after 500ms (debounced)

### Troubleshooting

**Search returns no results:**

- Make sure you have data in the `library` table
- Check that RLS policies allow your user to read
- Verify the search function exists: `\df search_library` in psql

**Search is slow:**

- Ensure indexes are created (they should be automatic)
- Check index usage: `EXPLAIN ANALYZE SELECT * FROM search_library('test', 10);`

**Function doesn't exist error:**

- Re-run the entire SQL script
- Make sure you're connected to the correct database
- Check function exists: `SELECT * FROM pg_proc WHERE proname = 'search_library';`

## Existing Data

If you already have library data, you don't need to drop the table. Instead:

1. Comment out the `DROP TABLE` line in the SQL
2. Modify the `CREATE TABLE` to `CREATE TABLE IF NOT EXISTS`
3. The search function and indexes will still be created

Or create only the search function:

```sql
-- Just create the search function (if table already exists)
CREATE OR REPLACE FUNCTION search_library(
    p_query TEXT,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    id BIGINT,
    name VARCHAR,
    description TEXT,
    album VARCHAR,
    tags TEXT[],
    categories TEXT[],
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        l.id,
        l.name,
        l.description,
        l.album,
        l.tags,
        l.categories,
        ts_rank(l.search_vector, websearch_to_tsquery('english', p_query)) AS rank
    FROM public.library l
    WHERE l.search_vector @@ websearch_to_tsquery('english', p_query)
       OR l.name ILIKE '%' || p_query || '%'
       OR l.description ILIKE '%' || p_query || '%'
    ORDER BY rank DESC, l.name ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;
```

## Additional Features

The library table also supports:

- ✅ Audio file uploads
- ✅ PDF uploads
- ✅ YouTube video links
- ✅ Tags and categories
- ✅ Metadata JSONB for custom fields
- ✅ Arabic text with transliteration
- ✅ Full-text search
- ✅ Automatic timestamp tracking

## Next Steps

After setup:

1. Import your library data (if you have CSV/JSON)
2. Test the search functionality
3. Add library items through the UI
4. Assign library items to daily duas in the calendar

## Support

If you encounter issues:

- Check Supabase logs in Dashboard
- Verify your PostgreSQL version supports full-text search
- Ensure RLS is configured correctly for your auth setup
