# Mazaars, Dai Duat, and Musafirkhana Module

## Overview

This module provides a complete admin interface for managing:
- **Mazaars**: Shrines with location, contact, and photos
- **Dai Duat**: Religious leaders with history, photos, year, and rank
- **Musafirkhana**: Guest houses with location, contact, rooms, and photos

## Database Setup

### 1. Run the SQL Schema

Execute the SQL file to create all tables and relationships:

```bash
# In Supabase SQL Editor, run:
scripts/sql/mazaars_schema.sql
```

This creates:
- `mazaars` table
- `dai_duat` table
- `musafirkhana` table
- `mazaar_dai_duat` junction table (many-to-many)
- `mazaar_musafirkhana` junction table (many-to-many)

### 2. Tables Structure

#### mazaars
- `id` (UUID, Primary Key)
- `name` (VARCHAR, Required)
- `lat` (DECIMAL)
- `lng` (DECIMAL)
- `contact` (VARCHAR)
- `photos` (TEXT[])
- `created_at`, `updated_at`
- `created_by`, `updated_by`

#### dai_duat
- `id` (UUID, Primary Key)
- `name` (VARCHAR, Required)
- `city` (VARCHAR)
- `area` (VARCHAR)
- `history` (TEXT)
- `photos` (TEXT[])
- `year` (INTEGER)
- `rank` (INTEGER)
- `created_at`, `updated_at`
- `created_by`, `updated_by`

#### musafirkhana
- `id` (UUID, Primary Key)
- `name` (VARCHAR, Required)
- `city` (VARCHAR)
- `lat` (DECIMAL)
- `lng` (DECIMAL)
- `photos` (TEXT[])
- `contact1` (VARCHAR)
- `contact2` (VARCHAR)
- `contact_person_name` (VARCHAR)
- `map_link` (TEXT)
- `total_rooms` (INTEGER)
- `created_at`, `updated_at`
- `created_by`, `updated_by`

#### Relationships
- **mazaar_dai_duat**: Links mazaars to dai_duat (many-to-many)
- **mazaar_musafirkhana**: Links mazaars to musafirkhana (many-to-many)

## Files Created

### SQL Schema
- `scripts/sql/mazaars_schema.sql` - Complete database schema with RLS policies

### TypeScript Types
- `src/types/mazaar.ts` - All type definitions

### API Services
- `src/lib/api/mazaar.ts` - MazaarService with CRUD operations
- `src/lib/api/daiDuat.ts` - DaiDuatService with CRUD operations
- `src/lib/api/musafirkhana.ts` - MusafirkhanaService with CRUD operations

### Admin Pages
- `app/dashboard/mazaars/page.tsx` - Mazaars admin page
- `app/dashboard/dai-duat/page.tsx` - Dai Duat admin page
- `app/dashboard/musafirkhana/page.tsx` - Musafirkhana admin page

### Components
- `src/components/mazaar/MazaarList.tsx` - Mazaars list with table
- `src/components/mazaar/MazaarForm.tsx` - Create/Edit mazaar form
- `src/components/mazaar/DaiDuatList.tsx` - Dai Duat list with table
- `src/components/mazaar/DaiDuatForm.tsx` - Create/Edit dai duat form
- `src/components/mazaar/MusafirkhanaList.tsx` - Musafirkhana list with table
- `src/components/mazaar/MusafirkhanaForm.tsx` - Create/Edit musafirkhana form

### Navigation
- Updated `src/components/layout/Sidebar.tsx` with links to all three modules

## Usage

### Access Admin Pages

1. **Mazaars**: Navigate to `/dashboard/mazaars`
2. **Dai Duat**: Navigate to `/dashboard/dai-duat`
3. **Musafirkhana**: Navigate to `/dashboard/musafirkhana`

### Features

Each admin module provides:
- ✅ List view with search functionality
- ✅ Create new entries
- ✅ Edit existing entries
- ✅ Delete entries (with confirmation)
- ✅ Relationship management (for mazaars - link to dai_duat and musafirkhana)
- ✅ Photo URL management (array of URLs)
- ✅ Location coordinates (lat/lng)

### API Usage Examples

```typescript
import { MazaarService } from '@lib/api/mazaar'
import { DaiDuatService } from '@lib/api/daiDuat'
import { MusafirkhanaService } from '@lib/api/musafirkhana'

// Get all mazaars
const mazaars = await MazaarService.getAll()

// Get mazaar with relations
const mazaar = await MazaarService.getWithRelations(id)

// Create mazaar with relationships
await MazaarService.create({
  name: 'Mazaar Name',
  lat: 23.0225,
  lng: 72.5714,
  contact: '+91 1234567890',
  photos: ['https://example.com/photo1.jpg'],
  dai_duat_ids: ['uuid1', 'uuid2'],
  musafirkhana_ids: ['uuid3']
})
```

## Security

- Row Level Security (RLS) is enabled on all tables
- Public read access for all users
- Authenticated users can create, update, and delete
- Foreign key constraints ensure data integrity
- Cascade deletes for junction tables

## Next Steps

1. Run the SQL schema in Supabase
2. Test the admin interfaces
3. Add photo upload functionality (currently supports URLs)
4. Add map integration for location selection
5. Add bulk import/export functionality if needed

