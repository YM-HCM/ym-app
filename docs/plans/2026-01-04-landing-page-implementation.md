# Landing Page & Navigation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Todoist-style collapsible sidebar navigation with a personal home page experience.

**Architecture:** Use shadcn's built-in Sidebar component which provides collapsible behavior, mobile responsiveness, and state persistence out of the box. Standalone pages (profile, onboarding, login) manage their own layout.

**Tech Stack:** Next.js 15 App Router, React 19, shadcn/ui Sidebar component, Tailwind CSS, Lucide icons

---

## Why shadcn Sidebar?

The shadcn Sidebar component provides everything we need:
- **`SidebarProvider`** — Context for state management with localStorage persistence
- **`SidebarHeader`** — Perfect for the profile dropdown at the top
- **`SidebarFooter`** — Perfect for the feedback button
- **`SidebarMenu/MenuItem/MenuButton`** — Navigation items with proper semantics
- **`collapsible="icon"`** — Collapses to icon-only mode on desktop
- **`useSidebar` hook** — Provides `isMobile`, `toggleSidebar`, `state`, etc.
- **Mobile overlay** — Built-in Sheet-based mobile sidebar

This dramatically simplifies our implementation compared to building from scratch.

---

## Phase 1: Install shadcn Sidebar

### Task 1: Install shadcn Sidebar Component

**Files:**
- Modify: `package.json` (auto-updated)
- Create: `src/components/ui/sidebar.tsx`
- Create: Various dependencies (sheet, tooltip, etc.)

**Step 1: Install the sidebar component**

```bash
npm install @radix-ui/react-dropdown-menu @radix-ui/react-tooltip
npx shadcn@latest add sidebar --yes
```

Note: If npx fails due to package manager detection, manually install dependencies and copy the component.

**Step 2: Verify installation**

```bash
ls src/components/ui/ | grep sidebar
```

Expected: `sidebar.tsx`

**Step 3: Commit**

```bash
git add .
git commit -m "$(cat <<'EOF'
chore: add shadcn sidebar component

Provides collapsible sidebar with built-in mobile support
EOF
)"
```

---

## Phase 2: Create App Sidebar

### Task 2: Create AppSidebar Component

**Files:**
- Create: `src/components/app-sidebar.tsx`

**Step 1: Create the main sidebar component**

```tsx
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  Users,
  DollarSign,
  FileText,
  MessageSquare,
  User,
  LogOut,
  ChevronUp,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/AuthContext'

const NAV_ITEMS = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/people', label: 'People', icon: Users },
  { href: '/finance', label: 'Finance', icon: DollarSign },
  { href: '/docs', label: 'Docs', icon: FileText },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { isMobile, setOpenMobile } = useSidebar()

  // Extract display name from email
  const displayName = user?.email?.split('@')[0]?.split('.')[0] ?? 'User'
  const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1)
  const initials = capitalizedName.charAt(0).toUpperCase()

  const handleNavClick = () => {
    // Close mobile sidebar when navigating
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  const handleViewProfile = () => {
    if (isMobile) setOpenMobile(false)
    router.push('/profile')
  }

  const handleSignOut = async () => {
    if (isMobile) setOpenMobile(false)
    await signOut()
  }

  const handleFeedback = () => {
    // TODO: Implement feedback action
    console.log('Share feedback clicked')
  }

  return (
    <Sidebar collapsible="icon">
      {/* Profile Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    {initials}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{capitalizedName}</span>
                  </div>
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side={isMobile ? 'bottom' : 'right'}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem onClick={handleViewProfile}>
                  <User className="mr-2 h-4 w-4" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    onClick={handleNavClick}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with Feedback */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Share Feedback" onClick={handleFeedback}>
              <MessageSquare />
              <span>Share Feedback</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/app-sidebar.tsx
git commit -m "$(cat <<'EOF'
feat: add AppSidebar using shadcn Sidebar component

- Profile dropdown in header with View Profile / Log out
- Navigation menu with Home, People, Finance, Docs
- Share Feedback button in footer
- Collapsible to icon-only mode on desktop
- Built-in mobile overlay support
EOF
)"
```

---

### Task 3: Create AppShell Layout Component

**Files:**
- Create: `src/components/layout/app-shell.tsx`

**Step 1: Create the layout wrapper**

```tsx
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Mobile header with hamburger */}
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 md:hidden">
          <SidebarTrigger className="-ml-1" />
        </header>
        {/* Main content */}
        <main className="flex-1">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
```

**Step 2: Create barrel export**

Create `src/components/layout/index.ts`:

```typescript
export { AppShell } from './app-shell'
```

**Step 3: Commit**

```bash
git add src/components/layout/
git commit -m "$(cat <<'EOF'
feat: add AppShell layout with SidebarProvider

Wraps pages with sidebar and mobile header trigger
EOF
)"
```

---

## Phase 3: Home Page Content

### Task 4: Create PersonalContextCard Component

**Files:**
- Create: `src/components/home/PersonalContextCard.tsx`

**Step 1: Create the personal context card**

```tsx
import { Card, CardContent } from '@/components/ui/card'

interface PersonalContextCardProps {
  name: string
  roles: string[]
  neighborNetName: string
  subregionName: string
  yearJoined: number
}

export function PersonalContextCard({
  name,
  roles,
  neighborNetName,
  subregionName,
  yearJoined,
}: PersonalContextCardProps) {
  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardContent className="pt-6 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          {name}
        </h2>

        {roles.length > 0 && (
          <p className="mt-1 text-sm font-medium text-primary">
            {roles.join(' · ')}
          </p>
        )}

        <p className="mt-2 text-sm text-muted-foreground">
          {neighborNetName} · {subregionName}
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          Since {yearJoined}
        </p>
      </CardContent>
    </Card>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/home/PersonalContextCard.tsx
git commit -m "$(cat <<'EOF'
feat: add PersonalContextCard component

Displays user identity: name, roles, location, year joined
EOF
)"
```

---

### Task 5: Create QuickActionCard Component

**Files:**
- Create: `src/components/home/QuickActionCard.tsx`

**Step 1: Create the quick action card**

```tsx
import Link from 'next/link'
import { type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface QuickActionCardProps {
  href: string
  icon: LucideIcon
  title: string
  description: string
  className?: string
}

export function QuickActionCard({
  href,
  icon: Icon,
  title,
  description,
  className,
}: QuickActionCardProps) {
  return (
    <Link href={href} className="block group">
      <Card
        className={cn(
          'transition-all duration-200',
          'hover:-translate-y-1 hover:shadow-lg',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          className
        )}
      >
        <CardContent className="pt-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
```

**Step 2: Create barrel export**

Create `src/components/home/index.ts`:

```typescript
export { PersonalContextCard } from './PersonalContextCard'
export { QuickActionCard } from './QuickActionCard'
```

**Step 3: Commit**

```bash
git add src/components/home/
git commit -m "$(cat <<'EOF'
feat: add QuickActionCard and home components barrel export
EOF
)"
```

---

## Phase 4: App Pages

### Task 6: Update Home Page

**Files:**
- Modify: `src/app/home/page.tsx`
- Delete: `src/app/home/SignOutButton.tsx`

**Step 1: Check if SignOutButton is used elsewhere**

```bash
grep -r "SignOutButton" src/
```

**Step 2: Rewrite the home page**

```tsx
import { redirect } from 'next/navigation'
import { Users, DollarSign, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout'
import { PersonalContextCard, QuickActionCard } from '@/components/home'

// Mock data - will be replaced with real data from DB
const MOCK_USER_CONTEXT = {
  name: 'Ahmad Khan',
  roles: ['NNC', 'Katy NN'],
  neighborNetName: 'Katy NN',
  subregionName: 'Houston Subregion',
  yearJoined: 2021,
}

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
              name={MOCK_USER_CONTEXT.name}
              roles={MOCK_USER_CONTEXT.roles}
              neighborNetName={MOCK_USER_CONTEXT.neighborNetName}
              subregionName={MOCK_USER_CONTEXT.subregionName}
              yearJoined={MOCK_USER_CONTEXT.yearJoined}
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

**Step 3: Delete SignOutButton**

```bash
rm src/app/home/SignOutButton.tsx
```

**Step 4: Commit**

```bash
git add src/app/home/
git commit -m "$(cat <<'EOF'
feat: redesign home page with AppShell and personal context

- Wrap in AppShell for sidebar navigation
- Add PersonalContextCard with user identity
- Add QuickActionCards for People, Finance, Docs
- Remove standalone SignOutButton (now in sidebar)
EOF
)"
```

---

### Task 7: Create Placeholder Pages

**Files:**
- Create: `src/app/people/page.tsx`
- Create: `src/app/finance/page.tsx`
- Create: `src/app/docs/page.tsx`

**Step 1: Create People page**

```tsx
import { redirect } from 'next/navigation'
import { Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout'

export default async function PeoplePage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] md:min-h-screen px-4">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">People</h1>
          <p className="text-muted-foreground max-w-md">
            Browse and search YM members. Coming soon.
          </p>
        </div>
      </div>
    </AppShell>
  )
}
```

**Step 2: Create Finance page**

```tsx
import { redirect } from 'next/navigation'
import { DollarSign } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout'

export default async function FinancePage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] md:min-h-screen px-4">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <DollarSign className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Finance</h1>
          <p className="text-muted-foreground max-w-md">
            Reimbursements and financial tools. Coming soon.
          </p>
        </div>
      </div>
    </AppShell>
  )
}
```

**Step 3: Create Docs page**

```tsx
import { redirect } from 'next/navigation'
import { FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout'

export default async function DocsPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] md:min-h-screen px-4">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Docs</h1>
          <p className="text-muted-foreground max-w-md">
            Halaqa topics and SOPs. Coming soon.
          </p>
        </div>
      </div>
    </AppShell>
  )
}
```

**Step 4: Commit**

```bash
git add src/app/people/ src/app/finance/ src/app/docs/
git commit -m "$(cat <<'EOF'
feat: add People, Finance, Docs placeholder pages
EOF
)"
```

---

## Phase 5: Testing

### Task 8: Manual Testing

**Tools:**
- Playwright MCP for automated browser testing
- Chrome DevTools for responsive testing

**Desktop Tests (≥768px):**

- [ ] Navigate to `/home` - sidebar should be expanded by default
- [ ] Click collapse button - sidebar should collapse to icons only
- [ ] Hover collapsed icons - tooltips should appear
- [ ] Refresh page - collapsed state should persist (via cookie)
- [ ] Click profile dropdown - View Profile and Log out options appear
- [ ] Click "View Profile" - navigates to `/profile` (standalone page)
- [ ] Click back arrow on profile - returns to `/home`
- [ ] Click each nav item - navigates correctly, active state updates
- [ ] Hover quick action cards - lift animation works
- [ ] Click quick action cards - navigates to correct page

**Mobile Tests (<768px):**

- [ ] Navigate to `/home` - sidebar hidden, only hamburger in header
- [ ] Click hamburger - sidebar slides in from left with dimmed overlay
- [ ] Tap outside sidebar - closes sidebar
- [ ] Click nav item in sidebar - closes sidebar, navigates
- [ ] Profile dropdown works in mobile sidebar
- [ ] Quick action cards stack vertically
- [ ] Touch targets are at least 44px

**Cross-cutting Tests:**

- [ ] Keyboard navigation (Tab, Enter, Escape) works
- [ ] Escape key closes mobile sidebar
- [ ] No layout shift on page load
- [ ] Smooth transitions between states

**Step 1: Run dev server**

```bash
npm run dev
```

**Step 2: Test in browser**

Use Chrome DevTools device emulation for mobile views.

**Step 3: Fix any issues and commit**

```bash
git add .
git commit -m "fix: address issues found during testing"
```

---

## Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| Phase 1 | 1 | Install shadcn sidebar |
| Phase 2 | 2-3 | Create AppSidebar + AppShell |
| Phase 3 | 4-5 | Home page content components |
| Phase 4 | 6-7 | App pages (home, people, finance, docs) |
| Phase 5 | 8 | Manual testing |

**Total:** 8 tasks (down from 17!)

**Key benefits of using shadcn Sidebar:**
- Built-in mobile/desktop responsive behavior
- State persistence via cookies (works with SSR)
- Tooltips on collapsed icons out of the box
- Proper accessibility (keyboard nav, focus management)
- Consistent with shadcn design system
