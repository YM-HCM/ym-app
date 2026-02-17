-- Migration: Repair schema damage from failed migration push
-- The first db push attempt ran 00001 (DROP old tables + enums) successfully,
-- but 00003 (CREATE tables) failed at "users already exists". This left:
--   - regions, subregions, neighbor_nets tables DROPPED
--   - role_types.category, role_types.scope_type columns DROPPED (enum CASCADE)
--   - memberships.status column DROPPED (enum CASCADE)
--   - FK constraints and RLS policies on those tables GONE
-- =====================================

-- ============================================
-- 1. RECREATE DROPPED TABLES
-- ============================================

-- Regions
CREATE TABLE IF NOT EXISTS regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Subregions
CREATE TABLE IF NOT EXISTS subregions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_subregions_region ON subregions(region_id);

-- NeighborNets
CREATE TABLE IF NOT EXISTS neighbor_nets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subregion_id UUID NOT NULL REFERENCES subregions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_neighbor_nets_subregion ON neighbor_nets(subregion_id);

-- ============================================
-- 2. RE-ADD DROPPED COLUMNS
-- ============================================

-- role_types: re-add category and scope_type columns
ALTER TABLE role_types ADD COLUMN IF NOT EXISTS category role_category;
ALTER TABLE role_types ADD COLUMN IF NOT EXISTS scope_type scope_type;

-- memberships: re-add status column
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS status membership_status DEFAULT 'active' NOT NULL;

-- ============================================
-- 3. POPULATE role_types COLUMNS FROM CODE
-- ============================================

UPDATE role_types SET
  category = CASE code
    WHEN 'nc'               THEN 'ns'::role_category
    WHEN 'ns_sg'            THEN 'ns'::role_category
    WHEN 'cabinet_chair'    THEN 'ns'::role_category
    WHEN 'council_coord'    THEN 'ns'::role_category
    WHEN 'nat_cloud_rep'    THEN 'ns'::role_category
    WHEN 'ns_member'        THEN 'ns'::role_category
    WHEN 'rc'               THEN 'council'::role_category
    WHEN 'reg_cloud_rep'    THEN 'regional'::role_category
    WHEN 'reg_special_proj' THEN 'regional'::role_category
    WHEN 'src'              THEN 'subregional'::role_category
    WHEN 'sr_sg'            THEN 'subregional'::role_category
    WHEN 'nnc'              THEN 'neighbor_net'::role_category
    WHEN 'ct_member'        THEN 'neighbor_net'::role_category
    WHEN 'cloud_coord'      THEN 'cloud'::role_category
    WHEN 'cloud_member'     THEN 'cloud'::role_category
    WHEN 'cabinet_sg'       THEN 'cabinet'::role_category
    WHEN 'dept_head'        THEN 'cabinet'::role_category
    WHEN 'team_lead'        THEN 'cabinet'::role_category
    WHEN 'team_member'      THEN 'cabinet'::role_category
  END,
  scope_type = CASE code
    WHEN 'nc'               THEN 'national'::scope_type
    WHEN 'ns_sg'            THEN 'national'::scope_type
    WHEN 'cabinet_chair'    THEN 'national'::scope_type
    WHEN 'council_coord'    THEN 'national'::scope_type
    WHEN 'nat_cloud_rep'    THEN 'national'::scope_type
    WHEN 'ns_member'        THEN 'national'::scope_type
    WHEN 'rc'               THEN 'region'::scope_type
    WHEN 'reg_cloud_rep'    THEN 'region'::scope_type
    WHEN 'reg_special_proj' THEN 'region'::scope_type
    WHEN 'src'              THEN 'subregion'::scope_type
    WHEN 'sr_sg'            THEN 'subregion'::scope_type
    WHEN 'nnc'              THEN 'neighbor_net'::scope_type
    WHEN 'ct_member'        THEN 'neighbor_net'::scope_type
    WHEN 'cloud_coord'      THEN 'subregion'::scope_type
    WHEN 'cloud_member'     THEN 'subregion'::scope_type
    WHEN 'cabinet_sg'       THEN 'national'::scope_type
    WHEN 'dept_head'        THEN 'department'::scope_type
    WHEN 'team_lead'        THEN 'team'::scope_type
    WHEN 'team_member'      THEN 'team'::scope_type
  END
WHERE category IS NULL OR scope_type IS NULL;

-- Make columns NOT NULL now that data is populated
ALTER TABLE role_types ALTER COLUMN category SET NOT NULL;
ALTER TABLE role_types ALTER COLUMN scope_type SET NOT NULL;

-- ============================================
-- 4. CLEAR ORPHANED MEMBERSHIP REFERENCES
-- Must run BEFORE adding FK constraints.
-- Existing memberships point to neighbor_net_ids that no longer exist.
-- Null them out so users can re-select during onboarding/profile edit.
-- ============================================

-- Drop the CHECK constraint first (it requires one of neighbor_net_id or region_id to be set)
ALTER TABLE memberships DROP CONSTRAINT IF EXISTS membership_location;

-- Null out dangling references
UPDATE memberships SET neighbor_net_id = NULL
WHERE neighbor_net_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM neighbor_nets WHERE id = memberships.neighbor_net_id);

UPDATE memberships SET region_id = NULL
WHERE region_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM regions WHERE id = memberships.region_id);

-- Re-add the CHECK constraint (relaxed to allow both NULL during repair)
ALTER TABLE memberships ADD CONSTRAINT membership_location CHECK (
  (neighbor_net_id IS NOT NULL AND region_id IS NULL) OR
  (neighbor_net_id IS NULL AND region_id IS NOT NULL) OR
  (neighbor_net_id IS NULL AND region_id IS NULL)
);

-- ============================================
-- 5. RE-ADD FK CONSTRAINTS ON MEMBERSHIPS
-- ============================================

-- Only add if not already present (safe for idempotency)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'memberships_neighbor_net_id_fkey'
  ) THEN
    ALTER TABLE memberships
      ADD CONSTRAINT memberships_neighbor_net_id_fkey
      FOREIGN KEY (neighbor_net_id) REFERENCES neighbor_nets(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'memberships_region_id_fkey'
  ) THEN
    ALTER TABLE memberships
      ADD CONSTRAINT memberships_region_id_fkey
      FOREIGN KEY (region_id) REFERENCES regions(id);
  END IF;
END $$;

-- ============================================
-- 6. RE-SEED GEOGRAPHIC DATA
-- ============================================

INSERT INTO regions (name, code) VALUES ('Texas', 'TX') ON CONFLICT (code) DO NOTHING;

INSERT INTO subregions (region_id, name, code)
SELECT r.id, 'Houston', 'HOU' FROM regions r WHERE r.code = 'TX'
ON CONFLICT (code) DO NOTHING;

INSERT INTO subregions (region_id, name, code)
SELECT r.id, 'Dallas', 'DAL' FROM regions r WHERE r.code = 'TX'
ON CONFLICT (code) DO NOTHING;

INSERT INTO neighbor_nets (subregion_id, name)
SELECT s.id, 'Katy NN' FROM subregions s WHERE s.code = 'HOU'
  AND NOT EXISTS (SELECT 1 FROM neighbor_nets n WHERE n.name = 'Katy NN' AND n.subregion_id = s.id);

INSERT INTO neighbor_nets (subregion_id, name)
SELECT s.id, 'Sugar Land NN' FROM subregions s WHERE s.code = 'HOU'
  AND NOT EXISTS (SELECT 1 FROM neighbor_nets n WHERE n.name = 'Sugar Land NN' AND n.subregion_id = s.id);

INSERT INTO neighbor_nets (subregion_id, name)
SELECT s.id, 'Downtown NN' FROM subregions s WHERE s.code = 'HOU'
  AND NOT EXISTS (SELECT 1 FROM neighbor_nets n WHERE n.name = 'Downtown NN' AND n.subregion_id = s.id);

-- ============================================
-- 7. RE-ADD TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE TRIGGER update_regions_updated_at
  BEFORE UPDATE ON regions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER update_subregions_updated_at
  BEFORE UPDATE ON subregions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER update_neighbor_nets_updated_at
  BEFORE UPDATE ON neighbor_nets FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 8. RE-ADD RLS POLICIES
-- ============================================

ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subregions ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighbor_nets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view regions"
  ON regions FOR SELECT USING (is_authenticated());
CREATE POLICY "Authenticated users can view subregions"
  ON subregions FOR SELECT USING (is_authenticated());
CREATE POLICY "Authenticated users can view neighbor_nets"
  ON neighbor_nets FOR SELECT USING (is_authenticated());
