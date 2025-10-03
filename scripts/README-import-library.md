# Library Data Import Script

This script imports library data from `library.csv` into the Supabase library table.

## Prerequisites

1. **Environment Variables**: Make sure you have the following environment variables set in your `.env.local` file:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. **CSV File**: Ensure `library.csv` exists in the `scripts/` directory.

3. **Database Table**: The `library` table must exist in your Supabase database with the correct schema.

## Usage

### Option 1: Using npm script (Recommended)

```bash
npm run import:library
```

### Option 2: Direct Node.js execution

```bash
node scripts/import-library-data.js
```

### Option 3: Test the import

```bash
npm run test:library
```

## CSV Format

The script expects a CSV file with the following columns:

- `id` - Unique identifier (integer)
- `name` - Library item name (required)
- `description` - Description text
- `audio` - Audio URL
- `pdf` - PDF URL
- `youtube` - YouTube URL
- `album` - Album type (must match AlbumEnum values)
- `metadata` - JSON metadata object
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp
- `tags` - PostgreSQL array format: `{tag1,tag2,tag3}`
- `categories` - PostgreSQL array format: `{cat1,cat2,cat3}`

## Album Types

Valid album types (case-sensitive):

- `MADEH`
- `NOHA`
- `SALAAM`
- `ILTEJA`
- `QURAN`
- `DUA`
- `MUNAJAAT`
- `MANQABAT`
- `NAAT`
- `RASA`
- `QASIDA`

## Data Processing

The script performs the following transformations:

1. **Column Mapping**:

   - `audio` → `audio_url`
   - `pdf` → `pdf_url`
   - `youtube` → `youtube_url`

2. **Array Parsing**: PostgreSQL array format `{item1,item2}` is converted to JavaScript arrays

3. **JSON Parsing**: Metadata field is parsed from JSON string to object

4. **Data Validation**:
   - Required fields are validated
   - Invalid album types are set to null
   - Empty or NULL values are handled appropriately

## Import Behavior

- **Existing Data**: The script will clear all existing library data before importing
- **Batch Processing**: Data is imported in batches of 100 items for better performance
- **Error Handling**: Failed items are logged, and individual retry is attempted
- **Progress Tracking**: Real-time progress updates during import

## Output

The script provides detailed logging:

- ✅ Successfully imported items count
- ❌ Failed items count and reasons
- 📊 Final database count verification
- ⚠️ Warnings for skipped items

## Troubleshooting

### Common Issues

1. **Environment Variables Missing**

   ```
   ❌ Missing Supabase environment variables.
   ```

   Solution: Check your `.env.local` file

2. **CSV File Not Found**

   ```
   ❌ CSV file not found: /path/to/library.csv
   ```

   Solution: Ensure `library.csv` exists in the `scripts/` directory

3. **Database Connection Error**

   ```
   ❌ Import failed: Invalid API key
   ```

   Solution: Verify your Supabase URL and API key

4. **Invalid Album Type**

   ```
   ⚠️ Skipping row X: Invalid album type
   ```

   Solution: Check that album values match the AlbumEnum

### Debug Mode

For more detailed error information, you can modify the script to include additional logging or run it with Node.js debug flags:

```bash
DEBUG=* node scripts/import-library-data.js
```

## Example CSV Row

```csv
4,"Dua e Kamil","Dua e Kamil","https://example.com/audio.mp3","https://example.com/pdf.pdf",NULL,"DUA","{""pdfSize"": 9147}","2024-08-27 22:31:48.079119","2025-09-16 18:18:50.339658","{}","{daily-dua}"
```

This will be imported as:

```javascript
{
  id: 4,
  name: "Dua e Kamil",
  description: "Dua e Kamil",
  audio_url: "https://example.com/audio.mp3",
  pdf_url: "https://example.com/pdf.pdf",
  youtube_url: null,
  album: "DUA",
  metadata: { pdfSize: 9147 },
  created_at: "2024-08-27 22:31:48.079119",
  updated_at: "2025-09-16 18:18:50.339658",
  tags: [],
  categories: ["daily-dua"]
}
```
