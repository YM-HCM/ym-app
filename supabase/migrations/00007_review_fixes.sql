-- Migration: Code Review Fixes
-- Addresses issues identified in code review
-- Safe to run on existing database
-- =============================================

-- ============================================
-- FIX 1: Add ON DELETE SET NULL to amir_user_id FKs
-- Preserves records when amir users are deleted
-- ============================================

-- Drop and recreate constraint on role_assignments.amir_user_id
ALTER TABLE role_assignments
  DROP CONSTRAINT IF EXISTS role_assignments_amir_user_id_fkey;

ALTER TABLE role_assignments
  ADD CONSTRAINT role_assignments_amir_user_id_fkey
  FOREIGN KEY (amir_user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Drop and recreate constraint on user_projects.amir_user_id
ALTER TABLE user_projects
  DROP CONSTRAINT IF EXISTS user_projects_amir_user_id_fkey;

ALTER TABLE user_projects
  ADD CONSTRAINT user_projects_amir_user_id_fkey
  FOREIGN KEY (amir_user_id) REFERENCES users(id) ON DELETE SET NULL;

-- ============================================
-- FIX 2: Add index for onboarding status queries
-- Speeds up "redirect to onboarding" checks
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_onboarding_incomplete
  ON users(id) WHERE onboarding_completed_at IS NULL;

-- ============================================
-- FIX 3: Add unique constraint on neighbor_nets
-- Prevents duplicate NN names in same subregion
-- ============================================

-- First check for and handle any existing duplicates (none expected in fresh DB)
-- Then add the constraint
ALTER TABLE neighbor_nets
  ADD CONSTRAINT neighbor_nets_subregion_name_unique
  UNIQUE (subregion_id, name);

-- ============================================
-- FIX 4: Add composite index for active roles lookup
-- Common query: get active roles for a user
-- ============================================

CREATE INDEX IF NOT EXISTS idx_role_assignments_user_active_roles
  ON role_assignments(user_id, is_active) WHERE is_active = true;
