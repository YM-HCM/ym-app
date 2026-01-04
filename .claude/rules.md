# YM App - Claude Code Rules

## Technology Stack
- Next.js 15.5.3 (App Router) + React 19.1.0
- TypeScript 5.x (strict mode)
- Tailwind CSS 3.4.17 + shadcn/ui
- Supabase (Auth + Database)

## Code Style & Conventions

### TypeScript
- Always use TypeScript (no `.js`/`.jsx`)
- Explicit return types for exported functions
- `interface` for objects, `type` for unions/intersections
- Path alias: `@/*` → `./src/*`

### React & Next.js
- Use App Router (`src/app/`)
- Server Components by default, `'use client'` only when needed (hooks, events, browser APIs)
- File conventions: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`
- Props interface above component, use destructuring

### UI Components (shadcn/ui)
- **CHECK SHADCN FIRST**: https://ui.shadcn.com/docs/components
- Install: `npx shadcn@latest add [component]`
- Components go in `src/components/ui/`
- Use `cn()` from `@/lib/utils` for className merging
- Only create custom components if shadcn doesn't have it
- Follow shadcn patterns: variants with `class-variance-authority`, extend HTML element props

### Styling & Design System
- **Tailwind utility classes** (prefer over custom CSS)
- **Design tokens** defined in `tailwind.config.js` and `globals.css`
- Use `cn()` from `@/lib/utils` for conditional/merged classes

#### Color Palette (STRICTLY USE THESE)
Only use the design system colors - NEVER introduce custom colors:
- `bg-background` / `text-foreground` - main background/text
- `bg-primary` / `text-primary-foreground` - buttons, icons, emphasis
- `bg-secondary` / `text-secondary-foreground` - secondary actions
- `bg-muted` / `text-muted-foreground` - subtle backgrounds, helper text
- `bg-accent` / `text-accent-foreground` - hover states
- `bg-destructive` / `text-destructive-foreground` - errors, danger actions
- `bg-card` / `text-card-foreground` - card backgrounds
- `border-border` / `border-input` - borders
- `ring-ring` - focus rings

#### Typography
- **Font**: Geist Sans (loaded in `layout.tsx` via `next/font/google`)
  - CSS variable: `--font-geist-sans`
  - Tailwind class: `font-sans` (configured in `tailwind.config.js`)
- **Monospace**: Geist Mono for code (`font-mono` / `--font-geist-mono`)
- Use Tailwind's type scale: `text-sm`, `text-base`, `text-lg`, `text-xl`, etc.
- Font weights: `font-normal`, `font-medium`, `font-semibold`, `font-bold`
- Letter spacing: `tracking-tight` for headings

#### Spacing & Layout
- Use Tailwind spacing scale (p-4, gap-6, etc.)
- Mobile-first responsive: `sm:`, `md:`, `lg:` breakpoints
- Standard padding: `p-6` for page containers
- Consistent gaps: `gap-2` (tight), `gap-4` (normal), `gap-6` (spacious)

#### Border Radius
- Use design tokens: `rounded-sm`, `rounded-md`, `rounded-lg` (from `--radius`)
- Icons/avatars: `rounded-2xl` or `rounded-full`

#### Animations (keep subtle)
- Transitions: `transition-all duration-300` or `duration-500`
- Hover effects: `hover:scale-[1.02]`, `hover:bg-accent`
- Entry animations: opacity + translate with staggered delays

#### ❌ DO NOT
- Use arbitrary colors (e.g., `bg-amber-500`, `text-orange-600`, `from-rose-50`)
- Add gradient backgrounds unless part of design system
- Override Button styles with custom gradient classes
- Use colors not in the design system palette
- Add decorative patterns or textures
- Import external fonts beyond Geist

### Authentication & Supabase
- Supabase client: `@/lib/supabase`
- Auth context: `@/contexts/AuthContext`
- Middleware handles redirects: `src/middleware.ts`
- Primary auth: Google OAuth
- Always handle loading/error states

### File Organization
```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
│   ├── ui/          # shadcn/ui components
│   └── auth/        # Auth-related components
├── contexts/        # React contexts
├── lib/             # Utility functions and configurations
└── middleware.ts    # Next.js middleware
```

### State Management
- React Context for global state (e.g., AuthContext)
- Server Components + prop drilling for simple state
- Server Actions for mutations

### Error Handling
- try-catch for async operations
- User-friendly error messages
- Display errors with UI components (Alert)

### Environment Variables
- Use `.env.local` (git-ignored)
- `NEXT_PUBLIC_` prefix for client-accessible vars
- Never commit credentials

### Import Conventions
- Absolute imports with `@/*` alias
- Order: React/Next → external libs → internal modules → types

## Git & Commits

### Workflow
- **Branches**: `main` (production) ← `dev` (integration) ← `feature/*`
- Branch from `dev` for new work
- PR flow: feature → dev → main

### Commit Messages
- Brief, single-line descriptions (see git history for style reference)
- Use conventional commits when appropriate: `feat:`, `fix:`, `docs:`, etc.
- **NEVER include Claude as co-author or add AI-generated footers**

### Branch Naming
- `feature/descriptive-name` - new features
- `fix/bug-description` - bug fixes
- `hotfix/urgent-fix` - production hotfixes

## Common Workflows

### Adding UI Components
1. **Check shadcn first**: https://ui.shadcn.com/docs/components
2. Install: `npx shadcn@latest add [component]`
3. Import: `import { Button } from "@/components/ui/button"`
4. Only create custom if shadcn doesn't have it

### Creating Pages
1. Add `page.tsx` in `src/app/[route]/`
2. Use Server Component by default
3. Add metadata: `export const metadata`

### Authentication
- Check auth state via AuthContext
- Middleware handles redirects
- Use Supabase session for protected routes

## Best Practices
- **Performance**: Optimize images, minimize client JS
- **Accessibility**: Semantic HTML, ARIA labels, keyboard nav
- **Security**: Sanitize inputs, validate server-side
- **Mobile-first**: Design for mobile, enhance for desktop
