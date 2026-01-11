# YM App - Claude Code Rules

## Technology Stack
- Next.js 15.5.3 (App Router) + React 19.1.0 + TypeScript 5.x
- Tailwind CSS + shadcn/ui
- Supabase (Auth + Database)
- **Bun** for package management

## Code Style

### TypeScript
- Always TypeScript, explicit return types for exports
- `interface` for objects, `type` for unions/intersections
- Path alias: `@/*` → `./src/*`

### React & Next.js
- App Router (`src/app/`), Server Components by default
- `'use client'` only when needed (hooks, events, browser APIs)
- Props interface above component, use destructuring

**useEffect - use primitives to prevent infinite loops:**
```typescript
// ✅ Extract primitive before useEffect
const userId = user?.id
useEffect(() => { fetchData(userId) }, [userId])

// ❌ Object dependency = infinite re-renders
useEffect(() => { fetchData(user?.id) }, [user?.id])
```

### UI Components (shadcn/ui)
- Check shadcn first: https://ui.shadcn.com/docs/components
- Install: `npx shadcn@latest add [component]`
- Import: `import { Button } from "@/components/ui/button"`
- Use `cn()` from `@/lib/utils` for className merging

### Icons
- **lucide-react exclusively** (shadcn standard)
- Import: `import { IconName } from "lucide-react"`
- ❌ NO `@radix-ui/react-icons`, `react-icons`, or other libraries

### Design System
**Colors** - Only use design system tokens:
- `bg-background/foreground`, `bg-primary/primary-foreground`
- `bg-muted/muted-foreground`, `bg-accent/accent-foreground`
- ❌ NEVER use arbitrary colors (`bg-amber-500`, `text-orange-600`)

**Typography**: Geist Sans (`font-sans`), Tailwind scale (`text-sm`, `text-xl`)
**Spacing**: Mobile-first, standard gaps (`gap-2/4/6`), page padding `p-6`
**Testing breakpoints**: 375px, 393px, 430px (iOS), 1280px+ (desktop)

### State Management
- **React Context** - Multi-page state (OnboardingContext)
- **Custom Hooks** - Single-page form state (useProfileForm)
- Server Components + prop drilling for simple state

## Database Patterns

### Safe Update Pattern
```typescript
// ✅ Insert-First-Then-Delete (prevents data loss)
const { data: existing } = await supabase.from('table').select('id').eq('user_id', userId)
const existingIds = existing.map(r => r.id)

const { error } = await supabase.from('table').insert(newRecords)
if (error) return { success: false, error: 'Failed to save' }

if (existingIds.length > 0) {
  await supabase.from('table').delete().in('id', existingIds)
}
```

```typescript
// ❌ NEVER Delete-Then-Insert (data loss if insert fails!)
await supabase.from('table').delete().eq('user_id', userId)
await supabase.from('table').insert(newRecords) // ← Network error = permanent data loss
```

### Query Patterns
```typescript
// ✅ maybeSingle() - Graceful with 0 or >1 results
const { data, error } = await supabase
  .from('memberships')
  .eq('user_id', userId)
  .maybeSingle()

if (error) return { success: false, error: 'Database error' }

// ❌ single() - Throws on 0 or >1 results
const { data } = await supabase.from('memberships').single() // Fails ungracefully
```

### Specific Error Messages
```typescript
// ✅ Return different errors for different failures
async function getUserId(authId: string): Promise<{ id: string | null; error?: string }> {
  const { data, error } = await supabase.from('users').select('id').eq('auth_id', authId).single()

  if (error) {
    if (error.code === 'PGRST116') return { id: null, error: 'User not found' }
    return { id: null, error: 'Database connection error' }
  }
  return { id: data.id }
}

// Usage
const userResult = await getUserId(authId)
if (!userResult.id) return { success: false, error: userResult.error }
```

### Migrations & Race Conditions
**Create migration:** `supabase/migrations/XXXXX_descriptive_name.sql`
**Apply:** `cd supabase && supabase db push`

**Prevent race conditions with unique constraints:**
```sql
CREATE UNIQUE INDEX idx_table_unique
  ON table_name(user_id, field1, field2)
  WHERE condition IS NOT NULL;
```

## Git & Code Review

### Workflow
- **Branches**: `main` ← `dev` ← `feature/*`
- Commit format: `feat:`, `fix:`, `docs:` (conventional commits)
- **NEVER include Claude as co-author**

### Before Merging to Main

**1. Run code review:**
```bash
git merge-base main HEAD  # Get base SHA
git rev-parse HEAD        # Get head SHA
```
Use Skill tool: `subagent_type: superpowers:code-reviewer`
- Fix **Critical** issues (data loss, security, broken functionality)
- Fix **Important** issues (architecture, missing features, error handling)

**2. Verify:**
```bash
npx tsc --noEmit && npm run lint
```

**3. Merge & cleanup:**
```bash
git checkout main && git pull origin main
git merge feature-branch --no-ff -m "Merge: description"
git push origin main
git branch -d feature-branch
git push origin --delete feature-branch
```

### Session Continuity
- **ALWAYS verify current branch** before edits: `git branch --show-current`
- Check uncommitted changes: `git status`

## Error Handling
- All DB functions return `{ success: boolean; error?: string }`
- Check errors at every operation
- Display errors in UI (Alert, Dialog) - never fail silently
- Distinguish "not found" vs "connection error"

## File Organization
```
src/
├── app/              # Next.js pages
├── components/ui/    # shadcn components
├── contexts/         # React contexts
├── lib/supabase/     # DB operations
└── middleware.ts
```

## Testing
- **Test users:** Create via Supabase Dashboard
  - Set `onboarding_completed_at` to access protected routes
- **Browser testing:** Chrome DevTools MCP (primary)

## Best Practices
- Mobile-first responsive design
- Semantic HTML + ARIA labels
- Validate server-side, sanitize inputs
- Optimize images, minimize client JS
