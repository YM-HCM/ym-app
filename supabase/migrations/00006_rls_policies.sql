-- Migration: Row Level Security (RLS) Policies
-- Controls who can see/modify which rows
-- =============================================

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subregions ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighbor_nets ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER: Check if user is authenticated
-- ============================================

CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS BOOLEAN AS $$
  SELECT auth.uid() IS NOT NULL;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth_id = auth.uid());

-- All authenticated users can view basic info of other users
-- (needed for amir lookups, member directories, etc.)
CREATE POLICY "Authenticated users can view all users"
  ON users FOR SELECT
  USING (is_authenticated());

-- ============================================
-- GEOGRAPHIC TABLES POLICIES
-- Public read access for all authenticated users
-- ============================================

-- Regions
CREATE POLICY "Authenticated users can view regions"
  ON regions FOR SELECT
  USING (is_authenticated());

-- Subregions
CREATE POLICY "Authenticated users can view subregions"
  ON subregions FOR SELECT
  USING (is_authenticated());

-- NeighborNets
CREATE POLICY "Authenticated users can view neighbor_nets"
  ON neighbor_nets FOR SELECT
  USING (is_authenticated());

-- ============================================
-- CABINET STRUCTURE POLICIES
-- Public read access for all authenticated users
-- ============================================

-- Departments
CREATE POLICY "Authenticated users can view departments"
  ON departments FOR SELECT
  USING (is_authenticated());

-- Teams
CREATE POLICY "Authenticated users can view teams"
  ON teams FOR SELECT
  USING (is_authenticated());

-- ============================================
-- ROLE_TYPES POLICIES
-- Public read access (it's reference data)
-- ============================================

CREATE POLICY "Authenticated users can view role_types"
  ON role_types FOR SELECT
  USING (is_authenticated());

-- ============================================
-- MEMBERSHIPS POLICIES
-- ============================================

-- Users can view their own memberships
CREATE POLICY "Users can view own memberships"
  ON memberships FOR SELECT
  USING (user_id = get_current_user_id());

-- Users can insert their own memberships (during onboarding)
CREATE POLICY "Users can insert own memberships"
  ON memberships FOR INSERT
  WITH CHECK (user_id = get_current_user_id());

-- Users can update their own memberships
CREATE POLICY "Users can update own memberships"
  ON memberships FOR UPDATE
  USING (user_id = get_current_user_id());

-- Users can delete their own memberships
CREATE POLICY "Users can delete own memberships"
  ON memberships FOR DELETE
  USING (user_id = get_current_user_id());

-- Authenticated users can view all memberships
-- (needed for org charts, member directories)
CREATE POLICY "Authenticated users can view all memberships"
  ON memberships FOR SELECT
  USING (is_authenticated());

-- ============================================
-- ROLE_ASSIGNMENTS POLICIES
-- ============================================

-- Users can view their own role assignments
CREATE POLICY "Users can view own role_assignments"
  ON role_assignments FOR SELECT
  USING (user_id = get_current_user_id());

-- Users can insert their own role assignments (during onboarding)
CREATE POLICY "Users can insert own role_assignments"
  ON role_assignments FOR INSERT
  WITH CHECK (user_id = get_current_user_id());

-- Users can update their own role assignments
CREATE POLICY "Users can update own role_assignments"
  ON role_assignments FOR UPDATE
  USING (user_id = get_current_user_id());

-- Users can delete their own role assignments
CREATE POLICY "Users can delete own role_assignments"
  ON role_assignments FOR DELETE
  USING (user_id = get_current_user_id());

-- Authenticated users can view all role assignments
-- (needed for org charts, finding NNCs, etc.)
CREATE POLICY "Authenticated users can view all role_assignments"
  ON role_assignments FOR SELECT
  USING (is_authenticated());

-- ============================================
-- USER_PROJECTS POLICIES
-- ============================================

-- Users can view their own projects
CREATE POLICY "Users can view own projects"
  ON user_projects FOR SELECT
  USING (user_id = get_current_user_id());

-- Users can insert their own projects
CREATE POLICY "Users can insert own projects"
  ON user_projects FOR INSERT
  WITH CHECK (user_id = get_current_user_id());

-- Users can update their own projects
CREATE POLICY "Users can update own projects"
  ON user_projects FOR UPDATE
  USING (user_id = get_current_user_id());

-- Users can delete their own projects
CREATE POLICY "Users can delete own projects"
  ON user_projects FOR DELETE
  USING (user_id = get_current_user_id());

-- Authenticated users can view all projects
-- (needed for "who worked on conventions" queries)
CREATE POLICY "Authenticated users can view all projects"
  ON user_projects FOR SELECT
  USING (is_authenticated());

-- ============================================
-- SERVICE ROLE BYPASS
-- For admin operations and server-side functions
-- ============================================

-- Note: The service_role key bypasses RLS by default in Supabase.
-- Server-side operations using the service_role can access all data.
-- This is used for:
-- - Admin dashboards
-- - Bulk data imports
-- - Background jobs
-- - Pre-populating users
