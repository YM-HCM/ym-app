-- Migration: Reorder and rename role types
-- Adds sort_order column for hierarchy-based dropdown ordering (bottom-up)
-- Renames ambiguous cabinet roles and abbreviations
-- =====================================

-- Add sort_order column
ALTER TABLE role_types ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;

-- Set sort_order (bottom-up hierarchy) and rename 3 roles in one migration
UPDATE role_types SET sort_order = CASE code
  -- NeighborNet (ground level)
  WHEN 'nnc'              THEN 1
  WHEN 'ct_member'        THEN 2
  -- Subregional
  WHEN 'src'              THEN 3
  WHEN 'sr_sg'            THEN 4
  -- Regional
  WHEN 'rc'               THEN 5
  WHEN 'reg_cloud_rep'    THEN 6
  WHEN 'reg_special_proj' THEN 7
  -- Cloud
  WHEN 'cloud_coord'      THEN 8
  WHEN 'cloud_member'     THEN 9
  -- Cabinet
  WHEN 'cabinet_chair'    THEN 10
  WHEN 'cabinet_sg'       THEN 11
  WHEN 'dept_head'        THEN 12
  WHEN 'team_lead'        THEN 13
  WHEN 'team_member'      THEN 14
  -- National Shura
  WHEN 'nc'               THEN 15
  WHEN 'ns_sg'            THEN 16
  WHEN 'council_coord'    THEN 17
  WHEN 'nat_cloud_rep'    THEN 18
  WHEN 'ns_member'        THEN 19
  ELSE 99
END;

-- Renames
UPDATE role_types SET name = 'Cabinet Team Lead' WHERE code = 'team_lead';
UPDATE role_types SET name = 'Cabinet Team Member' WHERE code = 'team_member';
UPDATE role_types SET name = 'Sub-Regional Secretary General' WHERE code = 'sr_sg';
