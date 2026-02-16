# Education Section Alignment

Align the Education section with the established ExpandableCard pattern used by YM Roles and YM Projects. Standardize badge language and read-only field display across all three sections.

## Changes

### Education Section (`EducationSection.tsx`)

**Remove education level dropdown gating.** Education becomes a flat list of expandable cards — no conditional rendering based on education level. The `educationLevel` prop and `onEducationLevelChange` handler are removed from the component interface.

**Collapsed card:**
- Title: School name (fallback: "New Education")
- Subtitle: Degree + Field joined with ` · ` (omit missing parts)
- Badge: `"Current"` when graduation year >= current year or is not set

**Expanded edit mode (own profile):**
- School Name (SearchableCombobox with university list)
- Degree Type (Select dropdown)
- Field of Study (text input)
- Graduation Year (Select dropdown)
- Remove button at bottom

**Expanded read-only (other profiles):**
- Degree: always shown, dash fallback
- Field of Study: always shown, dash fallback
- Graduation Year: always shown, dash fallback

**Empty state:** GraduationCap icon + "No education added yet" (read-only only).

**Add button:** "Add education" (edit mode only).

**Section descriptions:**
- Edit: "Your educational background"
- Read-only: "Educational background"

### YM Projects Badge (`YMProjectsSection.tsx`)

Change badge from `"Active"` to `"Current"` to match YM Roles.

### Education Read-Only Fields

Switch from conditional rendering (hide empty fields) to always-show with dash fallback, matching the pattern used by Roles and Projects for key identifying fields.

## Files to change

1. `src/app/profile/components/EducationSection.tsx` — rewrite to match pattern
2. `src/app/profile/components/YMProjectsSection.tsx` — badge text only
3. Any parent components that pass `educationLevel` / `onEducationLevelChange` to EducationSection — update call sites

## Not in scope

- Onboarding flow (keeps education level question separately)
- Database schema (education stays as JSONB on users table)
- ExpandableCard component itself (no changes needed)
