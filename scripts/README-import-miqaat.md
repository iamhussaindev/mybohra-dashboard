# Miqaat Data Import Script

This script imports miqaat (special Islamic dates) data from `miqaat.csv` into the Supabase `miqaat` table.

## Prerequisites

1. **Environment Variables**: Ensure your `.env.local` file contains:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

2. **CSV File**: The `miqaat.csv` file should be in the root directory of the project.

3. **Dependencies**: Run `npm install` to ensure all dependencies are installed.

## CSV Format

The script expects a CSV file with the following columns:

- `id` - Row ID (will be ignored, database auto-generates)
- `date` - Day of month (1-31)
- `month` - Month number (1-12)
- `description` - Description text
- `name` - Name of the miqaat (required)
- `location` - Location name
- `phase` - DAY or NIGHT (required)
- `type` - Miqaat type (URS, MILAD, WASHEQ, PEHLI_RAAT, SHAHADAT, ASHARA, IMPORTANT_NIGHT, EID, OTHER)
- `html` - HTML content (skipped, not in database)
- `date_night` - Night date
- `month_night` - Night month
- `is_night` - Boolean flag (skipped, not in database)
- `priority` - Priority number
- `important` - Boolean flag
- `old_name` - Old name (skipped, not in database)
- `processed` - Processed flag (skipped, not in database)

## Usage

Run the script from the project root:

```bash
node scripts/import-miqaat-data.js
```

## What the Script Does

1. **Reads** the CSV file from the root directory
2. **Validates** each row to ensure required fields are present
3. **Transforms** the data to match the database schema:
   - Converts string booleans to actual booleans
   - Parses integers for date/month fields
   - Maps enum values for phase and type
   - Skips fields not in the database schema (html, is_night, old_name, processed)
4. **Clears** existing miqaat data (if any)
5. **Imports** the data in batches of 100
6. **Reports** success/failure statistics

## Data Transformations

- **Empty/NULL values**: Converted to `null` for optional fields
- **Booleans**: `"True"` → `true`, anything else → `false`
- **Integers**: Parsed from strings, invalid values become `null`
- **Enums**: Validated against allowed values, invalid values become `null` or default

## Error Handling

- Invalid rows are skipped with warnings
- If a batch import fails, the script attempts individual inserts
- Detailed error messages are logged for troubleshooting

## Example Output

```
🚀 Starting miqaat data import...
📋 Found 16 columns: id,date,month,description,name,location,phase,type,...
📊 Found 242 data rows
✅ Transformed 242 items (skipped 0)
📊 Found 0 existing miqaat items
📦 Importing batch 1/3 (100 items)...
✅ Imported 100 items
📦 Importing batch 2/3 (100 items)...
✅ Imported 100 items
📦 Importing batch 3/3 (42 items)...
✅ Imported 42 items

🎉 Import completed!
✅ Successfully imported: 242 items
📊 Total items in database: 242
✨ Script completed successfully
```

## Troubleshooting

### Missing Environment Variables

```
❌ Missing Supabase environment variables.
```

**Solution**: Check your `.env.local` file and ensure it contains `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### CSV File Not Found

```
❌ Import failed: CSV file not found: /path/to/miqaat.csv
```

**Solution**: Ensure `miqaat.csv` is in the root directory of the project.

### Invalid Enum Values

If you see warnings about invalid enum values, check that:

- `phase` values are either `DAY` or `NIGHT`
- `type` values match one of: URS, MILAD, WASHEQ, PEHLI_RAAT, SHAHADAT, ASHARA, IMPORTANT_NIGHT, EID, OTHER

### Database Errors

If individual inserts fail, check:

- Database constraints (e.g., month range should be 1-12)
- Required fields are not null
- Data types match the schema

## Database Schema

The miqaat table schema:

```typescript
interface Miqaat {
  id: number // Auto-generated
  name: string // Required
  description?: string
  date?: number // 1-31
  month?: number // 1-12
  location?: string
  type?: MiqaatTypeEnum
  date_night?: number
  month_night?: number
  priority?: number
  important?: boolean
  phase: PhaseEnum // Required (DAY or NIGHT)
  created_at: string // Auto-generated
  updated_at: string // Auto-generated
}
```

## Notes

- The script will **delete all existing miqaat data** before importing
- Empty strings and "NULL" values in the CSV are converted to actual `null` values
- The `id` field from CSV is ignored; the database auto-generates IDs
- Fields not in the database schema (html, is_night, old_name, processed) are skipped
