# Location Module Documentation

## Overview

The Location module provides a complete CRUD interface for managing geographical location data in the MyBohra Dashboard.

## Database Schema

```sql
CREATE TABLE IF NOT EXISTS public.location
(
    id integer NOT NULL DEFAULT nextval('location_id_seq'::regclass),
    type character varying COLLATE pg_catalog."default" NOT NULL DEFAULT 'city'::character varying,
    city character varying COLLATE pg_catalog."default" NOT NULL,
    country character varying COLLATE pg_catalog."default" NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    timezone character varying COLLATE pg_catalog."default" NOT NULL,
    state character varying COLLATE pg_catalog."default",
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_at timestamp without time zone NOT NULL DEFAULT now(),
    CONSTRAINT "PK_876d7bdba03c72251ec4c2dc827" PRIMARY KEY (id)
)
```

## File Structure

```
├── app/dashboard/location/
│   └── page.tsx                    # Main location page with modal form
├── src/
│   ├── types/
│   │   └── location.ts             # TypeScript interfaces
│   ├── lib/api/
│   │   └── location.ts             # API service layer
│   └── components/location/
│       ├── LocationForm.tsx        # Create/Edit form component
│       └── LocationList.tsx        # List with table and sidebar
```

## Features

### ✅ **Complete CRUD Operations**

- **Create**: Add new locations with all required fields
- **Read**: View locations in a paginated table
- **Update**: Edit location details via sidebar or modal
- **Delete**: Remove locations with confirmation

### 🔍 **Search & Filter**

- **Search**: Search by city, state, or country
- **Type Filter**: Filter by location type (city, state, country, region, other)
- **Real-time Updates**: Instant search results

### 📊 **Data Display**

- **Compact Table View**: Shows all location data efficiently
- **Responsive Design**: Works on all screen sizes
- **Click to Edit**: Click any row to open edit sidebar
- **Inline Actions**: Edit and delete buttons in each row

### 🎨 **Modern UI/UX**

- **Static Sidebar**: Compact modern sidebar for editing
- **Modal Form**: Clean modal for creating new locations
- **Color-coded States**: Visual feedback for selected items
- **Infinite Scroll**: Load more locations as you scroll

## Components

### 1. LocationForm.tsx

Form component for creating and editing locations.

**Props:**

- `location?: Location` - Existing location for edit mode
- `onSubmit: (data) => void` - Form submission handler
- `onCancel: () => void` - Cancel handler

**Fields:**

- Type (dropdown): city, state, country, region, other
- City (required)
- Country (required)
- State (optional)
- Latitude (required)
- Longitude (required)
- Timezone (dropdown with common timezones)

### 2. LocationList.tsx

Main list component with table and edit sidebar.

**Props:**

- `onEditLocation?: (location) => void` - Edit callback
- `onDeleteLocation?: (id) => void` - Delete callback

**Features:**

- Paginated table with infinite scroll
- Search functionality
- Type filtering
- Click-to-edit sidebar
- Inline delete with confirmation

### 3. page.tsx

Main location page with modal integration.

**Features:**

- "Add Location" button to open modal
- LocationList integration
- Modal form for creation
- Auto-refresh after operations

## API Service

### LocationService Methods

```typescript
// Get all locations with pagination and filters
static async getAll(page: number, limit: number, filters?: LocationFilters)

// Get single location by ID
static async getById(id: number)

// Create new location
static async create(location: CreateLocationRequest)

// Update existing location
static async update(id: number, updates: UpdateLocationRequest)

// Delete location
static async delete(id: number)

// Search locations
static async search(query: string, limit: number)
```

## TypeScript Interfaces

### Location

```typescript
interface Location {
  id: number
  type: string
  city: string
  country: string
  latitude: number
  longitude: number
  timezone: string
  state?: string
  created_at: string
  updated_at: string
}
```

### CreateLocationRequest

```typescript
interface CreateLocationRequest {
  type?: string
  city: string
  country: string
  latitude: number
  longitude: number
  timezone: string
  state?: string
}
```

### UpdateLocationRequest

```typescript
interface UpdateLocationRequest {
  type?: string
  city?: string
  country?: string
  latitude?: number
  longitude?: number
  timezone?: string
  state?: string
}
```

## Usage Examples

### Creating a Location

1. Navigate to `/dashboard/location`
2. Click "Add Location" button
3. Fill in the form fields
4. Click "Create Location"

### Editing a Location

**Method 1: Sidebar**

1. Click on any row in the table
2. Sidebar opens with location details
3. Edit fields as needed
4. Click "Save Changes"

**Method 2: Modal**

1. Click "Edit" button in the actions column
2. Modal opens with form
3. Edit fields
4. Submit changes

### Deleting a Location

1. Click "Delete" in actions column OR
2. Open sidebar and click "Delete Location"
3. Confirm deletion in popup

### Searching Locations

1. Use the search bar at the top
2. Type city, state, or country name
3. Results update automatically

## Styling

The location module follows the same modern, compact design as the library module:

- **Text-based UI**: Compact, readable text instead of heavy components
- **Clean Sidebar**: Modern static sidebar for editing
- **Responsive Table**: Efficient use of space
- **Color Coding**: Visual feedback for selections and states
- **Smooth Transitions**: Polished user experience

## Navigation

The location module is accessible from:

- **Sidebar**: Under "General" section → "Locations"
- **Direct URL**: `/dashboard/location`

## Future Enhancements

Potential improvements:

- Map integration for visualizing locations
- Bulk import/export functionality
- Location grouping by region
- Distance calculations between locations
- Weather data integration
- GPS coordinate picker
