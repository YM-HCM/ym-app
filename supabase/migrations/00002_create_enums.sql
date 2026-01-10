-- Migration: Create enums
-- These must be created before tables that use them
-- ==================================================

-- Membership status for tracking active/alumni/inactive members
CREATE TYPE membership_status AS ENUM ('active', 'alumni', 'inactive');

-- Role categories for grouping and filtering roles
CREATE TYPE role_category AS ENUM (
  'ns',           -- National Shura (NC, NS SG, Cabinet Chair, Council Coord, Nat'l Cloud Rep)
  'council',      -- The Council (Regional Coordinators)
  'regional',     -- Regional Shura (Cloud Rep, Special Projects)
  'subregional',  -- SR roles (SRC, SR SG)
  'neighbor_net', -- NN roles (NNC, Core Team Member)
  'cabinet',      -- Cabinet roles (Dept Head, Team Lead, Team Member)
  'cloud'         -- Cloud structure (Cloud Coordinator, Cloud Member)
);

-- Scope types determine what entity a role is tied to
CREATE TYPE scope_type AS ENUM (
  'national',     -- No scope_id needed (org-wide roles)
  'region',       -- scope_id → regions.id
  'subregion',    -- scope_id → subregions.id
  'neighbor_net', -- scope_id → neighbor_nets.id
  'department',   -- scope_id → departments.id
  'team'          -- scope_id → teams.id
);
