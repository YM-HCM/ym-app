# Docs Page Design

## Overview

A centralized documentation hub for YM's SOPs, guides, and reference documents. The page makes ~90 existing SOPs accessible through an accordion-based browsing interface, organized by category.

## Goals

- **Primary**: Make existing documentation accessible (SOPs are scattered in Google Drive and nobody uses them)
- **Secondary**: Support both quick lookup AND discovery/browsing
- **V1 Scope**: No search - just well-organized accordion browsing

## Page Structure

### Header
- Title: "Docs"
- Subtitle: "SOPs, guides, and reference documents"

### Layout
- Full-width content area with responsive padding
- **Desktop**: Comfortable max-width (~3xl) centered, generous padding
- **Mobile**: Full-width with tighter padding (px-4), no max-width constraint
- Vertically stacked sections with clear visual separation

### Two Main Sections

1. **Resources** (top) - Living reference documents, frequently accessed
   - Flat list (no accordion - small number of items)
   - Items:
     - YM Halaqah Topics List
     - Liability Waiver & Agreement Template

2. **Standard Operating Procedures** (below) - 17 categories from SOP Directory
   - Uses shadcn `Accordion` with `type="multiple"` (allows multiple categories open)
   - Categories display doc count badge

## Component Design

### DocLink Component
Reusable link row for both Resources and SOP items:

```
[FileText icon] [Document Title]                    [ExternalLink icon]
```

- `FileText` icon (h-4 w-4, muted-foreground)
- Title as text (text-sm)
- `ExternalLink` icon (h-3.5 w-3.5, muted-foreground) on right
- Entire row is clickable (`<a>` tag)
- Opens in new tab with `target="_blank" rel="noopener noreferrer"`
- Hover: subtle background highlight (hover:bg-muted)
- Min height 44px for mobile tap targets
- Full-width clickable area

### Accordion Trigger
- Category name (font-medium)
- Doc count badge (muted, right-aligned before chevron) - e.g., "5 docs"
- Uses shadcn Accordion default styling

### Section Headers
- "Resources" and "Standard Operating Procedures" labels
- text-lg font-semibold, with muted description text below
- Spacing: mb-4 for header, space-y-2 for items

## Mobile Considerations

- Accordion triggers: min 44px height for tap targets
- Document links: full-width clickable area
- Responsive padding: px-4 on mobile, px-6+ on desktop
- Consider "back to top" affordance if page gets long (17 categories = lots of scrolling)

## Data Structure

```typescript
type DocLink = {
  title: string
  url: string
}

type DocCategory = {
  name: string
  docs: DocLink[]
}

// Resources - flat list
export const RESOURCES: DocLink[] = [...]

// SOPs - categorized
export const SOP_CATEGORIES: DocCategory[] = [...]
```

Data stored in `src/data/docs.ts` - hardcoded for V1, easy to update manually.

## SOP Categories (17 total)

From the SOP Directory document:

1. Core Team (2 docs)
2. Tarbiyah / SC (2 docs)
3. NNET Situations (6 docs)
4. Design / Merch (17 docs)
5. Conferences (5 docs)
6. Outreach (3 docs)
7. HCM (5 docs)
8. Media (4 docs)
9. Finance (5 docs)
10. ICNA & Alumni (0 docs - empty, skip for now)
11. Subregions (1 doc with link)
12. Cloud (6 docs)
13. Fundraising (10 docs - flattened from sub-folders)
14. Vision / Planning (3 docs)
15. Retreat (7 docs)
16. Muslim Youth Issues (3 docs)
17. IT (5 docs)

**Notes:**
- Items marked "[SOON]" are skipped
- "ICNA & Alumni" is empty - skip this category
- "Masterlist Creation" in Subregions has no link - skip
- Nested items (Fundraising sub-folders) are flattened

## Files to Create/Modify

1. **`src/data/docs.ts`** - Static data with all SOPs + Resources
2. **`src/components/ui/accordion.tsx`** - Add via `npx shadcn@latest add accordion`
3. **`src/components/docs/DocLink.tsx`** - Reusable link component
4. **`src/app/docs/page.tsx`** - Replace placeholder with full implementation

## shadcn Components Used

- `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` (new)
- `Badge` (existing) - for doc count

## Icons (lucide-react)

- `FileText` - document icon in each link row
- `ExternalLink` - indicates opens in new tab

## Future Enhancements (V2+)

- Search bar with title filtering
- Category filter dropdown
- Tags/keywords for better searchability
- Move data to Supabase table
- Track popular documents
- "Recently viewed" section
