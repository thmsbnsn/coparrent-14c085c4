-- ===========================================
-- MULTI-FAMILY ISOLATION ENFORCEMENT
-- Creates families table and adds family_id to all scoped tables
-- ===========================================

-- 1) Create families table (the container for co-parenting relationships)
CREATE TABLE public.families (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT, -- Optional neutral name like "Family A" or custom
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on families
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;

-- 2) Add family_id to family_members table (update existing structure)
ALTER TABLE public.family_members 
ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES public.families(id) ON DELETE CASCADE;

-- Create index for family_id lookups
CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON public.family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_family_members_family_user ON public.family_members(family_id, user_id);

-- 3) Add family_id to children table
ALTER TABLE public.children 
ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES public.families(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_children_family_id ON public.children(family_id);

-- 4) Add family_id to custody_schedules table
ALTER TABLE public.custody_schedules 
ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES public.families(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_custody_schedules_family_id ON public.custody_schedules(family_id);

-- 5) Add family_id to messages table (legacy)
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES public.families(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_messages_family_id ON public.messages(family_id);

-- 6) Add family_id to message_threads table
ALTER TABLE public.message_threads 
ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES public.families(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_message_threads_family_id ON public.message_threads(family_id);

-- 7) Add family_id to documents table
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES public.families(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_documents_family_id ON public.documents(family_id);

-- 8) Add family_id to expenses table
ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES public.families(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_expenses_family_id ON public.expenses(family_id);

-- 9) Add family_id to schedule_requests table
ALTER TABLE public.schedule_requests 
ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES public.families(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_schedule_requests_family_id ON public.schedule_requests(family_id);

-- 10) Add family_id to child_activities table
ALTER TABLE public.child_activities 
ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES public.families(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_child_activities_family_id ON public.child_activities(family_id);

-- 11) Add family_id to invitations table
ALTER TABLE public.invitations 
ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES public.families(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_invitations_family_id ON public.invitations(family_id);

-- 12) Add family_id to gift_lists table
ALTER TABLE public.gift_lists 
ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES public.families(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_gift_lists_family_id ON public.gift_lists(family_id);

-- 13) Add family_id to audit_logs table (uses actor_user_id, not user_id)
ALTER TABLE public.audit_logs 
ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES public.families(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_audit_logs_family_id ON public.audit_logs(family_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_family_created ON public.audit_logs(family_id, created_at);

-- ===========================================
-- MULTI-CALENDAR SUPPORT
-- ===========================================

-- 14) Create calendars table (per-child or per-family calendars)
CREATE TABLE public.calendars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE, -- NULL for family-wide calendar
  name TEXT NOT NULL,
  calendar_type TEXT NOT NULL DEFAULT 'child' CHECK (calendar_type IN ('child', 'family')),
  color TEXT DEFAULT '#3B82F6', -- For UI differentiation
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Constraint: child calendars must have a child_id
  CONSTRAINT calendar_child_type_check CHECK (
    (calendar_type = 'child' AND child_id IS NOT NULL) OR
    (calendar_type = 'family' AND child_id IS NULL)
  )
);

-- Enable RLS on calendars
ALTER TABLE public.calendars ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_calendars_family_id ON public.calendars(family_id);
CREATE INDEX IF NOT EXISTS idx_calendars_child_id ON public.calendars(child_id);

-- 15) Create calendar_events table
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  calendar_id UUID NOT NULL REFERENCES public.calendars(id) ON DELETE CASCADE,
  child_id UUID REFERENCES public.children(id) ON DELETE SET NULL, -- Redundant for quick filtering
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL DEFAULT 'custody' CHECK (event_type IN ('custody', 'exchange', 'appointment', 'activity', 'other')),
  start_date DATE NOT NULL,
  start_time TIME,
  end_date DATE,
  end_time TIME,
  all_day BOOLEAN NOT NULL DEFAULT true,
  location TEXT,
  custody_parent TEXT CHECK (custody_parent IN ('A', 'B')), -- For custody events
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on calendar_events
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_calendar_events_family_id ON public.calendar_events(family_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_calendar_id ON public.calendar_events(calendar_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_child_id ON public.calendar_events(child_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_date_range ON public.calendar_events(family_id, start_date, end_date);

-- ===========================================
-- HELPER FUNCTIONS FOR FAMILY ACCESS
-- ===========================================

-- 16) Function to check if user is a member of a family
CREATE OR REPLACE FUNCTION public.is_family_member_v2(p_user_id UUID, p_family_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.family_members fm
    WHERE fm.user_id = p_user_id 
    AND fm.family_id = p_family_id
    AND fm.status = 'active'
  );
$$;

-- 17) Function to get all family_ids a user belongs to
CREATE OR REPLACE FUNCTION public.get_user_families(p_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT fm.family_id 
  FROM public.family_members fm
  WHERE fm.user_id = p_user_id 
  AND fm.status = 'active'
  AND fm.family_id IS NOT NULL;
$$;

-- ===========================================
-- RLS POLICIES FOR FAMILIES
-- ===========================================

-- 18) Families table RLS
CREATE POLICY "Users can view families they belong to"
ON public.families FOR SELECT
USING (
  id IN (SELECT get_user_families(auth.uid()))
  OR created_by_user_id = auth.uid()
);

CREATE POLICY "Users can create families"
ON public.families FOR INSERT
WITH CHECK (
  created_by_user_id = auth.uid()
);

CREATE POLICY "Family creators can update their family"
ON public.families FOR UPDATE
USING (
  created_by_user_id = auth.uid()
);

-- ===========================================
-- RLS POLICIES FOR CALENDARS
-- ===========================================

-- 19) Calendars table RLS
CREATE POLICY "Members can view family calendars"
ON public.calendars FOR SELECT
USING (
  family_id IN (SELECT get_user_families(auth.uid()))
);

CREATE POLICY "Parents can create calendars"
ON public.calendars FOR INSERT
WITH CHECK (
  family_id IN (SELECT get_user_families(auth.uid()))
  AND is_parent_or_guardian(auth.uid())
);

CREATE POLICY "Parents can update calendars"
ON public.calendars FOR UPDATE
USING (
  family_id IN (SELECT get_user_families(auth.uid()))
  AND is_parent_or_guardian(auth.uid())
);

CREATE POLICY "Parents can delete calendars"
ON public.calendars FOR DELETE
USING (
  family_id IN (SELECT get_user_families(auth.uid()))
  AND is_parent_or_guardian(auth.uid())
);

-- ===========================================
-- RLS POLICIES FOR CALENDAR_EVENTS
-- ===========================================

-- 20) Calendar events table RLS
CREATE POLICY "Members can view family calendar events"
ON public.calendar_events FOR SELECT
USING (
  family_id IN (SELECT get_user_families(auth.uid()))
);

CREATE POLICY "Parents can create calendar events"
ON public.calendar_events FOR INSERT
WITH CHECK (
  family_id IN (SELECT get_user_families(auth.uid()))
  AND is_parent_or_guardian(auth.uid())
  AND created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Parents can update calendar events"
ON public.calendar_events FOR UPDATE
USING (
  family_id IN (SELECT get_user_families(auth.uid()))
  AND is_parent_or_guardian(auth.uid())
);

CREATE POLICY "Parents can delete calendar events"
ON public.calendar_events FOR DELETE
USING (
  family_id IN (SELECT get_user_families(auth.uid()))
  AND is_parent_or_guardian(auth.uid())
);

-- ===========================================
-- AUDIT LOG RLS UPDATE
-- ===========================================

-- 21) Ensure audit logs use actor_user_id for access
DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.audit_logs;

CREATE POLICY "Users can view audit logs for their families"
ON public.audit_logs FOR SELECT
USING (
  family_id IN (SELECT get_user_families(auth.uid()))
  OR actor_user_id = auth.uid()
);

-- ===========================================
-- TRIGGERS
-- ===========================================

-- 22) Trigger to update updated_at on families
CREATE OR REPLACE FUNCTION public.update_families_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_families_updated_at
BEFORE UPDATE ON public.families
FOR EACH ROW
EXECUTE FUNCTION public.update_families_updated_at();

-- 23) Trigger to update updated_at on calendars
CREATE TRIGGER update_calendars_updated_at
BEFORE UPDATE ON public.calendars
FOR EACH ROW
EXECUTE FUNCTION public.update_families_updated_at();

-- 24) Trigger to update updated_at on calendar_events
CREATE TRIGGER update_calendar_events_updated_at
BEFORE UPDATE ON public.calendar_events
FOR EACH ROW
EXECUTE FUNCTION public.update_families_updated_at();

-- ===========================================
-- ENABLE REALTIME FOR NEW TABLES
-- ===========================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.families;
ALTER PUBLICATION supabase_realtime ADD TABLE public.calendars;
ALTER PUBLICATION supabase_realtime ADD TABLE public.calendar_events;