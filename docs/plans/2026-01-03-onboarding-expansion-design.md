# Onboarding Expansion Design

> **Created:** 2026-01-03
> **Status:** Approved — Ready for implementation

---

## Overview

Expand the onboarding flow from 5 placeholder steps to 7 functional steps, collecting comprehensive user profile data.

### Step Summary

| Step | Name | Description |
|------|------|-------------|
| 1 | Personal Info | Phone, email, ethnicity, DOB ✅ (already built) |
| 2 | Location | Subregion & NeighborNet selection |
| 3 | YM Roles | Standard organizational roles held |
| 4 | YM Projects | Project-based work experience |
| 5 | Education | Higher education history |
| 6 | Skills | Select 3-5 from preset list |
| 7 | Complete | Confirmation & save to Supabase |

---

## Data Model

### OnboardingData Interface

```typescript
interface OnboardingData {
  // Step 1: Personal Info (existing)
  phoneNumber?: string
  personalEmail?: string
  ethnicity?: string
  dateOfBirth?: Date

  // Step 2: Location
  subregionId?: string
  neighborNetId?: string

  // Step 3: YM Roles
  ymRoles?: YMRoleEntry[]

  // Step 4: YM Projects
  ymProjects?: YMProjectEntry[]

  // Step 5: Education
  education?: EducationEntry[]

  // Step 6: Skills
  skills?: string[]
}
```

### Entry Types

```typescript
interface YMRoleEntry {
  id: string                    // client-side unique ID for React keys
  roleTypeId?: string           // from role_types table
  roleTypeCustom?: string       // free text if "Add new" selected
  amirUserId?: string           // FK to users.id
  amirCustomName?: string       // free text if amir not in system
  startMonth: number            // 1-12
  startYear: number
  endMonth?: number
  endYear?: number
  isCurrent: boolean
  description?: string
}

interface YMProjectEntry {
  id: string
  projectType?: string          // from hardcoded list
  projectTypeCustom?: string    // if "Add new"
  role?: string                 // free text (project roles vary widely)
  amirUserId?: string
  amirCustomName?: string
  startMonth: number
  startYear: number
  endMonth?: number
  endYear?: number
  isCurrent: boolean
  description?: string
}

interface EducationEntry {
  id: string
  schoolName: string            // from 6K university list or custom
  schoolCustom?: string         // if "Add new"
  degreeType: string            // Associate's, Bachelor's, Master's, PhD, Professional, Other
  fieldOfStudy: string          // free text
  graduationYear: number
}
```

---

## UI Components

### shadcn Components to Install

```bash
npx shadcn@latest add command textarea checkbox badge
```

### Custom Composite Components

| Component | Built On | Purpose |
|-----------|----------|---------|
| `SearchableCombobox` | Command + Popover | Searchable dropdown with "Add new" option |
| `MonthYearPicker` | 2× Select | Month + Year selection |
| `DateRangeInput` | MonthYearPicker × 2 + Checkbox | Start/end date with "current" toggle |

---

## Step Layouts

### Step 2 — Location

- **Subregion**: Standard Select dropdown (from Supabase, placeholder for now)
- **NeighborNet**: Standard Select, disabled until subregion selected, filters by subregion_id

### Step 3 — YM Roles

Repeatable entry form:
- **Role**: SearchableCombobox with role_types from database schema
- **Amir/Manager**: SearchableCombobox from users list (Supabase)
- **Date Range**: MonthYearPicker × 2 with "I currently hold this role" checkbox
- **Description**: Textarea (optional)
- **Add another role**: Button to append new entry

### Step 4 — YM Projects

Repeatable entry form:
- **Project Type**: SearchableCombobox with common types + "Add new"
  - Suggestions: Convention, Retreat, Fundraiser, Workshop, Community Event, etc.
- **Your Role**: Free text Input (project roles vary widely)
- **Amir/Manager**: SearchableCombobox from users list
- **Date Range**: Same as Step 3
- **Description**: Textarea (optional)
- **Add another project**: Button to append new entry

### Step 5 — Education

Repeatable entry form:
- **School Name**: SearchableCombobox backed by 6K US universities JSON + "Add new"
- **Degree Type**: Select with options: Associate's, Bachelor's, Master's, PhD, Professional, Other
- **Field of Study**: Free text Input
- **Graduation Year**: Select with year range (1980–2030)
- **Add another degree**: Button to append new entry

### Step 6 — Skills

- Flex-wrap grid of Badge components (toggle on click)
- Selected: `bg-primary` styling
- Unselected: `bg-secondary` styling
- ~20 preset skills relevant to YM
- Next always enabled (no validation)

### Step 7 — Complete

- Simple confirmation screen
- "Go to Dashboard" button → `/home`
- On completion: save to Supabase, set `onboarding_completed_at`

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/app/onboarding/constants.ts` | Update `ONBOARDING_TOTAL_STEPS` to 7 |
| `src/app/onboarding/page.tsx` | Add cases for steps 6, 7 |
| `src/contexts/OnboardingContext.tsx` | Expand `OnboardingData` interface |
| `src/data/us-universities.json` | Convert CSV → JSON array |
| `src/components/searchable-combobox.tsx` | New component |
| `src/components/month-year-picker.tsx` | New component |
| `src/components/date-range-input.tsx` | New component |
| `src/app/onboarding/step2.tsx` | Location step |
| `src/app/onboarding/step3.tsx` | YM Roles step |
| `src/app/onboarding/step4.tsx` | YM Projects step |
| `src/app/onboarding/step5.tsx` | Education step |
| `src/app/onboarding/step6.tsx` | Skills step |
| `src/app/onboarding/step7.tsx` | Complete step |

---

## Deferred (TODO for Later)

- [ ] Supabase integration for subregions/NeighborNets (Step 2)
- [ ] Supabase integration for user list in Amir dropdowns (Steps 3, 4)
- [ ] Save onboarding data to Supabase on completion (Step 7)
- [ ] Validation rules (which fields are required vs optional)
- [ ] Back button navigation on all steps

---

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Date precision | Month/Year | Standard for work experience, less friction |
| Missing dropdown options | Searchable combobox + "Add new" | Better UX than "Other" + text field |
| Project roles | Free text | Project roles vary too widely to enumerate |
| School list | 6K US universities + "Add new" | Covers most users, fallback for international |
| Skills validation | None (Next always enabled) | Low friction, optional data |

---

## Data Sources

| Data | Source | Notes |
|------|--------|-------|
| Subregions | Supabase `subregions` table | Placeholder hardcoded for now |
| NeighborNets | Supabase `neighbor_nets` table | Filters by subregion_id |
| Role Types | Hardcoded from `role_types` in schema | Based on ym-hierarchy.md |
| Users (Amirs) | Supabase `users` table | Placeholder hardcoded for now |
| Universities | `docs/all-us-universities.csv` | 6,428 US institutions |
| Skills | Hardcoded ~20 options | YM-relevant skills |
