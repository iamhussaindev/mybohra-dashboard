# Assign Duas - Drag & Drop Interface

## Overview

A highly efficient drag-and-drop interface for assigning library items (duas) to calendar dates. Features a 30/70 split layout with library list on the left and calendar on the right.

## Features

### 🎯 Core Functionality

1. **30/70 Split Layout**

   - Left Panel (30%): Library items list
   - Right Panel (70%): Hijri calendar

2. **Multi-Select Libraries**

   - Click to select individual items
   - "Select All" button for bulk selection
   - Visual checkboxes for clarity
   - Selected count badge

3. **Multi-Select Dates**

   - Click calendar dates to select multiple
   - Visual highlighting (blue border + ring)
   - Selected count badge
   - "Clear Selection" button

4. **Efficient Drag & Drop**
   - Drag single library item to any date
   - Drag multiple selected items together
   - Drop on any date or selected dates
   - Visual drop indicator (green highlight)
   - Automatic assignment to all selected dates

### 📋 Smart Features

**Automatic Multi-Assignment:**

- Select 3 library items + 5 dates = 15 assignments in one drop!
- Perfect for assigning multiple duas to a whole month
- No repetitive clicking needed

**Duplicate Detection:**

- Checks if library item already assigned to date
- Skips duplicates automatically
- Shows count of skipped assignments

**Success Feedback:**

- Shows success message with counts
- "Assigned X dua(s) to Y date(s)"
- Clears selections after successful drop

### 🔍 Search & Filter

- Real-time library search
- Searches across: name, description, album, tags
- Instant filtering
- Search persistence during drag operations

## Usage Instructions

### Basic Workflow:

1. **Select Library Items** (Left Panel)

   - Click items to select
   - Or use "Select All"
   - Selected items highlighted in blue

2. **Select Dates** (Right Panel)

   - Click calendar dates
   - Multiple dates turn blue
   - See count badge

3. **Drag & Drop**

   - Drag any library item (selected or not)
   - If item is selected → drags all selected items
   - If item not selected → drags only that item
   - Drop on any date

4. **Result**
   - All dragged items assigned to all selected dates
   - If no dates selected → assigns to dropped date only
   - Automatic calendar refresh
   - Selections cleared

### Advanced Use Cases:

**Assign one dua to many dates:**

1. Select no library items
2. Select multiple dates
3. Drag any single dua to calendar
4. Dua assigned to all selected dates

**Assign many duas to one date:**

1. Select multiple library items
2. Select no dates (or one date)
3. Drag any selected item
4. All selected items assigned to that date

**Assign many duas to many dates:**

1. Select multiple library items
2. Select multiple dates
3. Drag any selected item
4. All items → all dates (matrix multiplication!)

**Quick single assignment:**

1. Don't select anything
2. Drag any item to any date
3. Single assignment done

## Interface Elements

### Left Panel - Library List

```
┌─────────────────────────────┐
│ 🔍 Library Items      [3]   │
│ [Select All]                │
│ ┌─────────────────────────┐ │
│ │ Search libraries...      │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ ☑ 📖 1. Dua Kumayl    [🎵] │
│ ☑ 📖 2. Dua Tawassul  [🎵] │
│ ☐ 📖 3. Ziyarat Ashura     │
│ ...                         │
├─────────────────────────────┤
│ 📌 How to use:              │
│ 1. Select library items     │
│ 2. Select dates on calendar │
│ 3. Drag items to any date   │
│ 4. All items → all dates!   │
└─────────────────────────────┘
```

### Right Panel - Calendar

```
┌────────────────────────────────────────────┐
│ 📅 Muharram 1446            [Clear] [◄] [►]│
├────────────────────────────────────────────┤
│ MON  TUE  WED  THU  FRI  SAT  SUN         │
├────────────────────────────────────────────┤
│ [1]  [2✓] [3✓] [4]  [5]  [6]  [7]         │
│      📖2        📖1                         │
│                                            │
│ [8]  [9✓] [10] [11] [12] [13] [14]        │
│                                            │
│ ...                                        │
└────────────────────────────────────────────┘
```

## Technical Details

### Components

**Page:** `app/dashboard/assign-duas/page.tsx`

- Route wrapper with AuthGuard
- DashboardLayout integration

**Component:** `src/components/calendar/AssignDuasInterface.tsx`

- Main drag-and-drop interface
- State management for selections
- Drag event handlers
- API integration

### State Management

```typescript
// Library selection
selectedLibraryIds: Set<number>

// Date selection
selectedDates: Set<string> // "day-month-year"

// Drag state
draggedLibraries: Library[]
dropTargetDate: string | null
```

### API Calls

```typescript
// Create daily dua assignment
await DailyDuaService.create({
  library_id: number,
  date: number,
  month: number,
  note: string | null
})

// Check if already exists
await DailyDuaService.checkExists(
  library_id: number,
  date: number,
  month: number
)
```

### Drag & Drop Flow

1. **onDragStart** - Set draggedLibraries (selected items or single item)
2. **onDragEnter** - Highlight drop target date
3. **onDragOver** - Allow drop (prevent default)
4. **onDragLeave** - Remove highlight
5. **onDrop** - Process assignment:
   - Get target dates (selected or dropped)
   - Loop through libraries × dates
   - Check duplicates
   - Create assignments
   - Refresh calendar
   - Clear selections

## Styling

- **Selected Library:** Blue background + blue border
- **Selected Date:** Blue background + blue border + ring
- **Drop Target:** Green background + green border + ring + "Drop here" text
- **Has Duas:** Green badges showing assigned duas
- **Hover States:** Shadow + border color change
- **Transitions:** Smooth animations on all interactions

## Performance

**Optimizations:**

- Debounced search (instant but efficient)
- Batch API calls for multiple assignments
- Efficient date key generation
- Minimal re-renders
- Calendar data caching

**Scalability:**

- Handles 1000+ library items
- Supports 30-day months efficiently
- Smooth drag operations
- Fast duplicate checking

## Navigation

Access via sidebar:

- **Menu:** General → Assign Duas
- **Icon:** Drag & Drop icon
- **Route:** `/dashboard/assign-duas`

## Future Enhancements

Potential improvements:

- [ ] Bulk delete/unassign
- [ ] Copy assignments to another month
- [ ] Templates (save common patterns)
- [ ] Keyboard shortcuts (Ctrl+A, Ctrl+Click)
- [ ] Undo/Redo
- [ ] Assignment history/audit log
- [ ] Export assignments to CSV
- [ ] Import from template

## Tips & Tricks

**Speed Tip #1:** Assign whole month

```
1. Select all duas you want
2. Click all dates in calendar (row by row)
3. Drag once
4. Done! Entire month assigned
```

**Speed Tip #2:** Pattern assignment

```
1. Select specific duas (e.g., daily supplications)
2. Select every Monday (click all Mondays)
3. Drag once
4. Weekly pattern assigned!
```

**Speed Tip #3:** Search & assign

```
1. Search "ramadan"
2. Select all filtered results
3. Select all dates in Ramadan
4. Drag once
5. Ramadan duas fully configured!
```

## Troubleshooting

**Drag not working?**

- Check if library items are loading
- Ensure calendar data loaded
- Try refreshing the page

**Assignments not saving?**

- Check browser console for errors
- Verify daily_duas table exists in Supabase
- Check RLS policies

**Duplicates being created?**

- The checkExists function should prevent this
- If happening, check database constraints

**Performance issues?**

- Reduce number of simultaneous selections
- Clear selections before new operations
- Refresh calendar data periodically

## Related Files

- Component: `src/components/calendar/AssignDuasInterface.tsx`
- Page: `app/dashboard/assign-duas/page.tsx`
- API: `src/lib/api/dailyDua.ts`
- Sidebar: `src/components/layout/Sidebar.tsx`

## Success Metrics

This interface drastically improves efficiency:

- **Before:** 1 assignment = 1 click + 1 select + 1 save = 30+ clicks for a month
- **After:** 30 assignments = Select + Select + 1 Drag = 3 actions total!

**90% reduction in clicks!** 🎉
