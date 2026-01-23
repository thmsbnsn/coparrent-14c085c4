-- =======================
-- CHORE CHART SYSTEM
-- Multi-household, child-scoped, parent-led
-- =======================

-- Chore Lists: One per parent per family
CREATE TABLE public.chore_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  created_by_parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  household TEXT NOT NULL CHECK (household IN ('parent_a', 'parent_b')),
  household_label TEXT, -- "Mom's House", "Dad's House", etc.
  theme_id TEXT DEFAULT 'default',
  color_scheme TEXT DEFAULT 'blue',
  active BOOLEAN NOT NULL DEFAULT true,
  allow_child_completion BOOLEAN NOT NULL DEFAULT true, -- Can children mark their own completions?
  require_parent_confirm BOOLEAN NOT NULL DEFAULT false, -- Require parent confirmation of child completions?
  rewards_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure only one active chore list per parent per family
CREATE UNIQUE INDEX unique_active_chore_list_per_parent 
ON public.chore_lists (family_id, created_by_parent_id) 
WHERE active = true;

-- Index for family queries
CREATE INDEX idx_chore_lists_family ON public.chore_lists (family_id);

-- Chores: Individual tasks within a chore list
CREATE TABLE public.chores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chore_list_id UUID NOT NULL REFERENCES public.chore_lists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  completion_style TEXT NOT NULL DEFAULT 'box' CHECK (completion_style IN ('box', 'circle', 'star', 'heart')),
  order_index INTEGER NOT NULL DEFAULT 0,
  days_active BOOLEAN[] NOT NULL DEFAULT ARRAY[true, true, true, true, true, true, true], -- Mon-Sun
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chores_list ON public.chores (chore_list_id, order_index);

-- Chore Assignments: Link chores to specific children (or all children)
CREATE TABLE public.chore_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chore_id UUID NOT NULL REFERENCES public.chores(id) ON DELETE CASCADE,
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE, -- NULL means "all children"
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique assignment per chore-child pair
CREATE UNIQUE INDEX unique_chore_assignment ON public.chore_assignments (chore_id, COALESCE(child_id, '00000000-0000-0000-0000-000000000000'));

CREATE INDEX idx_chore_assignments_child ON public.chore_assignments (child_id) WHERE child_id IS NOT NULL;

-- Chore Completions: Track when chores are marked complete
CREATE TABLE public.chore_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chore_id UUID NOT NULL REFERENCES public.chores(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  completion_date DATE NOT NULL,
  completed_by_role TEXT NOT NULL CHECK (completed_by_role IN ('parent', 'child')),
  completed_by_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One completion per chore per child per date
CREATE UNIQUE INDEX unique_chore_completion ON public.chore_completions (chore_id, child_id, completion_date);

CREATE INDEX idx_completions_date ON public.chore_completions (completion_date);
CREATE INDEX idx_completions_child ON public.chore_completions (child_id);

-- Chore Rewards: Optional, parent-controlled incentives
CREATE TABLE public.chore_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  household TEXT NOT NULL CHECK (household IN ('parent_a', 'parent_b')),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('allowance', 'privilege', 'experience', 'other')),
  description TEXT NOT NULL,
  criteria TEXT, -- Plain language description
  fulfilled BOOLEAN NOT NULL DEFAULT false,
  fulfilled_at TIMESTAMPTZ,
  fulfilled_by UUID REFERENCES public.profiles(id),
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rewards_family ON public.chore_rewards (family_id, household);
CREATE INDEX idx_rewards_child ON public.chore_rewards (child_id);

-- =======================
-- RLS POLICIES
-- =======================

ALTER TABLE public.chore_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chore_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chore_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chore_rewards ENABLE ROW LEVEL SECURITY;

-- Helper function: Get user's profile ID
CREATE OR REPLACE FUNCTION public.get_my_profile_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Helper function: Check if user is a family member (parent/guardian/third_party)
CREATE OR REPLACE FUNCTION public.is_family_member(p_family_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM family_members 
    WHERE family_id = p_family_id 
    AND user_id = auth.uid() 
    AND status = 'active'
  );
$$;

-- Helper function: Check if user is a parent in family
CREATE OR REPLACE FUNCTION public.is_parent_in_family(p_family_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM family_members 
    WHERE family_id = p_family_id 
    AND user_id = auth.uid() 
    AND status = 'active'
    AND role IN ('parent', 'guardian')
  );
$$;

-- CHORE LISTS POLICIES

-- View: All family members can view chore lists
CREATE POLICY "Family members can view chore lists"
ON public.chore_lists FOR SELECT
USING (public.is_family_member(family_id));

-- Insert: Only parents can create their own chore lists
CREATE POLICY "Parents can create their own chore lists"
ON public.chore_lists FOR INSERT
WITH CHECK (
  public.is_parent_in_family(family_id) 
  AND created_by_parent_id = public.get_my_profile_id()
);

-- Update: Only the owning parent can update their chore list
CREATE POLICY "Parents can update their own chore lists"
ON public.chore_lists FOR UPDATE
USING (created_by_parent_id = public.get_my_profile_id())
WITH CHECK (created_by_parent_id = public.get_my_profile_id());

-- Delete: Only the owning parent can delete their chore list
CREATE POLICY "Parents can delete their own chore lists"
ON public.chore_lists FOR DELETE
USING (created_by_parent_id = public.get_my_profile_id());

-- CHORES POLICIES

-- View: All family members can view chores (via chore_list's family_id)
CREATE POLICY "Family members can view chores"
ON public.chores FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chore_lists cl
    WHERE cl.id = chore_list_id
    AND public.is_family_member(cl.family_id)
  )
);

-- Insert: Only the chore list owner can add chores
CREATE POLICY "Chore list owners can add chores"
ON public.chores FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM chore_lists cl
    WHERE cl.id = chore_list_id
    AND cl.created_by_parent_id = public.get_my_profile_id()
  )
);

-- Update: Only the chore list owner can update chores
CREATE POLICY "Chore list owners can update chores"
ON public.chores FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM chore_lists cl
    WHERE cl.id = chore_list_id
    AND cl.created_by_parent_id = public.get_my_profile_id()
  )
);

-- Delete: Only the chore list owner can delete chores
CREATE POLICY "Chore list owners can delete chores"
ON public.chores FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM chore_lists cl
    WHERE cl.id = chore_list_id
    AND cl.created_by_parent_id = public.get_my_profile_id()
  )
);

-- CHORE ASSIGNMENTS POLICIES

-- View: All family members can view assignments
CREATE POLICY "Family members can view chore assignments"
ON public.chore_assignments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chores c
    JOIN chore_lists cl ON cl.id = c.chore_list_id
    WHERE c.id = chore_id
    AND public.is_family_member(cl.family_id)
  )
);

-- Insert: Only the chore list owner can assign chores
CREATE POLICY "Chore list owners can assign chores"
ON public.chore_assignments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM chores c
    JOIN chore_lists cl ON cl.id = c.chore_list_id
    WHERE c.id = chore_id
    AND cl.created_by_parent_id = public.get_my_profile_id()
  )
);

-- Delete: Only the chore list owner can remove assignments
CREATE POLICY "Chore list owners can remove assignments"
ON public.chore_assignments FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM chores c
    JOIN chore_lists cl ON cl.id = c.chore_list_id
    WHERE c.id = chore_id
    AND cl.created_by_parent_id = public.get_my_profile_id()
  )
);

-- CHORE COMPLETIONS POLICIES

-- View: Family members can view completions for their family
CREATE POLICY "Family members can view chore completions"
ON public.chore_completions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chores c
    JOIN chore_lists cl ON cl.id = c.chore_list_id
    WHERE c.id = chore_id
    AND public.is_family_member(cl.family_id)
  )
);

-- Insert: Parents can mark completions. Children can if allowed.
CREATE POLICY "Authorized users can mark completions"
ON public.chore_completions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM chores c
    JOIN chore_lists cl ON cl.id = c.chore_list_id
    WHERE c.id = chore_id
    AND (
      -- Parents can always mark completions
      cl.created_by_parent_id = public.get_my_profile_id()
      OR public.is_parent_in_family(cl.family_id)
      -- Children can mark if allowed
      OR (cl.allow_child_completion = true AND completed_by_role = 'child')
    )
  )
);

-- Update: Only parents can update (e.g., confirm child completion)
CREATE POLICY "Parents can update completions"
ON public.chore_completions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM chores c
    JOIN chore_lists cl ON cl.id = c.chore_list_id
    WHERE c.id = chore_id
    AND public.is_parent_in_family(cl.family_id)
  )
);

-- CHORE REWARDS POLICIES

-- View: Family members can view rewards
CREATE POLICY "Family members can view rewards"
ON public.chore_rewards FOR SELECT
USING (public.is_family_member(family_id));

-- Insert: Only parents for their own household
CREATE POLICY "Parents can create rewards for their household"
ON public.chore_rewards FOR INSERT
WITH CHECK (
  public.is_parent_in_family(family_id)
  AND created_by = public.get_my_profile_id()
);

-- Update: Only the creating parent
CREATE POLICY "Parents can update their rewards"
ON public.chore_rewards FOR UPDATE
USING (created_by = public.get_my_profile_id())
WITH CHECK (created_by = public.get_my_profile_id());

-- Delete: Only the creating parent
CREATE POLICY "Parents can delete their rewards"
ON public.chore_rewards FOR DELETE
USING (created_by = public.get_my_profile_id());

-- =======================
-- TRIGGERS
-- =======================

-- Auto-deactivate previous chore list when new one is created
CREATE OR REPLACE FUNCTION public.handle_chore_list_activation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When a new list is activated, deactivate others from same parent in same family
  IF NEW.active = true THEN
    UPDATE chore_lists
    SET active = false, updated_at = now()
    WHERE family_id = NEW.family_id
    AND created_by_parent_id = NEW.created_by_parent_id
    AND id != NEW.id
    AND active = true;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER chore_list_activation_trigger
AFTER INSERT OR UPDATE OF active ON public.chore_lists
FOR EACH ROW
EXECUTE FUNCTION public.handle_chore_list_activation();

-- Update timestamps
CREATE TRIGGER update_chore_lists_updated_at
BEFORE UPDATE ON public.chore_lists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chores_updated_at
BEFORE UPDATE ON public.chores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chore_rewards_updated_at
BEFORE UPDATE ON public.chore_rewards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for completions (for live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.chore_completions;