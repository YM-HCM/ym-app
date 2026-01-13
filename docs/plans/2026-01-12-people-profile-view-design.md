# People Profile View - Design Document

**Date:** 2026-01-12
**Feature:** Read-only profile view at `/people/[id]`
**Status:** Design Complete - Ready for Implementation

---

## Overview

Add a read-only profile view accessible from the people directory. When users click on a person card, they'll see that person's full profile in the same format as "My Profile" but without editing capabilities.

**Key Goals:**
- Reuse existing profile components in read-only mode
- Support shareable filtered views via URL params
- Maintain consistent UI with editable profile page
- Simple error and loading states

---

## Design Decisions

### 1. Privacy Model: **Show Everything**
- All authenticated YM members can view each other's full profiles
- No field-level privacy controls (all or nothing)
- Aligns with existing RLS policy: "Authenticated users can view all users"
- Reasoning: Internal org tool, transparency helps collaboration

### 2. Component Reuse: **Context-Based Mode**
- Create `ProfileModeContext` to provide `isEditable` boolean
- All profile section components read from context
- No prop drilling, impossible to mix modes on one page
- Matches existing pattern (`OnboardingContext`, `AuthContext`)

### 3. Navigation: **URL Params for Shareable Views**
- Filter state persisted in URL query params
- Example: `/people?region=texas&role=software&skills=react`
- Back button from profile preserves filters via `?back=` param
- Benefits: Shareable links, browser history works, refresh preserves state

### 4. Empty States: **Show All Sections**
- Always render all 5 sections, even if empty
- Empty state: Icon + "No [X] added yet" message
- Reasoning: Consistent layout, clear what info is missing
- User can't fix it from this view (read-only)

### 5. Profile Header: **Reuse Existing Layout**
- Same header structure as `/profile` page
- Small icon + name (not large avatar)
- Reasoning: Maximum component reuse, familiar feel
- Header text shows person's name instead of "My Profile"

### 6. Error Handling: **Single Generic Error**
- One error component handles all failure cases
- Message: "Profile Not Found - This person doesn't exist or their profile isn't available yet."
- Back to Directory button for recovery
- No complexity of different error types

### 7. Loading State: **Full-Page Skeleton**
- Gray skeleton boxes matching section structure
- Reduces layout shift when content loads
- Clear visual feedback of what's loading

### 8. Data Fetching: **Shared Query, Separate Hooks**
- Shared query function in `lib/supabase/queries/profile.ts`
- Two hooks: `useProfileData()` (current user), `usePersonProfile(userId)` (any user)
- DRY query logic, clean API boundaries

---

## Architecture

### File Structure

```
src/
├── app/people/[id]/
│   ├── page.tsx                          # Main profile view page
│   └── components/
│       ├── ProfileSkeleton.tsx           # Loading skeleton
│       └── ProfileNotFound.tsx           # Error state
├── contexts/
│   └── ProfileModeContext.tsx            # New: isEditable context
├── lib/supabase/queries/
│   └── profile.ts                        # New: shared query functions
└── app/profile/
    ├── hooks/
    │   ├── useProfileData.ts             # Modified: use shared query
    │   └── usePersonProfile.ts           # New: fetch any user by ID
    └── components/
        ├── PersonalInfoSection.tsx       # Modified: read context
        ├── YMRolesSection.tsx            # Modified: read context
        ├── YMProjectsSection.tsx         # Modified: read context
        ├── EducationSection.tsx          # Modified: read context
        └── SkillsChipSelector.tsx        # Modified: read context
```

---

## Implementation Details

### ProfileModeContext

```tsx
// contexts/ProfileModeContext.tsx
'use client'

import { createContext, useContext, ReactNode } from 'react'

interface ProfileModeContextValue {
  isEditable: boolean
}

const ProfileModeContext = createContext<ProfileModeContextValue | undefined>(undefined)

export function ProfileModeProvider({
  isEditable,
  children
}: {
  isEditable: boolean
  children: ReactNode
}) {
  return (
    <ProfileModeContext.Provider value={{ isEditable }}>
      {children}
    </ProfileModeContext.Provider>
  )
}

export function useProfileMode() {
  const context = useContext(ProfileModeContext)
  if (!context) {
    throw new Error('useProfileMode must be used within ProfileModeProvider')
  }
  return context
}
```

**Usage:**
```tsx
// /profile/page.tsx (editable)
<ProfileModeProvider isEditable={true}>
  <PersonalInfoSection {...} />
</ProfileModeProvider>

// /people/[id]/page.tsx (read-only)
<ProfileModeProvider isEditable={false}>
  <PersonalInfoSection {...} />
</ProfileModeProvider>
```

---

### Data Fetching Layer

**Shared Query Function:**
```tsx
// lib/supabase/queries/profile.ts
import { createClient } from '@/lib/supabase/client'
import type { ProfileFormState } from '@/app/profile/hooks/useProfileForm'

export async function fetchUserProfileById(userId: string): Promise<{
  data: ProfileFormState | null
  error: string | null
}> {
  const supabase = createClient()

  // Fetch user by ID
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (userError) {
    return { data: null, error: userError.message }
  }

  // Fetch related data in parallel (roles, projects, membership)
  // Transform to ProfileFormState format
  // (Reuse logic from existing useProfileData hook)

  return { data: transformedData, error: null }
}
```

**Two Hooks:**
1. `useProfileData()` - Gets current auth user's profile
2. `usePersonProfile(userId)` - Gets any user's profile by ID

Both call the shared query function, ensuring consistent data structure.

---

### Component Adaptation Pattern

All profile section components follow this pattern:

```tsx
'use client'

import { useProfileMode } from '@/contexts/ProfileModeContext'

export function PersonalInfoSection({ ... }: Props) {
  const { isEditable } = useProfileMode()

  return (
    <section>
      <h2>Section Title</h2>

      {isEditable ? (
        // Editable: InlineEditField with pencil icon
        <InlineEditField {...} />
      ) : (
        // Read-only: Static text display
        <div>
          <label>Phone Number</label>
          <span>{phoneNumber || '—'}</span>
        </div>
      )}
    </section>
  )
}
```

**Components to Modify:**
- `PersonalInfoSection` - Hide edit icons, show static text
- `YMRolesSection` - Hide "+ Add Role" button, no edit/delete per card
- `YMProjectsSection` - Hide "+ Add Project" button, no edit/delete per card
- `EducationSection` - Hide "+ Add Education" button, no edit/delete per card
- `SkillsChipSelector` - Make chips non-interactive (no toggle on click)

---

### URL Params Implementation

**Filter State in URL:**
```
/people?search=john&regions=123,456&roles=789&skills=react,python
```

**Implementation:**
```tsx
// /people/page.tsx
const searchParams = useSearchParams()
const router = useRouter()

// Read filters from URL on mount
const [filters, setFilters] = useState<PeopleFilters>(() => ({
  search: searchParams.get('search') ?? '',
  regions: searchParams.get('regions')?.split(',').filter(Boolean) ?? [],
  roles: searchParams.get('roles')?.split(',').filter(Boolean) ?? [],
  // ...
}))

// Update URL when filters change
useEffect(() => {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.regions.length) params.set('regions', filters.regions.join(','))
  // ...
  router.replace(`/people?${params.toString()}`, { scroll: false })
}, [filters, router])
```

**Back Navigation:**
```tsx
// PersonCard.tsx - when navigating TO profile
const currentUrl = usePathname() + '?' + useSearchParams().toString()
router.push(`/people/${person.id}?back=${encodeURIComponent(currentUrl)}`)

// /people/[id]/page.tsx - back button
const backUrl = searchParams.get('back') ?? '/people'
<Button onClick={() => router.push(backUrl)}>Back</Button>
```

---

### Profile View Page Structure

```tsx
// app/people/[id]/page.tsx
'use client'

import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { ProfileModeProvider } from '@/contexts/ProfileModeContext'
import { usePersonProfile } from '@/app/profile/hooks/usePersonProfile'
import { ProfileSkeleton } from './components/ProfileSkeleton'
import { ProfileNotFound } from './components/ProfileNotFound'

export default function PersonProfilePage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams()
  const backUrl = searchParams.get('back') ?? '/people'

  const { personData, isLoading, error } = usePersonProfile(params.id)

  if (isLoading) return <ProfileSkeleton />
  if (error || !personData) return <ProfileNotFound />

  return (
    <ProfileModeProvider isEditable={false}>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 border-b bg-background">
          <div className="flex h-16 items-center gap-4 px-6">
            <Button variant="ghost" size="icon" onClick={() => router.push(backUrl)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">
                  {personData.firstName} {personData.lastName}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {personData.location}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 py-8">
          <div className="mx-auto max-w-2xl space-y-12">
            <PersonalInfoSection {...personData} />
            <YMRolesSection {...personData} />
            <YMProjectsSection {...personData} />
            <EducationSection {...personData} />
            <SkillsChipSelector {...personData} />
          </div>
        </main>
      </div>
    </ProfileModeProvider>
  )
}
```

---

### Loading State: ProfileSkeleton

```tsx
// app/people/[id]/components/ProfileSkeleton.tsx
import { Skeleton } from '@/components/ui/skeleton'

export function ProfileSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header skeleton */}
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="flex h-16 items-center gap-4 px-6">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </header>

      {/* Content skeletons - 5 sections */}
      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-2xl space-y-12">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
```

---

### Error State: ProfileNotFound

```tsx
// app/people/[id]/components/ProfileNotFound.tsx
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AlertCircle, ArrowLeft, ArrowRight, User } from 'lucide-react'

export function ProfileNotFound() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="flex h-16 items-center gap-4 px-6">
          <Button variant="ghost" size="icon" onClick={() => router.push('/people')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <h1 className="text-lg font-semibold">Error</h1>
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6">
        <div className="flex flex-col items-center text-center max-w-md space-y-6">
          <div className="rounded-full bg-muted p-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              Profile Not Found
            </h2>
            <p className="text-muted-foreground">
              This person doesn't exist or their profile isn't available yet.
            </p>
          </div>

          <Button onClick={() => router.push('/people')} size="lg">
            Back to Directory
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  )
}
```

---

### Empty State Components

When sections have no data in read-only mode:

```tsx
// Example: YMRolesSection with no roles
{roles.length === 0 && !isEditable && (
  <div className="flex flex-col items-center justify-center py-8 text-center">
    <UserX className="h-10 w-10 text-muted-foreground/50 mb-3" />
    <p className="text-sm text-muted-foreground">No roles added yet</p>
  </div>
)}
```

**Icons per section:**
- Roles: `UserX`
- Projects: `Briefcase`
- Education: `GraduationCap`
- Skills: `Lightbulb`

---

## Testing Checklist

- [ ] Navigate to profile from directory card
- [ ] Back button preserves filters
- [ ] All sections render correctly in read-only mode
- [ ] No edit buttons visible
- [ ] Empty states show for missing data
- [ ] Loading skeleton displays while fetching
- [ ] Error page shows for invalid user ID
- [ ] Shareable URLs work (share filtered view link)
- [ ] Browser back/forward navigation works
- [ ] Refresh preserves URL state
- [ ] Mobile responsive layout

---

## Future Enhancements (Out of Scope)

- Field-level privacy controls (user chooses what's visible)
- Direct message / contact button on profile
- "Report profile" for moderation
- Profile activity history (recent role changes, etc.)
- Profile completeness indicator
- Export profile to PDF
- Large avatar / cover photo option

---

## Success Criteria

✅ Users can click any person card and view their full profile
✅ Profile view matches the familiar layout of "My Profile"
✅ No edit controls visible (read-only enforced)
✅ Back navigation preserves directory filters
✅ Filtered views are shareable via URL
✅ Empty sections handled gracefully
✅ Fast loading with skeleton feedback
✅ Clear error recovery path

---

**Design Status:** ✅ Complete - Ready for Implementation Plan
