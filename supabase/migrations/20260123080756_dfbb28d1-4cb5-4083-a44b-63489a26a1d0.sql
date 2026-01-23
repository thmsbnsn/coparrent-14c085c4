-- ===========================================
-- MIGRATION BACKFILL: Create families and assign family_id
-- Simplified approach - run as single transaction
-- ===========================================

-- Step 1: Create families for co-parent pairs
WITH parent_pairs AS (
  SELECT DISTINCT
    LEAST(p.id, p.co_parent_id) as parent_a,
    GREATEST(p.id, p.co_parent_id) as parent_b,
    (SELECT user_id FROM profiles WHERE id = LEAST(p.id, p.co_parent_id)) as creator_user_id
  FROM profiles p
  WHERE p.co_parent_id IS NOT NULL
),
new_families AS (
  INSERT INTO families (created_by_user_id, display_name)
  SELECT pp.creator_user_id, NULL
  FROM parent_pairs pp
  WHERE NOT EXISTS (
    SELECT 1 FROM family_members fm 
    WHERE fm.profile_id = pp.parent_a AND fm.family_id IS NOT NULL
  )
  RETURNING id, created_by_user_id
)
-- Add parent_a to family
INSERT INTO family_members (user_id, profile_id, family_id, primary_parent_id, role, status)
SELECT 
  p.user_id,
  p.id,
  nf.id,
  p.id,
  'parent',
  'active'
FROM new_families nf
JOIN profiles p ON p.user_id = nf.created_by_user_id
ON CONFLICT (user_id, primary_parent_id) DO UPDATE SET family_id = EXCLUDED.family_id;

-- Step 2: Add co-parents to their families
INSERT INTO family_members (user_id, profile_id, family_id, primary_parent_id, role, status)
SELECT 
  p2.user_id,
  p2.id,
  fm.family_id,
  fm.primary_parent_id,
  'parent',
  'active'
FROM profiles p
JOIN profiles p2 ON p2.id = p.co_parent_id
JOIN family_members fm ON fm.profile_id = p.id AND fm.family_id IS NOT NULL
WHERE NOT EXISTS (
  SELECT 1 FROM family_members fm2 
  WHERE fm2.profile_id = p2.id AND fm2.family_id IS NOT NULL
)
ON CONFLICT (user_id, primary_parent_id) DO UPDATE SET family_id = EXCLUDED.family_id;

-- Step 3: Create families for solo parents
WITH solo_parents AS (
  SELECT p.id, p.user_id
  FROM profiles p
  WHERE p.co_parent_id IS NULL
  AND (p.account_role IS NULL OR p.account_role != 'child')
  AND NOT EXISTS (
    SELECT 1 FROM family_members fm WHERE fm.profile_id = p.id AND fm.family_id IS NOT NULL
  )
),
solo_families AS (
  INSERT INTO families (created_by_user_id, display_name)
  SELECT sp.user_id, NULL
  FROM solo_parents sp
  RETURNING id, created_by_user_id
)
INSERT INTO family_members (user_id, profile_id, family_id, primary_parent_id, role, status)
SELECT 
  sf.created_by_user_id,
  p.id,
  sf.id,
  p.id,
  'parent',
  'active'
FROM solo_families sf
JOIN profiles p ON p.user_id = sf.created_by_user_id
ON CONFLICT (user_id, primary_parent_id) DO UPDATE SET family_id = EXCLUDED.family_id;

-- Step 4: Backfill children with family_id
UPDATE children c
SET family_id = (
  SELECT fm.family_id
  FROM parent_children pc
  JOIN family_members fm ON fm.profile_id = pc.parent_id
  WHERE pc.child_id = c.id
  AND fm.family_id IS NOT NULL
  LIMIT 1
)
WHERE c.family_id IS NULL;

-- Step 5: Backfill custody_schedules
UPDATE custody_schedules cs
SET family_id = (
  SELECT fm.family_id
  FROM family_members fm
  WHERE fm.profile_id = cs.parent_a_id
  AND fm.family_id IS NOT NULL
  LIMIT 1
)
WHERE cs.family_id IS NULL;

-- Step 6: Backfill message_threads
UPDATE message_threads mt
SET family_id = (
  SELECT fm.family_id
  FROM family_members fm
  WHERE fm.profile_id = mt.primary_parent_id
  AND fm.family_id IS NOT NULL
  LIMIT 1
)
WHERE mt.family_id IS NULL;

-- Step 7: Backfill documents
UPDATE documents d
SET family_id = (
  SELECT fm.family_id
  FROM family_members fm
  WHERE fm.profile_id = d.uploaded_by
  AND fm.family_id IS NOT NULL
  LIMIT 1
)
WHERE d.family_id IS NULL;

-- Step 8: Backfill expenses
UPDATE expenses e
SET family_id = (
  SELECT fm.family_id
  FROM family_members fm
  WHERE fm.profile_id = e.created_by
  AND fm.family_id IS NOT NULL
  LIMIT 1
)
WHERE e.family_id IS NULL;

-- Step 9: Backfill child_activities
UPDATE child_activities ca
SET family_id = (
  SELECT fm.family_id
  FROM family_members fm
  WHERE fm.profile_id = ca.primary_parent_id
  AND fm.family_id IS NOT NULL
  LIMIT 1
)
WHERE ca.family_id IS NULL;

-- Step 10: Backfill gift_lists
UPDATE gift_lists gl
SET family_id = (
  SELECT fm.family_id
  FROM family_members fm
  WHERE fm.profile_id = gl.primary_parent_id
  AND fm.family_id IS NOT NULL
  LIMIT 1
)
WHERE gl.family_id IS NULL;

-- Step 11: Backfill invitations
UPDATE invitations i
SET family_id = (
  SELECT fm.family_id
  FROM family_members fm
  WHERE fm.profile_id = i.inviter_id
  AND fm.family_id IS NOT NULL
  LIMIT 1
)
WHERE i.family_id IS NULL;

-- Step 12: Create child calendars
INSERT INTO calendars (family_id, child_id, name, calendar_type, color)
SELECT 
  c.family_id,
  c.id,
  c.name || '''s Calendar',
  'child',
  '#3B82F6'
FROM children c
WHERE c.family_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM calendars cal WHERE cal.child_id = c.id
);

-- Step 13: Create family calendars
INSERT INTO calendars (family_id, child_id, name, calendar_type, color)
SELECT 
  f.id,
  NULL::uuid,
  'Family Calendar',
  'family',
  '#6B7280'
FROM families f
WHERE NOT EXISTS (
  SELECT 1 FROM calendars cal WHERE cal.family_id = f.id AND cal.calendar_type = 'family'
);