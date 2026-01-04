# YM Database Schema Design

This document defines the database schema for the YM app, designed to support the organizational hierarchy documented in `ym-hierarchy.md`.

> **Status:** DRAFT - Pending review before implementation
>
> **Last Updated:** January 2026
>
> **Related Docs:**
> - [ym-hierarchy.md](./ym-hierarchy.md) - Organizational structure
> - `NS Roles '25-27 | National Shura.md` - NS role details

---

## Context & Decisions Made

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Role history tracking | Nice to have | Added `start_date`/`end_date` but not full audit tables |
| Geographic hierarchy | Strict tree | Region → Subregion → NeighborNet (no exceptions) |
| Cabinet/Cloud geographic home | Yes, always | Everyone has a geographic home regardless of functional role |
| NS member geography | Region level | NS members associated with a Region (not NN) |
| Authentication | GSuite via Supabase Auth | Pre-populate users, link on first login via email match |

### Why Normalized Roles (vs Role-Per-Table)

The previous schema had separate tables for each role (`regional_coordinators`, `sr_coordinators`, etc.). This was problematic because:

1. **Multi-role reality**: NS members hold functional roles (Cabinet Chair, Council Coordinator, etc.)
2. **Query complexity**: "What roles does person X have?" required UNION across 7+ tables
3. **Adding new roles**: Required creating new tables
4. **Inconsistent history**: Only some tables had date fields

The new design uses `role_types` + `role_assignments` to handle all roles uniformly.

---

## Design Principles

1. **Normalized role system** - One `role_assignments` table instead of role-per-table
2. **Multi-role support** - People can hold multiple roles simultaneously
3. **Geographic + Functional separation** - "Where you belong" vs "What you do"
4. **GSuite integration** - Pre-populated users linked on first login
5. **History-ready** - `start_date`/`end_date` on assignments for future auditing
6. **Strict hierarchy** - Region → Subregion → NeighborNet (no exceptions)

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USERS & AUTH                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                           users                                      │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │ -- Identity & Auth                                                   │    │
│  │ id              UUID PRIMARY KEY                                     │    │
│  │ email           TEXT UNIQUE NOT NULL      ◄── GSuite linking key     │    │
│  │ auth_id         UUID UNIQUE → auth.users  ◄── Linked on first login  │    │
│  │ claimed_at      TIMESTAMPTZ               ◄── When first logged in   │    │
│  │                                                                       │    │
│  │ -- Basic Profile (pre-populated or from onboarding)                  │    │
│  │ first_name      TEXT                                                 │    │
│  │ last_name       TEXT                                                 │    │
│  │ phone           TEXT                                                 │    │
│  │ avatar_url      TEXT                                                 │    │
│  │                                                                       │    │
│  │ -- Extended Profile (TBD - from onboarding)                          │    │
│  │ -- See "Open Questions" section for fields to add                    │    │
│  │                                                                       │    │
│  │ -- Metadata                                                           │    │
│  │ onboarding_completed_at  TIMESTAMPTZ      ◄── NULL until complete    │    │
│  │ created_at      TIMESTAMPTZ                                          │    │
│  │ updated_at      TIMESTAMPTZ                                          │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         GEOGRAPHIC HIERARCHY                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────┐                                                 │
│  │        regions         │                                                 │
│  ├────────────────────────┤                                                 │
│  │ id          UUID PK    │                                                 │
│  │ name        TEXT       │  "Texas", "New York", "Southeast"               │
│  │ code        TEXT       │  "TX", "NY", "SE"                               │
│  │ is_active   BOOLEAN    │                                                 │
│  │ created_at  TIMESTAMPTZ│                                                 │
│  │ updated_at  TIMESTAMPTZ│                                                 │
│  └───────────┬────────────┘                                                 │
│              │ 1:N                                                          │
│              ▼                                                              │
│  ┌────────────────────────┐                                                 │
│  │       subregions       │                                                 │
│  ├────────────────────────┤                                                 │
│  │ id          UUID PK    │                                                 │
│  │ region_id   UUID FK    │ → regions                                       │
│  │ name        TEXT       │  "Houston", "Dallas", "NYC East"                │
│  │ code        TEXT       │  "HOU", "DAL", "NYC-E"                          │
│  │ is_active   BOOLEAN    │                                                 │
│  │ created_at  TIMESTAMPTZ│                                                 │
│  │ updated_at  TIMESTAMPTZ│                                                 │
│  └───────────┬────────────┘                                                 │
│              │ 1:N                                                          │
│              ▼                                                              │
│  ┌────────────────────────┐                                                 │
│  │      neighbor_nets     │                                                 │
│  ├────────────────────────┤                                                 │
│  │ id          UUID PK    │                                                 │
│  │ subregion_id UUID FK   │ → subregions                                    │
│  │ name        TEXT       │  "Katy NN", "Sugar Land NN"                     │
│  │ is_active   BOOLEAN    │                                                 │
│  │ created_at  TIMESTAMPTZ│                                                 │
│  │ updated_at  TIMESTAMPTZ│                                                 │
│  └────────────────────────┘                                                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            MEMBERSHIPS                                       │
│                    "Where you BELONG geographically"                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         memberships                                  │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │ id               UUID PRIMARY KEY                                    │    │
│  │ user_id          UUID FK → users                                     │    │
│  │ neighbor_net_id  UUID FK → neighbor_nets  (NULL for NS/alumni)       │    │
│  │ region_id        UUID FK → regions        (for NS members)           │    │
│  │ status           membership_status        (active/alumni/inactive)   │    │
│  │ joined_at        DATE                                                │    │
│  │ left_at          DATE                     (NULL if still active)     │    │
│  │ created_at       TIMESTAMPTZ                                         │    │
│  │ updated_at       TIMESTAMPTZ                                         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  Notes:                                                                      │
│  - Most members: neighbor_net_id is set (their NN home)                     │
│  - NS members: region_id is set (their regional association)               │
│  - Alumni: status='alumni', may have neighbor_net_id or just region_id      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              ROLE SYSTEM                                     │
│                         "What you DO functionally"                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         role_types                                   │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │ id               UUID PRIMARY KEY                                    │    │
│  │ name             TEXT UNIQUE        "National Coordinator", "NNC"    │    │
│  │ code             TEXT UNIQUE        "nc", "nnc", "src"               │    │
│  │ category         role_category      (see enum below)                 │    │
│  │ scope_type       scope_type         (see enum below)                 │    │
│  │ max_per_scope    INTEGER            (NULL = unlimited)               │    │
│  │ description      TEXT                                                │    │
│  │ created_at       TIMESTAMPTZ                                         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                       role_assignments                               │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │ id               UUID PRIMARY KEY                                    │    │
│  │ user_id          UUID FK → users                                     │    │
│  │ role_type_id     UUID FK → role_types                                │    │
│  │ scope_id         UUID               (region/subregion/nn/dept/team)  │    │
│  │ start_date       DATE                                                │    │
│  │ end_date         DATE               (NULL = currently active)        │    │
│  │ is_active        BOOLEAN            (computed or explicit)           │    │
│  │ notes            TEXT               (optional context)               │    │
│  │ created_at       TIMESTAMPTZ                                         │    │
│  │ updated_at       TIMESTAMPTZ                                         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  Note: scope_id references different tables based on role_type.scope_type   │
│  - scope_type='national' → scope_id is NULL                                 │
│  - scope_type='region' → scope_id references regions.id                     │
│  - scope_type='subregion' → scope_id references subregions.id               │
│  - scope_type='neighbor_net' → scope_id references neighbor_nets.id         │
│  - scope_type='department' → scope_id references departments.id             │
│  - scope_type='team' → scope_id references teams.id                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          CABINET STRUCTURE                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────┐      ┌────────────────────────┐                 │
│  │      departments       │      │         teams          │                 │
│  ├────────────────────────┤      ├────────────────────────┤                 │
│  │ id          UUID PK    │      │ id          UUID PK    │                 │
│  │ name        TEXT       │      │ department_id UUID FK  │ → departments   │
│  │ code        TEXT       │      │ name        TEXT       │                 │
│  │ is_active   BOOLEAN    │      │ is_active   BOOLEAN    │                 │
│  │ created_at  TIMESTAMPTZ│      │ created_at  TIMESTAMPTZ│                 │
│  │ updated_at  TIMESTAMPTZ│      │ updated_at  TIMESTAMPTZ│                 │
│  └────────────────────────┘      └────────────────────────┘                 │
│                                                                              │
│  8 Departments: Marketing, Human Resources, Operations, Special Projects,   │
│                 Fundraising, Finance, IT, Societal Impact                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Enums

```sql
-- Membership status
CREATE TYPE membership_status AS ENUM ('active', 'alumni', 'inactive');

-- Role categories (for grouping and filtering)
CREATE TYPE role_category AS ENUM (
  'ns',           -- National Shura roles (NC, NS SG, Cabinet Chair, Council Coord, Nat'l Cloud Rep)
  'council',      -- The Council (Regional Coordinators)
  'regional',     -- Regional Shura roles (Cloud Rep, Special Projects)
  'subregional',  -- SR roles (SRC, SR SG)
  'neighbor_net', -- NN roles (NNC, Core Team Member)
  'cabinet',      -- Cabinet roles (Dept Head, Team Lead, Team Member)
  'cloud'         -- Cloud parallel structure (Cloud Coordinator, Cloud Member)
);

-- Scope types (what entity the role is tied to)
CREATE TYPE scope_type AS ENUM (
  'national',     -- No scope_id needed (org-wide)
  'region',       -- scope_id → regions.id
  'subregion',    -- scope_id → subregions.id
  'neighbor_net', -- scope_id → neighbor_nets.id
  'department',   -- scope_id → departments.id
  'team'          -- scope_id → teams.id
);
```

---

## Role Types (Seed Data)

| name | code | category | scope_type | max_per_scope |
|------|------|----------|------------|---------------|
| National Coordinator | nc | ns | national | 1 |
| NS Secretary General | ns_sg | ns | national | 1 |
| Cabinet Chair | cabinet_chair | ns | national | 1 |
| Council Coordinator | council_coord | ns | national | 1 |
| National Cloud Rep | nat_cloud_rep | ns | national | 1 |
| NS Member | ns_member | ns | national | NULL |
| Regional Coordinator | rc | council | region | 1 |
| Regional Cloud Rep | reg_cloud_rep | regional | region | 1 |
| Regional Special Projects | reg_special_proj | regional | region | 1 |
| Sub-Regional Coordinator | src | subregional | subregion | 1 |
| SR Secretary General | sr_sg | subregional | subregion | 1 |
| NeighborNet Coordinator | nnc | neighbor_net | neighbor_net | 1 |
| Core Team Member | ct_member | neighbor_net | neighbor_net | NULL |
| Member | member | neighbor_net | neighbor_net | NULL |
| Cloud Coordinator | cloud_coord | cloud | subregion | 1 |
| Cloud Member | cloud_member | cloud | subregion | NULL |
| Cabinet Secretary General | cabinet_sg | cabinet | national | 1 |
| Department Head | dept_head | cabinet | department | 1 |
| Team Lead | team_lead | cabinet | team | 1 |
| Team Member | team_member | cabinet | team | NULL |

---

## Example Queries

### Get all roles for a user
```sql
SELECT
  u.first_name,
  u.last_name,
  rt.name AS role,
  rt.category,
  CASE rt.scope_type
    WHEN 'region' THEN r.name
    WHEN 'subregion' THEN sr.name
    WHEN 'neighbor_net' THEN nn.name
    WHEN 'department' THEN d.name
    WHEN 'team' THEN t.name
    ELSE 'National'
  END AS scope_name
FROM role_assignments ra
JOIN users u ON u.id = ra.user_id
JOIN role_types rt ON rt.id = ra.role_type_id
LEFT JOIN regions r ON rt.scope_type = 'region' AND r.id = ra.scope_id
LEFT JOIN subregions sr ON rt.scope_type = 'subregion' AND sr.id = ra.scope_id
LEFT JOIN neighbor_nets nn ON rt.scope_type = 'neighbor_net' AND nn.id = ra.scope_id
LEFT JOIN departments d ON rt.scope_type = 'department' AND d.id = ra.scope_id
LEFT JOIN teams t ON rt.scope_type = 'team' AND t.id = ra.scope_id
WHERE u.id = $user_id AND ra.is_active = true;
```

### Get the NNC of a specific NeighborNet
```sql
SELECT u.*
FROM role_assignments ra
JOIN users u ON u.id = ra.user_id
JOIN role_types rt ON rt.id = ra.role_type_id
WHERE rt.code = 'nnc'
  AND ra.scope_id = $neighbor_net_id
  AND ra.is_active = true;
```

### Get all NS members with their functional roles
```sql
SELECT
  u.first_name,
  u.last_name,
  r.name AS home_region,
  array_agg(rt.name) AS roles
FROM role_assignments ra
JOIN users u ON u.id = ra.user_id
JOIN role_types rt ON rt.id = ra.role_type_id
JOIN memberships m ON m.user_id = u.id
JOIN regions r ON r.id = m.region_id
WHERE rt.category = 'ns' AND ra.is_active = true
GROUP BY u.id, u.first_name, u.last_name, r.name;
```

### Get all members of The Council (all RCs)
```sql
SELECT
  u.first_name,
  u.last_name,
  r.name AS region
FROM role_assignments ra
JOIN users u ON u.id = ra.user_id
JOIN role_types rt ON rt.id = ra.role_type_id
JOIN regions r ON r.id = ra.scope_id
WHERE rt.code = 'rc' AND ra.is_active = true;
```

---

## GSuite Auth Trigger

```sql
-- Trigger that fires when Supabase creates an auth.users record
CREATE OR REPLACE FUNCTION link_auth_to_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Try to link to existing pre-populated user
  UPDATE public.users
  SET auth_id = NEW.id,
      claimed_at = now(),
      updated_at = now()
  WHERE email = NEW.email
    AND auth_id IS NULL;

  -- If no pre-populated user exists, optionally create one
  -- (or reject login - depends on your policy)
  IF NOT FOUND THEN
    -- Option A: Create a new user (open registration)
    -- INSERT INTO public.users (email, auth_id, claimed_at)
    -- VALUES (NEW.email, NEW.id, now());

    -- Option B: Do nothing (only pre-populated users can login)
    NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION link_auth_to_user();
```

---

## Migration from Current Schema

Since the current schema has no data, we can:

1. Drop all existing tables
2. Create new schema from scratch
3. Seed role_types with the defined roles
4. Seed departments and teams

---

## Open Questions

### Organizational Structure

1. **Member vs Core Team Member** - Should regular NN members have a role assignment, or is membership enough?
2. **Alumni tracking** - Alumni are just `membership.status = 'alumni'` with no active role_assignments?
3. **Cloud Member scope** - Currently tied to subregion, but original schema had `department`. Which is correct?

### User Data & Onboarding

4. **Onboarding data** - What additional user fields are collected during onboarding?
   - The old schema had: `pdp_rating`, `skills[]`, `school`, `career_position`, `events`
   - Need to determine: Which are still needed? Any new fields?

5. **Profile completeness** - Should we track onboarding progress (e.g., `onboarding_completed_at`)?

6. **Personal vs Professional info** - Separate tables or all in `users`?

### Authentication & Access

7. **Domain restriction** - Should login be restricted to `@ym.org` GSuite accounts only?

8. **Non-pre-populated users** - What happens if someone with a valid GSuite tries to login but wasn't pre-populated?
   - Option A: Reject them (closed system)
   - Option B: Create a limited account pending admin approval
   - Option C: Allow full access (open system)

9. **Email changes** - What if someone's GSuite email changes? How do we handle re-linking?

### Features (Future Considerations)

10. **Events/Activities** - The old schema had an `events` JSONB column. Will there be an events system?

11. **Supervisor relationships** - Old schema had `supervisor VARCHAR`. Should this be a proper FK to `users.id`?

12. **PDP (Personal Development Plan)** - Old schema had `pdp_rating`. Is this still needed? What does it track?

13. **Skills tracking** - Old schema had `skills[]` array. How is this used?

---

## Fields from Previous Schema (For Reference)

The old `people` table had these fields we haven't addressed yet:

```sql
-- From old schema - need to decide what to keep
pdp_rating integer,        -- Personal Development Plan rating?
supervisor character varying,  -- Should be FK to users.id
skills ARRAY,              -- Text array of skills
school character varying,  -- Educational institution
career_position character varying,  -- Job/career info
events jsonb,              -- Event participation history?
```

**Decision needed:** Which of these belong in the new schema, and in what form?

---

## Future Extensibility Considerations

Areas where the schema should be designed to accommodate growth:

1. **Permissions/RBAC** - Role-based access control based on role_assignments
2. **Notifications** - User notification preferences
3. **Activity/Audit logging** - Track who did what when
4. **Document management** - If the app will store/manage files
5. **Communication** - Messaging between members?
6. **Event management** - If there's an events feature
7. **Reporting/Analytics** - What metrics need to be tracked?

---

## Current Supabase Schema (For Deletion)

These tables exist in the current Supabase instance and should be dropped:

```
- cloud_coordinators
- cloud_members
- core_team_members
- national_shura
- national_shura_coordinator
- neighbor_nets
- people
- regional_coordinators
- regions
- roles
- sr_coordinators
- subregions
```

**Note:** No production data exists in these tables.

---

## Next Steps

1. [ ] Review this schema design
2. [ ] Answer open questions (especially onboarding data)
3. [ ] Finalize user profile fields
4. [ ] Write migration SQL to drop old tables
5. [ ] Write migration SQL to create new tables
6. [ ] Seed role_types with defined roles
7. [ ] Seed departments and teams
8. [ ] Implement GSuite auth trigger
9. [ ] Add RLS (Row Level Security) policies
10. [ ] Create database views for common queries
11. [ ] Generate TypeScript types from schema

---

## Summary: Ready vs. Needs Input

### Ready to Implement ✅

These parts of the schema are fully designed and can be implemented:

| Table/Feature | Status | Notes |
|---------------|--------|-------|
| `regions` | Ready | Simple, well-understood |
| `subregions` | Ready | FK to regions |
| `neighbor_nets` | Ready | FK to subregions |
| `departments` | Ready | 8 known departments |
| `teams` | Ready | FK to departments, known teams |
| `role_types` | Ready | Full list defined, seed data ready |
| `role_assignments` | Ready | Core of the new design |
| `memberships` | Ready | Geographic home tracking |
| Auth trigger | Ready | Link GSuite on first login |

### Needs More Input ⏳

| Table/Feature | Blocker | Questions |
|---------------|---------|-----------|
| `users` extended fields | Onboarding requirements | What data is collected? |
| User profile structure | Feature scope | Separate `user_profiles` table or all in `users`? |
| RLS policies | App architecture | What access patterns does the app need? |
| Supervisor tracking | Feature clarity | Is this used? Should it be FK? |
| Events/Activities | Feature scope | Is there an events system? |
| Skills/PDP | Feature clarity | How are these used? |

### Deferred (Not Blocking) 📋

| Feature | Reason |
|---------|--------|
| Full audit logging | Nice to have, not MVP |
| Notification preferences | Can add table later |
| Document management | Future feature |
| Messaging | Future feature |

---

## Appendix: Conversation Context

This schema was designed through a collaborative conversation. Key points discussed:

1. **Started with** reviewing `ym-hierarchy.md` organizational structure
2. **Clarified** that RCs form "The Council" (not part of NS)
3. **Clarified** NS members hold functional roles (Cabinet Chair, Council Coord, etc.)
4. **Clarified** 3 distinct SG roles: NS SG, Cabinet SG, SR SG
5. **Decided** role history is "nice to have" → `start_date`/`end_date` fields
6. **Decided** strict tree hierarchy (no exceptions)
7. **Decided** everyone has geographic home (NS at region level, others at NN level)
8. **Reviewed** existing Supabase schema → identified role-per-table problem
9. **Designed** normalized role system with `role_types` + `role_assignments`
10. **Designed** GSuite auth flow with pre-populated users

When resuming this work, review:
- This document
- `ym-hierarchy.md` for organizational context
- The "Open Questions" section above
