-- =====================================================
-- Per-Family Role Authorization Model - Complete
-- Role is a property of membership, NOT the user globally
-- =====================================================

-- PART A1: Update member_role enum to support all needed roles
DO $$ BEGIN
  -- Add 'guardian' to the existing enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'guardian' AND enumtypid = 'public.member_role'::regtype) THEN
    ALTER TYPE public.member_role ADD VALUE 'guardian';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'child' AND enumtypid = 'public.member_role'::regtype) THEN
    ALTER TYPE public.member_role ADD VALUE 'child';
  END IF;
END $$;

-- PART A2: Add relationship_label column for UI display (NOT permissions)
ALTER TABLE public.family_members 
  ADD COLUMN IF NOT EXISTS relationship_label TEXT;

COMMENT ON COLUMN public.family_members.relationship_label IS 
  'UI-only display label (step_parent, grandparent, etc). Does NOT control permissions - only role column does.';

-- PART A3: Create helper function to get user role in a specific family
CREATE OR REPLACE FUNCTION public.get_role_in_family(p_user_id UUID, p_family_id UUID)
RETURNS public.member_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_role public.member_role;
  v_profile_id UUID;
BEGIN
  -- Get the user's profile ID
  SELECT id INTO v_profile_id FROM public.profiles WHERE user_id = p_user_id LIMIT 1;
  
  IF v_profile_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Check family_members for explicit role
  SELECT role INTO v_role
  FROM public.family_members
  WHERE profile_id = v_profile_id
    AND family_id = p_family_id
    AND status = 'active'
  LIMIT 1;
  
  -- If found in family_members, return that role
  IF v_role IS NOT NULL THEN
    RETURN v_role;
  END IF;
  
  -- Check if user created this family (they're automatically a parent)
  IF EXISTS (
    SELECT 1 FROM public.families 
    WHERE id = p_family_id AND created_by_user_id = p_user_id
  ) THEN
    RETURN 'parent'::public.member_role;
  END IF;
  
  RETURN NULL;
END;
$$;

-- PART A4: Create boolean helper functions for RLS policies
CREATE OR REPLACE FUNCTION public.is_parent_in_family(p_user_id UUID, p_family_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT public.get_role_in_family(p_user_id, p_family_id) IN ('parent', 'guardian');
$$;

CREATE OR REPLACE FUNCTION public.can_write_in_family(p_user_id UUID, p_family_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  -- Only parent and guardian roles can write
  SELECT public.get_role_in_family(p_user_id, p_family_id) IN ('parent', 'guardian');
$$;

CREATE OR REPLACE FUNCTION public.can_read_in_family(p_user_id UUID, p_family_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  -- Any active member can read
  SELECT public.get_role_in_family(p_user_id, p_family_id) IS NOT NULL;
$$;

-- =====================================================
-- PART A5: Update RLS policies for calendar_events
-- =====================================================

-- Drop ALL existing calendar_events policies
DROP POLICY IF EXISTS "Parents can update calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Parents can insert calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Parents can delete calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Family members can view calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "calendar_events_select_policy" ON public.calendar_events;
DROP POLICY IF EXISTS "calendar_events_insert_policy" ON public.calendar_events;
DROP POLICY IF EXISTS "calendar_events_update_policy" ON public.calendar_events;
DROP POLICY IF EXISTS "calendar_events_delete_policy" ON public.calendar_events;

-- Recreate with role-per-family checks
CREATE POLICY "calendar_events_select_policy"
  ON public.calendar_events FOR SELECT
  USING (public.can_read_in_family(auth.uid(), family_id));

CREATE POLICY "calendar_events_insert_policy"
  ON public.calendar_events FOR INSERT
  WITH CHECK (public.can_write_in_family(auth.uid(), family_id));

CREATE POLICY "calendar_events_update_policy"
  ON public.calendar_events FOR UPDATE
  USING (public.can_write_in_family(auth.uid(), family_id));

CREATE POLICY "calendar_events_delete_policy"
  ON public.calendar_events FOR DELETE
  USING (public.can_write_in_family(auth.uid(), family_id));