# MyBohra Dashboard - Structure

## Dashboard Pages

### General

- **Dashboard** (`/dashboard`) - Main overview
- **Analytics** (`/dashboard/analytics`) - Charts and metrics
- **Users** (`/dashboard/users`) - User management with CRUD
- **Library** (`/dashboard/library`) - Library items (duas, manajaats) with search
- **Tasbeeh** (`/dashboard/tasbeeh`) - Digital prayer beads with table/grid view
- **Business** (`/dashboard/business`) - Business metrics and revenue
- **Miqaats** (`/dashboard/miqaats`) - Miqaat events management
- **Admin Calendar** (`/dashboard/admin-calendar`) - Full Hijri calendar with events
- **Assign Duas** (`/dashboard/assign-duas`) - Drag & drop interface (30/70 split)
- **Locations** (`/dashboard/location`) - Location management
- **Devices** (`/dashboard/devices`) - Device tracking

### App Data

- **Send Notifications** (`/dashboard/send-notification`) - Push notification sender
- **JSON Editor** (`/dashboard/json-editor`) - JSON editing with Monaco editor

### Support

- **Settings** (`/dashboard/settings`) - User preferences, profile, security
- **Logout** (`/dashboard/logout`) - Auto logout and redirect

## Key Features

### Assign Duas Interface

- 30% Library List | 70% Calendar
- Multi-select libraries (checkboxes)
- Multi-select dates (click)
- Drag & drop: All selected libraries → All selected dates
- Miqaat indicators (colored dots with legend)
- Month/Year navigation with dropdowns
- Today highlighting

### Tasbeeh Management

- Table view with infinite scroll
- Grid view with cards
- Data-driven type filter (shows counts)
- Search across name, description, text, tags
- Inline audio player in table
- 2-column form layout
- Full CRUD operations

### Calendar Features

- Admin Calendar: View and manage miqaats/duas
- Click dua → Opens library detail modal
- Miqaat type indicators with colors
- Daily duas management

### Library Management

- Full-text search (search_library function)
- Drag & drop file uploads
- Audio/PDF/YouTube links
- Detail modal with RTL Arabic support

## Tech Stack

- **Framework:** Next.js 15.3 (App Router)
- **UI:** Ant Design + Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth with Google OAuth
- **Icons:** Tabler Icons
- **Date:** Hijri calendar support

## CSS Configuration

- Tailwind `important: true` to override Ant Design
- CSS layers: antd → tailwind-utilities → custom
- Ant Design uses CSS variables (cssVar: true)

## Database Tables

- users
- library (with search_library function)
- tasbeeh (with search_tasbeeh function)
- miqaat
- daily_duas
- location
- data

## Build

- 23 routes (all static)
- Production ready
- No TypeScript errors
- Bundle optimized
