-- Migration: Drop old tables
-- Run this FIRST to clean up the old schema
-- ============================================

-- Drop old role-per-table structure (no data loss - tables are empty)
DROP TABLE IF EXISTS cloud_coordinators CASCADE;
DROP TABLE IF EXISTS cloud_members CASCADE;
DROP TABLE IF EXISTS core_team_members CASCADE;
DROP TABLE IF EXISTS national_shura CASCADE;
DROP TABLE IF EXISTS national_shura_coordinator CASCADE;
DROP TABLE IF EXISTS regional_coordinators CASCADE;
DROP TABLE IF EXISTS sr_coordinators CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS people CASCADE;

-- Drop old geographic tables (will be recreated with new structure)
DROP TABLE IF EXISTS neighbor_nets CASCADE;
DROP TABLE IF EXISTS subregions CASCADE;
DROP TABLE IF EXISTS regions CASCADE;

-- Drop any old enums that might conflict
DROP TYPE IF EXISTS membership_status CASCADE;
DROP TYPE IF EXISTS role_category CASCADE;
DROP TYPE IF EXISTS scope_type CASCADE;
