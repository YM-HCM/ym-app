# Landing Page & Navigation Design

> **Status:** APPROVED
>
> **Created:** January 4, 2026
>
> **Updated:** January 4, 2026 — Added profile page integration notes
>
> **Context:** Brainstorming session to define the main landing page experience after user login/onboarding.

---

## Overview

This design defines the app shell (navigation) and home page content for authenticated users. The goal is to create a personal, purposeful experience that feels consistent across desktop and mobile.

### Design Principles

1. **"Home as Hub"** — Home is the anchor; sections are destinations you travel to
2. **Personal** — The app should feel like it knows you
3. **Consistent** — Same mental model on desktop and mobile
4. **Built with shadcn/ui** — Leverage existing component library and design tokens

### Existing Patterns to Maintain (from Profile Page)

The `/profile` page establishes several UX patterns we should stay consistent with:

| Pattern | Component | Usage |
|---------|-----------|-------|
| Sticky header | Custom in `profile/page.tsx` | Page-level header with back nav, icon, title |
| Inline editing | `InlineEditField` | Click-to-edit form fields |
| Expandable lists | `ExpandableCard` | Accordion cards for roles/projects/education |
| Floating save | `FloatingSaveBar` | Bottom pill for unsaved changes (reusable) |
| Unsaved changes | `UnsavedChangesModal` | Intercept navigation when dirty |
| Staggered reveal | `animate-in` with delays | Section-by-section entrance animation |

**Key insight:** Profile is a "breakout" page with its own full-screen layout and header. The app shell (sidebar) should NOT wrap the profile page.

---

## Navigation: Todoist-Style Collapsible Sidebar

### Structure

```
┌─────────────────────┐
│ [👤 Ahmad ▾]        │  ← Profile button at top
│                     │
│ ○ Home              │  ← Nav items (with icons)
│ ○ People            │
│ ○ Finance           │
│ ○ Docs              │
│                     │
│                     │
├─────────────────────┤
│ 💬 Share Feedback   │  ← Footer action
└─────────────────────┘
```

### Profile Dropdown

Clicking the profile button opens a dropdown menu:

```
┌─────────────────────┐
│ 👤 View Profile     │
│ ↪ Log out           │
└─────────────────────┘
```

### Responsive Behavior

| Platform | Default State | Toggle Mechanism |
|----------|---------------|------------------|
| Desktop (≥768px) | Expanded | Collapse button (user preference, persisted) |
| Mobile (<768px) | Hidden | Hamburger menu [≡] on left of header |

### Desktop Expanded View

```
┌─────────────────────┬───────────────────────────────────────────────────────┐
│ [👤 Ahmad ▾]        │                                                       │
│                     │                                                       │
│ ○ Home              │                    [Page Content]                     │
│ ○ People            │                                                       │
│ ○ Finance           │                                                       │
│ ○ Docs              │                                                       │
│                     │                                                       │
├─────────────────────┤                                                       │
│ 💬 Share Feedback   │                                                       │
└─────────────────────┴───────────────────────────────────────────────────────┘
```

### Desktop Collapsed View

```
┌─────┬───────────────────────────────────────────────────────────────────────┐
│ [👤]│                                                                       │
│     │                                                                       │
│ 🏠  │                         [Page Content]                                │
│ 👥  │                                                                       │
│ 💰  │                                                                       │
│ 📄  │                                                                       │
│     │                                                                       │
├─────┤                                                                       │
│ 💬  │                                                                       │
└─────┴───────────────────────────────────────────────────────────────────────┘

- Icons only, tooltips on hover
- Profile shows avatar/initials only
```

### Mobile View

**Header (navigation trigger only — no page titles):**
```
┌────────────────────────────┐
│ [≡]                        │  ← Hamburger only, left-aligned
├────────────────────────────┤
│                            │
│       [Page Content]       │
│                            │
└────────────────────────────┘
```

Note: No logo or page title in header. Sidebar active state shows current location. This keeps the header minimal and maximizes content space.

**Sidebar (overlay when open):**
```
┌───────────────┬────────────┐
│ [👤 Ahmad ▾]  │            │
│               │  (dimmed   │
│ ○ Home        │  background│
│ ○ People      │  tap to    │
│ ○ Finance     │  close)    │
│ ○ Docs        │            │
│               │            │
├───────────────┤            │
│ 💬 Feedback   │            │
└───────────────┴────────────┘

- Slides in from left
- Dimmed overlay behind (tap to dismiss)
- Same content as desktop sidebar
```

---

## Home Page Content

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                  ┌─────────────────────────┐                    │
│                  │   Personal Context      │                    │
│                  │   ─────────────────     │                    │
│                  │   Ahmad Khan            │                    │
│                  │   NNC · Katy NN         │                    │
│                  │   Houston Subregion     │                    │
│                  │   Since 2021            │                    │
│                  └─────────────────────────┘                    │
│                                                                 │
│       ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│       │    👥       │ │    💰       │ │    📄       │          │
│       │   People    │ │   Finance   │ │    Docs     │          │
│       │  Browse YM  │ │ Reimburse-  │ │  Halaqa &   │          │
│       │  members    │ │   ments     │ │    SOPs     │          │
│       └─────────────┘ └─────────────┘ └─────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1. Personal Context Card

Displays the user's identity within YM.

**Content:**
- Full name
- Current role(s) — e.g., "NNC", "Core Team Member", "Team Lead (IT)"
- NeighborNet name
- Subregion name
- Year joined leadership (calculated from earliest role start date)

**Component:** shadcn `Card` with custom styling

**Data source:** `users` table + `role_assignments` + `memberships` (once DB is connected)

### 2. Quick Action Cards

Three cards providing shortcuts to main sections.

| Card | Icon | Title | Description | Route |
|------|------|-------|-------------|-------|
| People | Users icon | People | Browse YM members | `/people` |
| Finance | DollarSign icon | Finance | Reimbursements | `/finance` |
| Docs | FileText icon | Docs | Halaqa & SOPs | `/docs` |

**Behavior:**
- Hover: Subtle lift (translate-y), shadow increase, optional icon animation
- Click/tap: Navigate to section
- Keyboard accessible: Focus ring, Enter to activate

**Component:** shadcn `Card` with hover state enhancements

**Layout:**
- Desktop: 3 columns, equal width
- Mobile: Stack vertically, full width

---

## Component Architecture

### New Components to Create

```
src/
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx           # Main layout wrapper
│   │   ├── Sidebar.tsx            # Collapsible sidebar
│   │   ├── SidebarNav.tsx         # Nav items list
│   │   ├── SidebarProfile.tsx     # Profile button + dropdown
│   │   ├── MobileHeader.tsx       # Mobile top bar with hamburger
│   │   └── SidebarProvider.tsx    # Context for sidebar state
│   └── home/
│       ├── PersonalContextCard.tsx
│       └── QuickActionCard.tsx
```

### Existing Components to Use

- `Card`, `CardHeader`, `CardContent` — Base for all cards
- `Button` — Profile button, nav items, feedback button
- `DropdownMenu` — Profile dropdown
- `Dialog` or `Sheet` — Mobile sidebar overlay (Sheet recommended)
- `Tooltip` — Collapsed sidebar icon labels

---

## Routes & Layout Strategy

### Route Structure

| Route | Page | Layout | Description |
|-------|------|--------|-------------|
| `/` | Redirect | — | Redirect to `/login` or `/home` based on auth |
| `/home` | Home | **AppShell** | Landing page (this design) |
| `/people` | People | **AppShell** | Member directory (future) |
| `/finance` | Finance | **AppShell** | Embedded reimbursement form (future) |
| `/docs` | Docs | **AppShell** | Halaqa topics & SOPs (future) |
| `/profile` | Profile | **Standalone** | User profile page ✅ (implemented) |
| `/onboarding` | Onboarding | **Standalone** | Multi-step onboarding flow ✅ (implemented) |
| `/login` | Login | **Standalone** | Authentication page ✅ (implemented) |

### Layout Types

**AppShell (sidebar layout):** Used for main app navigation pages
- Sidebar visible (desktop expanded, mobile hamburger)
- Content area receives the page

**Standalone:** Full-screen pages that manage their own layout
- Profile — has its own sticky header with back navigation
- Onboarding — full-screen multi-step flow
- Login — centered auth card

### Navigation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        AppShell                              │
│  ┌─────────┬─────────────────────────────────────────────┐  │
│  │ Sidebar │                                             │  │
│  │         │   /home    →  Home content                  │  │
│  │ Profile │   /people  →  People directory              │  │
│  │ ────────│   /finance →  Finance page                  │  │
│  │ Home    │   /docs    →  Docs page                     │  │
│  │ People  │                                             │  │
│  │ Finance │                                             │  │
│  │ Docs    │                                             │  │
│  │ ────────│                                             │  │
│  │ Feedback│                                             │  │
│  └─────────┴─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         │
         │ Profile dropdown → "View Profile"
         ▼
┌─────────────────────────────────────────────────────────────┐
│                    /profile (Standalone)                     │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ [←]  👤 My Profile                                      ││
│  │      Manage your personal information                   ││
│  ├─────────────────────────────────────────────────────────┤│
│  │                                                         ││
│  │   Personal Info section                                 ││
│  │   YM Roles section                                      ││
│  │   ...etc                                                ││
│  │                                                         ││
│  │              [Floating Save Bar]                        ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

**Key behavior:** Clicking "View Profile" in sidebar navigates to `/profile`, which is a full-screen breakout page. The back arrow returns to `/home`.

---

## State Management

### Sidebar State

```typescript
interface SidebarState {
  isOpen: boolean;        // Mobile: overlay open/closed
  isCollapsed: boolean;   // Desktop: expanded/collapsed
}
```

- **Mobile:** `isOpen` controls overlay visibility
- **Desktop:** `isCollapsed` controls expanded/collapsed view
- Persist `isCollapsed` preference to localStorage

### User Context

The home page needs user data. Options:
1. **Server component** — Fetch on server, pass as props
2. **Client context** — Create `UserProvider` that fetches and caches user data

Recommendation: Start with server component for Home page, add context later if needed across multiple pages.

---

## Accessibility

- Sidebar nav items are keyboard navigable
- Focus trap when mobile sidebar is open
- Escape key closes mobile sidebar
- Profile dropdown follows WAI-ARIA menu pattern
- Quick action cards have proper focus states
- Reduced motion: Respect `prefers-reduced-motion` for hover animations

---

## Implementation Order

1. **AppShell + Sidebar (Desktop)** — Core layout structure
2. **SidebarProfile + Dropdown** — Profile with View Profile / Logout
3. **MobileHeader + Sheet** — Mobile hamburger and overlay
4. **PersonalContextCard** — Static/mock data first
5. **QuickActionCards** — With hover animations
6. **Testing** — Thorough testing on desktop and mobile views
7. **Connect to real data** — Once DB schema is implemented

---

## Testing Plan

After implementation, thoroughly test on both desktop and mobile views:

### Tools
- **Playwright MCP** — Automated browser testing, take snapshots of key states
- **Chrome DevTools** — Device emulation, responsive testing, network throttling

### Test Scenarios

**Desktop:**
- [ ] Sidebar expanded by default
- [ ] Sidebar collapse/expand toggle works
- [ ] Collapse state persists after page refresh (localStorage)
- [ ] Profile dropdown opens and closes correctly
- [ ] "View Profile" navigates to `/profile`
- [ ] "Log out" signs out user
- [ ] Nav items highlight correctly based on current route
- [ ] Quick action cards hover animations work
- [ ] All nav links route correctly

**Mobile (< 768px):**
- [ ] Sidebar hidden by default
- [ ] Hamburger icon visible in header
- [ ] Hamburger opens sidebar as overlay
- [ ] Dimmed backdrop behind sidebar
- [ ] Tap outside sidebar closes it
- [ ] Profile dropdown works within mobile sidebar
- [ ] Navigation closes sidebar after selecting item
- [ ] Quick action cards stack vertically
- [ ] Touch targets are appropriately sized (min 44px)

**Cross-cutting:**
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus trap in mobile sidebar overlay
- [ ] Escape key closes mobile sidebar
- [ ] No layout shift on page load
- [ ] Smooth transitions between states

---

## Open Items

- [ ] **Share Feedback action** — Decide: external link, in-app modal, or defer
- [ ] **Sidebar collapse persistence** — localStorage key name
- [ ] **Logo asset** — Need YM logo for mobile header and potentially sidebar

---

## Visual Reference

Inspired by Todoist's sidebar pattern:
- Profile at top of sidebar with dropdown
- Clean nav items with icons
- Footer action (Help/Feedback)
- Collapsible on desktop, overlay on mobile

---

## Appendix: Profile Page Implementation Reference

The profile page (`/profile`) is already implemented with these key files:

```
src/app/profile/
├── page.tsx                          # Main profile page
├── hooks/
│   └── useProfileForm.ts             # Form state management with change tracking
└── components/
    ├── PersonalInfoSection.tsx       # Contact details grid
    ├── InlineEditField.tsx           # Click-to-edit field component
    ├── YMRolesSection.tsx            # Expandable role cards
    ├── YMProjectsSection.tsx         # Expandable project cards
    ├── EducationSection.tsx          # Education level + entries
    ├── SkillsChipSelector.tsx        # Multi-select skill badges
    ├── ExpandableCard.tsx            # Reusable accordion card
    ├── SaveButton.tsx                # Wrapper for FloatingSaveBar
    └── UnsavedChangesModal.tsx       # Navigation guard dialog

src/components/ui/
└── floating-save-bar.tsx             # Reusable floating save pill
```

### Key Patterns to Reuse

1. **Staggered animations:** Use `animate-in fade-in slide-in-from-bottom-4` with `animationDelay`
2. **Section structure:** `<section className="space-y-5">` with h2 title + description
3. **Max width container:** `max-w-2xl mx-auto` for content centering
4. **Sticky header pattern:** `sticky top-0 z-40 border-b bg-background/95 backdrop-blur`
