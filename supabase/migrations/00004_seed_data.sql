-- Migration: Seed data
-- Populate role_types and departments
-- Uses ON CONFLICT DO NOTHING for idempotency
-- =====================================

-- ============================================
-- ROLE TYPES (19 predefined roles)
-- ============================================

INSERT INTO role_types (name, code, category, scope_type, max_per_scope, description) VALUES
  -- National Shura roles
  ('National Coordinator', 'nc', 'ns', 'national', 1, 'Head of the organization'),
  ('NS Secretary General', 'ns_sg', 'ns', 'national', 1, 'National Shura secretary'),
  ('Cabinet Chair', 'cabinet_chair', 'ns', 'national', 1, 'Leads the Cabinet'),
  ('Council Coordinator', 'council_coord', 'ns', 'national', 1, 'Coordinates The Council'),
  ('National Cloud Rep', 'nat_cloud_rep', 'ns', 'national', 1, 'National representative for Cloud'),
  ('NS Member', 'ns_member', 'ns', 'national', NULL, 'Member of National Shura'),

  -- The Council (Regional Coordinators)
  ('Regional Coordinator', 'rc', 'council', 'region', 1, 'Leads a region'),

  -- Regional Shura roles
  ('Regional Cloud Rep', 'reg_cloud_rep', 'regional', 'region', 1, 'Regional Cloud representative'),
  ('Regional Special Projects', 'reg_special_proj', 'regional', 'region', 1, 'Regional special projects lead'),

  -- Subregional roles
  ('Sub-Regional Coordinator', 'src', 'subregional', 'subregion', 1, 'Leads a subregion'),
  ('SR Secretary General', 'sr_sg', 'subregional', 'subregion', 1, 'Subregion secretary'),

  -- NeighborNet roles
  ('NeighborNet Coordinator', 'nnc', 'neighbor_net', 'neighbor_net', 1, 'Leads a NeighborNet'),
  ('Core Team Member', 'ct_member', 'neighbor_net', 'neighbor_net', NULL, 'NN core team member'),

  -- Cloud roles
  ('Cloud Coordinator', 'cloud_coord', 'cloud', 'subregion', 1, 'Leads Cloud in a subregion'),
  ('Cloud Member', 'cloud_member', 'cloud', 'subregion', NULL, 'Cloud program member'),

  -- Cabinet roles
  ('Cabinet Secretary General', 'cabinet_sg', 'cabinet', 'national', 1, 'Cabinet secretary'),
  ('Department Head', 'dept_head', 'cabinet', 'department', 1, 'Leads a department'),
  ('Team Lead', 'team_lead', 'cabinet', 'team', 1, 'Leads a team'),
  ('Team Member', 'team_member', 'cabinet', 'team', NULL, 'Team member')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- DEPARTMENTS (8 Cabinet departments)
-- ============================================

INSERT INTO departments (name, code) VALUES
  ('Marketing', 'marketing'),
  ('Human Resources', 'hr'),
  ('Operations', 'operations'),
  ('Special Projects', 'special_projects'),
  ('Fundraising', 'fundraising'),
  ('Finance', 'finance'),
  ('IT', 'it'),
  ('Societal Impact', 'societal_impact')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- SAMPLE GEOGRAPHIC DATA
-- You can replace this with real data
-- ============================================

-- Sample region
INSERT INTO regions (name, code) VALUES
  ('Texas', 'TX')
ON CONFLICT (code) DO NOTHING;

-- Sample subregions under Texas
INSERT INTO subregions (region_id, name, code)
SELECT r.id, 'Houston', 'HOU'
FROM regions r WHERE r.code = 'TX'
ON CONFLICT (code) DO NOTHING;

INSERT INTO subregions (region_id, name, code)
SELECT r.id, 'Dallas', 'DAL'
FROM regions r WHERE r.code = 'TX'
ON CONFLICT (code) DO NOTHING;

-- Sample NeighborNets under Houston
-- Using a CTE to avoid duplicates (no unique constraint on name)
INSERT INTO neighbor_nets (subregion_id, name)
SELECT s.id, 'Katy NN'
FROM subregions s
WHERE s.code = 'HOU'
  AND NOT EXISTS (SELECT 1 FROM neighbor_nets n WHERE n.name = 'Katy NN' AND n.subregion_id = s.id);

INSERT INTO neighbor_nets (subregion_id, name)
SELECT s.id, 'Sugar Land NN'
FROM subregions s
WHERE s.code = 'HOU'
  AND NOT EXISTS (SELECT 1 FROM neighbor_nets n WHERE n.name = 'Sugar Land NN' AND n.subregion_id = s.id);

INSERT INTO neighbor_nets (subregion_id, name)
SELECT s.id, 'Downtown NN'
FROM subregions s
WHERE s.code = 'HOU'
  AND NOT EXISTS (SELECT 1 FROM neighbor_nets n WHERE n.name = 'Downtown NN' AND n.subregion_id = s.id);
