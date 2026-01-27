# Finance Page Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the Finance page to include all finance resources (contacts, policies, forms, video) organized in collapsible accordion sections matching the Docs page pattern.

**Architecture:** Extract finance page into a client component (`FinanceContent.tsx`) with a data file (`src/data/finance.ts`) driving accordion content. Reuses existing `Accordion`, `Badge`, `DocLink`, and `JotformEmbed` components. The main Jotform is inside an accordion open by default; all other sections are collapsed.

**Tech Stack:** Next.js 15, React, shadcn/ui Accordion, Radix UI, Tailwind CSS, Lucide icons

---

### Task 1: Create the finance data file

**Files:**
- Create: `src/data/finance.ts`

**Step 1: Create `src/data/finance.ts`**

```ts
import {
  DollarSign,
  MessageCircle,
  FileText,
  Video,
  ClipboardList,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type FinanceLink = {
  title: string
  url: string
  description?: string
}

export type FinanceSection = {
  id: string
  name: string
  icon: LucideIcon
  items: FinanceLink[]
}

export const FINANCE_DEPARTMENT = {
  title: 'YM Finance',
  subtitle: 'Office of Finance · Central. Streamlined. Efficient.',
  cfo: 'Shaheer Iqbal (2025–2027)',
  nationalShuraRep: 'Imaad Khan',
}

export const FINANCE_FORM_ID = '233184710128148'

export const FINANCE_SECTIONS: FinanceSection[] = [
  {
    id: 'contact',
    name: 'Contact Finance',
    icon: MessageCircle,
    items: [
      {
        title: 'Message Shaheer on WhatsApp',
        url: 'https://api.whatsapp.com/send/?phone=%2B12017552429&text=Salam%2C%0AI+am+%5BENTER+NAME%5D+from+%5BENTER%5D+asking+about+%5BENTER+BUDGET%5D%0A%0A%5BENTER+QUESTION%5D&type=phone_number&app_absent=0',
        description: 'Primary contact — CFO',
      },
      {
        title: 'Escalation Contact (if no response)',
        url: 'https://api.whatsapp.com/send/?phone=%2B18159191088&text=Salam%2C%0AI+am+%5BENTER+NAME%5D+from+%5BENTER%5D+asking+about+%5BENTER+BUDGET%5D%0A%0A%5BENTER+QUESTION%5D%0A%0AShaheer+did+not+respond...+&type=phone_number&app_absent=0',
        description: 'If Shaheer does not respond',
      },
    ],
  },
  {
    id: 'additional-forms',
    name: 'Additional Forms',
    icon: ClipboardList,
    items: [
      {
        title: 'Forgot an Attachment? Submit here',
        url: 'https://www.jotform.com/app/260205420248143/252798675212063',
      },
      {
        title: 'View My Finance Submissions',
        url: 'https://www.jotform.com/app/260205420248143/page/6',
      },
    ],
  },
  {
    id: 'rules-policies',
    name: 'Rules & Policies',
    icon: FileText,
    items: [
      {
        title: 'Finance Governing Rules',
        url: '/finance_rules.png',
        description: 'Visual overview of payment and transaction rules',
      },
      {
        title: 'Official Spending Policy (January 2026)',
        url: '/official_spending_policy.pdf',
        description: 'Full spending framework approved by National Shura',
      },
    ],
  },
  {
    id: 'town-hall',
    name: 'Finance Town Hall',
    icon: Video,
    items: [
      {
        title: 'Most Recent Finance Town Hall',
        url: 'https://youtu.be/N3oLAz9qgY0?si=Y84ehe45n3Sp2fu8',
        description: 'Latest town hall recording',
      },
    ],
  },
]
```

**Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

**Step 3: Commit**

```bash
git add src/data/finance.ts
git commit -m "feat(finance): add finance page data file"
```

---

### Task 2: Create the FinanceContent client component

**Files:**
- Create: `src/app/finance/FinanceContent.tsx`

**Step 1: Create `src/app/finance/FinanceContent.tsx`**

This mirrors `src/app/docs/DocsContent.tsx` structure exactly:

```tsx
'use client'

import { DollarSign, ExternalLink } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { JotformEmbed } from '@/components/finance/JotformEmbed'
import {
  FINANCE_DEPARTMENT,
  FINANCE_FORM_ID,
  FINANCE_SECTIONS,
} from '@/data/finance'

export function FinanceContent() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] md:min-h-screen px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto max-w-3xl space-y-12">
        {/* Page Header */}
        <div
          className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500"
          style={{ animationDelay: '0ms' }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {FINANCE_DEPARTMENT.title}
              </h1>
              <p className="text-sm text-muted-foreground">
                {FINANCE_DEPARTMENT.subtitle}
              </p>
            </div>
          </div>
          <div className="ml-[52px] text-sm text-muted-foreground space-y-0.5">
            <p>CFO: {FINANCE_DEPARTMENT.cfo}</p>
            <p>National Shura Rep: {FINANCE_DEPARTMENT.nationalShuraRep}</p>
          </div>
        </div>

        {/* Accordion Sections */}
        <div
          className="animate-in fade-in slide-in-from-bottom-4 duration-500"
          style={{ animationDelay: '100ms' }}
        >
          <Accordion
            type="multiple"
            defaultValue={['finance-form']}
            className="w-full"
          >
            {/* Main Finance Request Form */}
            <AccordionItem value="finance-form">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>Finance Requests Form</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-1">
                  <JotformEmbed
                    formId={FINANCE_FORM_ID}
                    title="YM Finance Requests Form"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Dynamic sections from data */}
            {FINANCE_SECTIONS.map((section) => (
              <AccordionItem key={section.id} value={section.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <section.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>{section.name}</span>
                    <Badge variant="secondary" className="text-xs font-normal">
                      {section.items.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-1 pt-1">
                    {section.items.map((item) => (
                      <a
                        key={item.url}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[44px]"
                      >
                        <span className="flex-1">
                          <span className="block">{item.title}</span>
                          {item.description && (
                            <span className="block text-xs text-muted-foreground">
                              {item.description}
                            </span>
                          )}
                        </span>
                        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      </a>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

**Step 3: Commit**

```bash
git add src/app/finance/FinanceContent.tsx
git commit -m "feat(finance): add FinanceContent client component with accordion layout"
```

---

### Task 3: Update the finance page.tsx to use FinanceContent

**Files:**
- Modify: `src/app/finance/page.tsx`

**Step 1: Rewrite `page.tsx` to match Docs page pattern**

```tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout'
import { FinanceContent } from './FinanceContent'

export default async function FinancePage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return (
    <AppShell>
      <FinanceContent />
    </AppShell>
  )
}
```

**Step 2: Verify dev server loads `/finance` without errors**

Run: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/finance`
Expected: `200`

**Step 3: Commit**

```bash
git add src/app/finance/page.tsx
git commit -m "feat(finance): wire up FinanceContent in page, matching Docs pattern"
```

---

### Task 4: Visual verification

**Step 1:** Open `http://localhost:3001/finance` in browser and verify:
- Header shows "YM Finance" with CFO and NSR info
- Finance Requests Form accordion is open by default with Jotform embedded
- Contact Finance, Additional Forms, Rules & Policies, Finance Town Hall are collapsed
- Expanding each section shows the correct links
- Badge counts are accurate
- Styling matches `/docs` page

**Step 2: Commit all if any tweaks were made**

```bash
git add -A
git commit -m "feat(finance): complete finance page redesign with accordion sections"
```
