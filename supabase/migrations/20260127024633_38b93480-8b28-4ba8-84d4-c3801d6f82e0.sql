-- Backfill: Ensure existing co-parent pairs have family_members entries with shared family_id
-- This fixes any existing users who accepted invitations before this fix

DO $$
DECLARE
  v_pair RECORD;
  v_family_id uuid;
BEGIN
  -- Find all co-parent pairs where at least one is missing family_members entry
  FOR v_pair IN
    SELECT 
      p1.id as parent1_id,
      p1.user_id as parent1_user_id,
      p1.full_name as parent1_name,
      p2.id as parent2_id,
      p2.user_id as parent2_user_id,
      p2.full_name as parent2_name
    FROM profiles p1
    JOIN profiles p2 ON p1.co_parent_id = p2.id AND p2.co_parent_id = p1.id
    WHERE p1.id < p2.id  -- Only process each pair once
    AND (
      -- Either parent is missing a family_members entry
      NOT EXISTS (
        SELECT 1 FROM family_members fm 
        WHERE fm.profile_id = p1.id AND fm.status = 'active' AND fm.role IN ('parent', 'guardian')
      )
      OR NOT EXISTS (
        SELECT 1 FROM family_members fm 
        WHERE fm.profile_id = p2.id AND fm.status = 'active' AND fm.role IN ('parent', 'guardian')
      )
    )
  LOOP
    -- Check if either parent already has a family
    SELECT family_id INTO v_family_id
    FROM family_members
    WHERE profile_id IN (v_pair.parent1_id, v_pair.parent2_id)
    AND status = 'active'
    AND role IN ('parent', 'guardian')
    LIMIT 1;
    
    -- If no family exists, create one
    IF v_family_id IS NULL THEN
      INSERT INTO families (name, created_by_user_id)
      VALUES (
        COALESCE(v_pair.parent1_name, 'Family') || ' Family',
        v_pair.parent1_user_id
      )
      RETURNING id INTO v_family_id;
    END IF;
    
    -- Ensure parent1 is in family_members
    INSERT INTO family_members (user_id, profile_id, family_id, primary_parent_id, role, status)
    VALUES (v_pair.parent1_user_id, v_pair.parent1_id, v_family_id, v_pair.parent1_id, 'parent', 'active')
    ON CONFLICT (user_id, family_id) DO UPDATE SET status = 'active', role = 'parent';
    
    -- Ensure parent2 is in family_members with SAME family_id
    INSERT INTO family_members (user_id, profile_id, family_id, primary_parent_id, role, status)
    VALUES (v_pair.parent2_user_id, v_pair.parent2_id, v_family_id, v_pair.parent1_id, 'parent', 'active')
    ON CONFLICT (user_id, family_id) DO UPDATE SET status = 'active', role = 'parent';
    
    RAISE NOTICE 'Fixed co-parent pair: % and % -> family %', v_pair.parent1_name, v_pair.parent2_name, v_family_id;
  END LOOP;
END $$;