# Supabase Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace mock data with real Supabase queries for People page, Home page, and add generated TypeScript types.

**Architecture:** Server-side data fetching using Next.js Server Components. Generate types from Supabase schema, update clients to use typed generics, create data-fetching functions, and update pages to consume real data.

**Tech Stack:** Supabase CLI (type generation), @supabase/ssr, Next.js 15 Server Components, TypeScript

---

## Task 1: Generate TypeScript Types from Supabase

**Files:**
- Create: `src/types/database.types.ts`
- Modify: `package.json` (add script)
- Delete: `src/types/supabase.ts` (after verification)

**Step 1: Install Supabase CLI globally (if needed)**

Run: `bunx supabase --version`
Expected: Version number or install prompt

**Step 2: Generate types from linked project**

Run:
```bash
bunx supabase gen types typescript --project-id todqvyzdvpnwuuonxwch > src/types/database.types.ts
```
Expected: File created with `Database` interface containing all tables

**Step 3: Add npm script for future regeneration**

In `package.json`, add to scripts:
```json
"db:types": "bunx supabase gen types typescript --project-id todqvyzdvpnwuuonxwch > src/types/database.types.ts"
```

**Step 4: Verify generated types contain expected tables**

Run: `grep -E "users:|regions:|subregions:|neighbor_nets:|role_types:|role_assignments:" src/types/database.types.ts | head -10`
Expected: Lines showing table definitions

**Step 5: Commit**

```bash
git add src/types/database.types.ts package.json
git commit -m "feat: add generated Supabase TypeScript types"
```

---

## Task 2: Update Supabase Clients to Use Generated Types

**Files:**
- Modify: `src/lib/supabase/server.ts`
- Modify: `src/lib/supabase/client.ts`

**Step 1: Update server client with Database type**

Replace `src/lib/supabase/server.ts`:
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
```

**Step 2: Update browser client with Database type**

Replace `src/lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Step 3: Verify TypeScript compiles**

Run: `bunx tsc --noEmit`
Expected: No errors (or only pre-existing unrelated errors)

**Step 4: Commit**

```bash
git add src/lib/supabase/server.ts src/lib/supabase/client.ts
git commit -m "feat: add Database types to Supabase clients"
```

---

## Task 3: Create People Data Fetching Functions

**Files:**
- Create: `src/lib/supabase/queries/people.ts`
- Create: `src/lib/supabase/queries/index.ts`

**Step 1: Create people queries file**

Create `src/lib/supabase/queries/people.ts`:
```typescript
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'

// Type aliases for cleaner code
type Tables = Database['public']['Tables']
type UserRow = Tables['users']['Row']
type RoleAssignmentRow = Tables['role_assignments']['Row']
type RoleTypeRow = Tables['role_types']['Row']
type MembershipRow = Tables['memberships']['Row']
type NeighborNetRow = Tables['neighbor_nets']['Row']
type SubregionRow = Tables['subregions']['Row']
type RegionRow = Tables['regions']['Row']

export interface PersonListItem {
  id: string
  firstName: string
  lastName: string
  email: string
  avatarUrl?: string
  region: { id: string; name: string } | null
  subregion: { id: string; name: string } | null
  neighborNet: { id: string; name: string } | null
  roles: { id: string; name: string; category: string }[]
  skills: string[]
  yearsInYM?: number
}

export interface FilterOption {
  id: string
  name: string
}

export interface FilterCategories {
  regions: FilterOption[]
  subregions: FilterOption[]
  neighborNets: FilterOption[]
  roles: FilterOption[]
  skills: FilterOption[]
}

/**
 * Fetch all people for the directory with their roles and geographic info
 */
export async function fetchPeopleForDirectory(): Promise<PersonListItem[]> {
  const supabase = await createClient()

  // Fetch users who have completed onboarding
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .not('onboarding_completed_at', 'is', null)

  if (usersError) {
    console.error('Error fetching users:', usersError)
    return []
  }

  if (!users || users.length === 0) {
    return []
  }

  const userIds = users.map((u) => u.id)

  // Fetch role assignments for these users
  const { data: roleAssignments } = await supabase
    .from('role_assignments')
    .select(`
      *,
      role_types (*)
    `)
    .in('user_id', userIds)
    .eq('is_active', true)

  // Fetch memberships for these users
  const { data: memberships } = await supabase
    .from('memberships')
    .select(`
      *,
      neighbor_nets (
        *,
        subregions (
          *,
          regions (*)
        )
      )
    `)
    .in('user_id', userIds)
    .eq('status', 'active')

  // Build the PersonListItem array
  return users.map((user) => {
    const userMembership = memberships?.find((m) => m.user_id === user.id)
    const userRoles = roleAssignments?.filter((ra) => ra.user_id === user.id) || []

    // Extract geographic info from membership
    const nn = userMembership?.neighbor_nets as (NeighborNetRow & {
      subregions: SubregionRow & { regions: RegionRow }
    }) | null

    const neighborNet = nn ? { id: nn.id, name: nn.name } : null
    const subregion = nn?.subregions ? { id: nn.subregions.id, name: nn.subregions.name } : null
    const region = nn?.subregions?.regions ? { id: nn.subregions.regions.id, name: nn.subregions.regions.name } : null

    // Calculate years in YM
    let yearsInYM: number | undefined
    if (userMembership?.joined_at) {
      const joinedYear = new Date(userMembership.joined_at).getFullYear()
      yearsInYM = new Date().getFullYear() - joinedYear
    }

    // Map roles
    const roles = userRoles.map((ra) => {
      const roleType = ra.role_types as RoleTypeRow | null
      return {
        id: roleType?.id || ra.id,
        name: roleType?.name || ra.role_type_custom || 'Unknown Role',
        category: roleType?.category || 'other',
      }
    })

    return {
      id: user.id,
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      email: user.email,
      avatarUrl: user.avatar_url || undefined,
      region,
      subregion,
      neighborNet,
      roles,
      skills: user.skills || [],
      yearsInYM,
    }
  })
}

/**
 * Fetch filter options from database
 */
export async function fetchFilterCategories(): Promise<FilterCategories> {
  const supabase = await createClient()

  const [regionsRes, subregionsRes, neighborNetsRes, roleTypesRes] = await Promise.all([
    supabase.from('regions').select('id, name').eq('is_active', true).order('name'),
    supabase.from('subregions').select('id, name').eq('is_active', true).order('name'),
    supabase.from('neighbor_nets').select('id, name').eq('is_active', true).order('name'),
    supabase.from('role_types').select('id, name').order('name'),
  ])

  // Get unique skills from users
  const { data: users } = await supabase
    .from('users')
    .select('skills')
    .not('onboarding_completed_at', 'is', null)

  const skillSet = new Set<string>()
  users?.forEach((u) => {
    u.skills?.forEach((skill: string) => skillSet.add(skill))
  })
  const skills = Array.from(skillSet)
    .sort()
    .map((s) => ({ id: s.toLowerCase().replace(/\s+/g, '-'), name: s }))

  return {
    regions: regionsRes.data || [],
    subregions: subregionsRes.data || [],
    neighborNets: neighborNetsRes.data || [],
    roles: roleTypesRes.data || [],
    skills,
  }
}
```

**Step 2: Create index export**

Create `src/lib/supabase/queries/index.ts`:
```typescript
export * from './people'
```

**Step 3: Verify TypeScript compiles**

Run: `bunx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/lib/supabase/queries/
git commit -m "feat: add people data fetching functions"
```

---

## Task 4: Update People Page to Use Real Data

**Files:**
- Modify: `src/app/people/page.tsx`
- Modify: `src/app/people/types.ts`
- Modify: `src/app/people/mock-data.ts` (keep as fallback, update exports)

**Step 1: Create server-side data fetching wrapper**

Create `src/app/people/data.ts`:
```typescript
import { fetchPeopleForDirectory, fetchFilterCategories } from '@/lib/supabase/queries'
import type { PersonListItem, FilterCategory } from './types'

export async function getPeoplePageData(): Promise<{
  people: PersonListItem[]
  filterCategories: FilterCategory[]
}> {
  const [people, filters] = await Promise.all([
    fetchPeopleForDirectory(),
    fetchFilterCategories(),
  ])

  // Transform filter categories to match UI format
  const filterCategories: FilterCategory[] = [
    { id: 'regions', label: 'Regions', options: filters.regions },
    { id: 'subregions', label: 'Subregions', options: filters.subregions },
    { id: 'neighborNets', label: 'NeighborNets', options: filters.neighborNets },
    { id: 'roles', label: 'Roles', options: filters.roles },
    { id: 'skills', label: 'Skills', options: filters.skills },
  ]

  return { people, filterCategories }
}
```

**Step 2: Create PeoplePageClient component**

Create `src/app/people/PeoplePageClient.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  PeopleSearch,
  PeopleFilters,
  PersonCardGrid,
  PeopleTable,
  ViewToggle,
  CopyEmailsButton,
} from './components'
import { usePeopleFilters } from './hooks/usePeopleFilters'
import type { PersonListItem, FilterCategory, ViewMode } from './types'

interface PeoplePageClientProps {
  initialPeople: PersonListItem[]
  filterCategories: FilterCategory[]
}

export function PeoplePageClient({ initialPeople, filterCategories }: PeoplePageClientProps) {
  const isMobile = useIsMobile()
  const [viewMode, setViewMode] = useState<ViewMode>('cards')

  const {
    filters,
    setSearch,
    setFilterValues,
    clearCategory,
    clearAllFilters,
    filteredPeople,
  } = usePeopleFilters(initialPeople)

  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-[calc(100vh-3.5rem)] md:min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="px-4 md:px-6 py-4">
            {/* Single row: Search + Filters + Controls */}
            <div className="flex items-center gap-4">
              <PeopleSearch
                value={filters.search}
                onChange={setSearch}
                placeholder="Search people..."
              />

              {/* Filters - desktop only */}
              {!isMobile && (
                <PeopleFilters
                  filters={filters}
                  filterCategories={filterCategories}
                  onFilterChange={setFilterValues}
                  onClearCategory={clearCategory}
                  onClearAll={clearAllFilters}
                />
              )}

              {/* Spacer to push controls right */}
              <div className="flex-1" />

              {/* View toggle + Copy emails - desktop only */}
              {!isMobile && (
                <div className="flex items-center gap-1">
                  <ViewToggle view={viewMode} onChange={setViewMode} />
                  <CopyEmailsButton people={filteredPeople} />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 px-4 md:px-6 py-6">
          {/* Cards view (default, always on mobile) */}
          {(viewMode === 'cards' || isMobile) && (
            <PersonCardGrid people={filteredPeople} />
          )}

          {/* Table view (desktop only) */}
          {viewMode === 'table' && !isMobile && (
            <PeopleTable people={filteredPeople} />
          )}
        </main>
      </div>
    </TooltipProvider>
  )
}
```

**Step 3: Update page.tsx to be a Server Component**

Replace `src/app/people/page.tsx`:
```typescript
import { AppShell } from '@/components/layout'
import { getPeoplePageData } from './data'
import { PeoplePageClient } from './PeoplePageClient'

export default async function PeoplePage() {
  const { people, filterCategories } = await getPeoplePageData()

  return (
    <AppShell>
      <PeoplePageClient
        initialPeople={people}
        filterCategories={filterCategories}
      />
    </AppShell>
  )
}
```

**Step 4: Update types.ts to export PersonListItem correctly**

Ensure `src/app/people/types.ts` exports match the query types (should already be compatible).

**Step 5: Verify page loads**

Run: `bun run dev`
Navigate to: `http://localhost:3000/people`
Expected: Page loads (may show empty state if no users have completed onboarding)

**Step 6: Commit**

```bash
git add src/app/people/
git commit -m "feat: connect People page to Supabase data"
```

---

## Task 5: Update Home Page to Show Real User Data

**Files:**
- Modify: `src/app/home/page.tsx`
- Create: `src/lib/supabase/queries/user.ts`

**Step 1: Create user query function**

Create `src/lib/supabase/queries/user.ts`:
```typescript
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'

type Tables = Database['public']['Tables']
type RoleTypeRow = Tables['role_types']['Row']

export interface UserContext {
  name: string
  roles: string[]
  neighborNetName: string | null
  subregionName: string | null
  yearJoined: number | null
}

/**
 * Fetch the current user's context for the home page
 */
export async function fetchUserContext(userId: string): Promise<UserContext | null> {
  const supabase = await createClient()

  // Fetch user
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', userId)
    .single()

  if (userError || !user) {
    console.error('Error fetching user:', userError)
    return null
  }

  // Fetch active role assignments with role types
  const { data: roleAssignments } = await supabase
    .from('role_assignments')
    .select(`
      *,
      role_types (*)
    `)
    .eq('user_id', user.id)
    .eq('is_active', true)

  // Fetch active membership with geographic info
  const { data: membership } = await supabase
    .from('memberships')
    .select(`
      *,
      neighbor_nets (
        name,
        subregions (
          name
        )
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  // Build role names
  const roles = roleAssignments?.map((ra) => {
    const roleType = ra.role_types as RoleTypeRow | null
    return roleType?.name || ra.role_type_custom || 'Member'
  }) || []

  // Extract geographic info
  const nn = membership?.neighbor_nets as { name: string; subregions: { name: string } } | null
  const neighborNetName = nn?.name || null
  const subregionName = nn?.subregions?.name || null

  // Calculate year joined
  let yearJoined: number | null = null
  if (membership?.joined_at) {
    yearJoined = new Date(membership.joined_at).getFullYear()
  }

  return {
    name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Member',
    roles,
    neighborNetName,
    subregionName,
    yearJoined,
  }
}
```

**Step 2: Update queries index**

Update `src/lib/supabase/queries/index.ts`:
```typescript
export * from './people'
export * from './user'
```

**Step 3: Update Home page to use real data**

Replace `src/app/home/page.tsx`:
```typescript
import { redirect } from 'next/navigation'
import { Users, DollarSign, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { fetchUserContext } from '@/lib/supabase/queries'
import { AppShell } from '@/components/layout'
import { PersonalContextCard, QuickActionCard } from '@/components/home'

const QUICK_ACTIONS = [
  {
    href: '/people',
    icon: Users,
    title: 'People',
    description: 'Browse YM members',
  },
  {
    href: '/finance',
    icon: DollarSign,
    title: 'Finance',
    description: 'Reimbursements',
  },
  {
    href: '/docs',
    icon: FileText,
    title: 'Docs',
    description: 'Halaqa & SOPs',
  },
]

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Fetch real user context
  const userContext = await fetchUserContext(user.id)

  // Fallback values if user context not found
  const displayName = userContext?.name || user.email?.split('@')[0] || 'Member'
  const displayRoles = userContext?.roles.length ? userContext.roles : []
  const displayNN = userContext?.neighborNetName || 'No NeighborNet'
  const displaySR = userContext?.subregionName || ''
  const displayYear = userContext?.yearJoined || new Date().getFullYear()

  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] md:min-h-screen px-4 py-12">
        <div className="w-full max-w-2xl space-y-8">
          {/* Personal Context Card */}
          <div
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: '0ms' }}
          >
            <PersonalContextCard
              name={displayName}
              roles={displayRoles}
              neighborNetName={displayNN}
              subregionName={displaySR}
              yearJoined={displayYear}
            />
          </div>

          {/* Quick Action Cards */}
          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: '150ms' }}
          >
            {QUICK_ACTIONS.map((action) => (
              <QuickActionCard
                key={action.href}
                href={action.href}
                icon={action.icon}
                title={action.title}
                description={action.description}
              />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
```

**Step 4: Verify home page loads**

Run: `bun run dev`
Navigate to: `http://localhost:3000/home`
Expected: Page loads with real user data (or fallbacks if no data)

**Step 5: Commit**

```bash
git add src/lib/supabase/queries/ src/app/home/page.tsx
git commit -m "feat: connect Home page to Supabase user data"
```

---

## Task 6: Clean Up Old Types File

**Files:**
- Delete: `src/types/supabase.ts`
- Modify: Any files importing from old types

**Step 1: Search for imports of old types file**

Run: `grep -r "from '@/types/supabase'" src/ --include="*.ts" --include="*.tsx"`
Expected: List of files using old types

**Step 2: Update imports to use database.types.ts**

For each file found, update import from:
```typescript
import { User, RoleAssignment } from '@/types/supabase'
```
To:
```typescript
import type { Database } from '@/types/database.types'
type User = Database['public']['Tables']['users']['Row']
```

Or create helper types in a new file if needed.

**Step 3: Delete old types file**

Run: `rm src/types/supabase.ts`

**Step 4: Verify build succeeds**

Run: `bun run build`
Expected: Build completes successfully

**Step 5: Commit**

```bash
git add -A
git commit -m "refactor: remove manual types, use generated database types"
```

---

## Task 7: Update project-todos.md

**Files:**
- Modify: `docs/project-todos.md`

**Step 1: Mark completed tasks**

Update the Integration section:
```markdown
## Integration (When DB + UI Converge)

- [x] Connect onboarding form to users table
- [x] Connect profile page to user data
- [x] **Generate TypeScript types from schema** — `bun run db:types`
- [x] Connect people page to users + roles
- [x] Connect landing page to role_assignments
- [ ] Test end-to-end auth flow
```

**Step 2: Commit**

```bash
git add docs/project-todos.md
git commit -m "docs: mark Supabase integration tasks complete"
```

---

## Summary

After completing all tasks:
1. TypeScript types auto-generated from Supabase schema
2. Supabase clients fully typed with `Database` generic
3. People page fetches real users, roles, and geographic data
4. Home page shows real user context and roles
5. Filter options come from real database tables
6. npm script available for regenerating types: `bun run db:types`
