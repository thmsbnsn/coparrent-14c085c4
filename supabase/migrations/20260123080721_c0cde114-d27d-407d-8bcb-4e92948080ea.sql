-- ===========================================
-- MIGRATION BACKFILL PART 2: Create calendars
-- (Part 1 already ran successfully - families, children, schedules, messages updated)
-- ===========================================

-- 1) Create calendars for each child in their family
INSERT INTO calendars (family_id, child_id, name, calendar_type, color)
SELECT DISTINCT 
  c.family_id,
  c.id,
  c.name || '''s Calendar',
  'child',
  CASE (row_number() OVER (PARTITION BY c.family_id ORDER BY c.created_at)) % 6
    WHEN 0 THEN '#3B82F6' -- blue
    WHEN 1 THEN '#10B981' -- green
    WHEN 2 THEN '#F59E0B' -- amber
    WHEN 3 THEN '#EF4444' -- red
    WHEN 4 THEN '#8B5CF6' -- purple
    WHEN 5 THEN '#EC4899' -- pink
  END
FROM children c
WHERE c.family_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM calendars cal WHERE cal.child_id = c.id
);

-- 2) Create a family-wide calendar for each family
INSERT INTO calendars (family_id, child_id, name, calendar_type, color)
SELECT 
  f.id,
  NULL::uuid,
  'Family Calendar',
  'family',
  '#6B7280' -- gray
FROM families f
WHERE NOT EXISTS (
  SELECT 1 FROM calendars cal WHERE cal.family_id = f.id AND cal.calendar_type = 'family'
);