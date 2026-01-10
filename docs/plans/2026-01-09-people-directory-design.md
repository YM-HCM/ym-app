# People Directory Design

**Date:** 2026-01-09
**Status:** Ready for Implementation

## Overview

A searchable, filterable directory of all YM members with advanced filtering capabilities on desktop and simplified search-only experience on mobile.

## Scope

- **In Scope:** People directory with search, filters, card/table views
- **Out of Scope:** Org chart (deferred — see project-todos.md for future options)
- **Out of Scope:** Mobile filters (MVP ships with search-only on mobile)

---

## Prerequisites & Blockers

> ⚠️ **Database Schema Not Yet Migrated**
>
> The new database schema (`regions`, `subregions`, `neighbor_nets`, `role_types`, `role_assignments`, `user_projects`, etc.) is designed but not yet applied to Supabase.
>
> **Workaround for MVP:** Build the UI with mock data and leave TODO comments for Supabase integration. This allows UI development to proceed in parallel with database work.

---

## Design Decisions Summary

| Decision | Choice |
|----------|--------|
| Page URL | `/people` |
| Data fetching | Client-side with background prefetch (fetch all ~1000 users on app load, filter in JS) |
| Filter UI pattern | Dropdown with nested submenus (shadcn DropdownMenu) |
| Filter pills | Grouped by category with count (e.g., "Regions: 3 selected ✕") |
| Results display | Switchable: Cards ↔ Table (desktop only) |
| Table component | shadcn Table + TanStack Table |
| Clicking a person | Navigate to `/people/[id]` (read-only profile view) |
| Mobile experience | Search + Cards only (no filters, no table) |
| Sorting | Single-column sort, default by Name A→Z |

---

## Page Layout

### Desktop

```
┌─────────────────────────────────────────────────────────────────────┐
│  🔍 Search people...                                   [▣] [≡]     │
│                                                        cards table  │
│  [+ Filter ▼]  Regions: 2 ✕  Roles: 1 ✕                  clear all │
├─────────────────────────────────────────────────────────────────────┤
│  24 people                                                    📋    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐                   │
│   │ Card   │  │ Card   │  │ Card   │  │ Card   │                   │
│   └────────┘  └────────┘  └────────┘  └────────┘                   │
│                                                                     │
│                        [Pagination]                                 │
└─────────────────────────────────────────────────────────────────────┘
```

### Mobile

```
┌─────────────────────────────────┐
│  🔍 Search people...            │
├─────────────────────────────────┤
│  874 people                     │
├─────────────────────────────────┤
│  ┌─────────────────────────┐    │
│  │  [Photo] Ahmed Khan     │    │
│  │  Houston, TX            │    │
│  │  [NNC] [Marketing]      │    │
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │  [Photo] Sara Ali       │    │
│  │  ...                    │    │
│  └─────────────────────────┘    │
│           ...                   │
└─────────────────────────────────┘
```

---

## Filter System

### Available Filters

| Category | Type | Options Source |
|----------|------|----------------|
| Regions | Multi-select | `regions` table |
| Subregions | Multi-select | `subregions` table |
| NeighborNets | Multi-select | `neighbor_nets` table |
| Roles | Multi-select | `role_types` table |
| Project Types | Multi-select | Predefined list (convention, retreat, etc.) |
| Project Roles | Multi-select | Free-form from `user_projects.role` *(TODO: consider normalizing to reduce cardinality)* |
| Skills | Multi-select | Predefined skills list |
| Years in YM | Range | Calculated from `memberships.joined_at` *(TODO: verify data quality once real data exists)* |

### Filter Interactions

| Action | Result |
|--------|--------|
| Click "+ Filter" button | Opens dropdown with category submenus |
| Hover/click category | Opens submenu with checkbox options |
| Check an option | Filter applied immediately, pill appears |
| Click pill body | Opens dropdown, scrolled to that category's submenu |
| Click pill ✕ | Clears that entire filter category |
| Click "clear all" | Removes all active filters |

### Filter Pills

Pills are grouped by category to prevent clutter:

```
[Regions: 3 selected ✕]  [Roles: 2 selected ✕]  [Skills: 1 selected ✕]
```

- Clicking the pill opens the filter dropdown focused on that category
- The ✕ clears the entire category

---

## Person Card

### Card Content (Standard density)

```
┌─────────────────────────────────┐
│  [Avatar]  First Last           │
│            Houston, TX          │
│                                 │
│  [NNC] [Marketing Team Lead]    │  ← Role badges (all roles shown)
│  [Cloud Coordinator]            │
│                                 │
│  🏷️ Leadership • Public Speaking│  ← Skills (2-3 max)
└─────────────────────────────────┘
```

### Card Data

| Field | Source |
|-------|--------|
| Avatar | `users.avatar_url` |
| Name | `users.first_name` + `users.last_name` |
| Location | `subregions.name` or `regions.name` |
| Roles | `role_assignments` → `role_types.name` (all active) |
| Skills | `users.skills[]` (first 2-3) |

### Card Interaction

- Click anywhere on card → Navigate to `/people/[id]`
- Cards displayed in responsive grid (4 columns on large screens, 2 on medium, 1 on mobile)

---

## Table View (Desktop Only)

### Columns

| Column | Sortable | Notes |
|--------|----------|-------|
| Name | ✅ | First + Last, default sort A→Z |
| Roles | ❌ | Badges, wrapping allowed |
| Region | ✅ | Alphabetical |
| Subregion | ✅ | Alphabetical |
| Skills | ❌ | 2-3 badges |

### Table Features

- Single-column sorting (click header to toggle)
- Pagination (20 per page default)
- Click row → Navigate to `/people/[id]`
- Built with shadcn `Table` + `@tanstack/react-table`

---

## Copy Emails Feature

- Icon button (📋) in results header, right side
- Copies all visible/filtered results' emails to clipboard
- Shows toast confirmation: "24 emails copied"
- Desktop only

---

## Profile View (`/people/[id]`)

Reuses existing `/profile` page components in **read-only mode**:

- Same layout and sections (personal info, YM roles, projects, education, skills)
- No edit buttons, no inline editing
- No floating save bar
- "Back to Directory" link at top

### Implementation

```tsx
// Reuse profile components with isEditable={false} prop
<PersonalInfoSection data={user} isEditable={false} />
<YMRolesSection roles={roles} isEditable={false} />
// etc.
```

---

## Data Model

### Person (for directory listing)

```typescript
interface PersonListItem {
  id: string
  firstName: string
  lastName: string
  avatarUrl?: string
  email: string  // For copy emails feature
  region: {
    id: string
    name: string
  }
  subregion?: {
    id: string
    name: string
  }
  neighborNet?: {
    id: string
    name: string
  }
  roles: {
    id: string
    name: string
    category: string  // 'ns' | 'council' | 'regional' | 'subregional' | 'neighbor_net' | 'cabinet' | 'cloud'
  }[]
  skills: string[]
  yearsInYM?: number  // Calculated from membership.joined_at
}
```

### Filter State

```typescript
interface PeopleFilters {
  search: string
  regions: string[]      // region IDs
  subregions: string[]   // subregion IDs
  neighborNets: string[] // neighbor_net IDs
  roles: string[]        // role_type IDs
  projectTypes: string[] // project type values
  projectRoles: string[] // free-form strings
  skills: string[]       // skill IDs
  yearsInYM?: {
    min?: number
    max?: number
  }
}
```

---

## Data Loading Strategy

### Background Prefetch

To ensure instant filtering when users navigate to `/people`, data is fetched in the background when the app loads:

```tsx
// In app layout or context provider
useEffect(() => {
  // Prefetch people data when user logs in / app mounts
  prefetchPeopleData()
}, [])
```

**Benefits:**
- Directory opens instantly with data already cached
- No loading spinner when user navigates to People page
- Filtering feels instantaneous

**Implementation Notes:**
- Use React Query or SWR for caching
- Stale-while-revalidate pattern for freshness
- ~1000 users × ~500 bytes/user ≈ 500KB payload (acceptable)
- Consider: only prefetch for authenticated users

---

## Component Architecture

```
src/app/people/
├── page.tsx                      # Main directory page
├── [id]/
│   └── page.tsx                  # Read-only profile view
├── components/
│   ├── PeopleSearch.tsx          # Search input
│   ├── PeopleFilters.tsx         # Filter dropdown + pills
│   ├── FilterPill.tsx            # Individual filter pill
│   ├── PersonCard.tsx            # Card component
│   ├── PersonCardGrid.tsx        # Grid of cards
│   ├── PeopleTable.tsx           # Table component (TanStack)
│   ├── PeopleTableColumns.tsx    # Column definitions
│   ├── ViewToggle.tsx            # Cards/Table toggle
│   ├── CopyEmailsButton.tsx      # Copy emails action
│   └── PeoplePagination.tsx      # Pagination controls
└── hooks/
    ├── usePeopleData.ts          # Fetch all people
    └── usePeopleFilters.ts       # Filter state management
```

---

## Tech Stack

| Need | Solution |
|------|----------|
| UI Components | shadcn/ui |
| Filter Dropdown | `DropdownMenu` with `DropdownMenuSub` for nested menus |
| Filter Pills | `Badge` component with custom styling |
| Table | `Table` + `@tanstack/react-table` |
| Cards | Custom component with `Card` base |
| View Toggle | `Button` group with icons |
| Mobile Detection | Existing `useMobile()` hook |
| Icons | Lucide React |

---

## Implementation Phases

### Phase 1: Core Structure
- [ ] Page layout with AppShell
- [ ] Search input (filters results by name)
- [ ] Fetch all people from Supabase
- [ ] PersonCard component
- [ ] Card grid with responsive columns

### Phase 2: Table View
- [ ] Install `@tanstack/react-table`
- [ ] Add shadcn `Table` component
- [ ] PeopleTable with column definitions
- [ ] View toggle (Cards/Table)
- [ ] Single-column sorting

### Phase 3: Filters
- [ ] Filter dropdown with nested submenus
- [ ] Filter state management
- [ ] Filter pills with counts
- [ ] Click pill to edit filter
- [ ] Clear individual filter / clear all
- [ ] Client-side filtering logic

### Phase 4: Polish
- [ ] Pagination
- [ ] Copy emails button
- [ ] Loading states / skeletons
- [ ] Empty states ("No people found")
- [ ] Hide filters on mobile

### Phase 5: Profile View
- [ ] `/people/[id]` route
- [ ] Reuse profile components in read-only mode
- [ ] Back to directory navigation

---

## Open Questions (Resolved)

| Question | Decision |
|----------|----------|
| Card vs Table default | Cards (more visual, better first impression) |
| Multi-column sort | No, single-column only |
| Mobile filters | Deferred, search-only for MVP |
| Email visibility | Hidden in table, available via Copy button |
| Filter persistence | URL params (enables shareable filtered views) — *future enhancement* |

---

## Future Enhancements (Not MVP)

- Mobile filters (Sheet + Accordion pattern)
- URL-based filter persistence (shareable links)
- Saved filter presets
- Export to CSV
- Org chart (see project-todos.md for options)
