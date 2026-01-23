-- =====================================================
-- Per-Family Role Authorization - Additional Tables RLS
-- =====================================================

-- Children table
DROP POLICY IF EXISTS "Family members can view children" ON public.children;
DROP POLICY IF EXISTS "Parents can insert children" ON public.children;
DROP POLICY IF EXISTS "Parents can update children" ON public.children;
DROP POLICY IF EXISTS "Parents can delete children" ON public.children;
DROP POLICY IF EXISTS "children_select_policy" ON public.children;
DROP POLICY IF EXISTS "children_insert_policy" ON public.children;
DROP POLICY IF EXISTS "children_update_policy" ON public.children;
DROP POLICY IF EXISTS "children_delete_policy" ON public.children;

CREATE POLICY "children_select_policy"
  ON public.children FOR SELECT
  USING (
    family_id IS NULL
    OR public.can_read_in_family(auth.uid(), family_id)
  );

CREATE POLICY "children_insert_policy"
  ON public.children FOR INSERT
  WITH CHECK (
    family_id IS NULL
    OR public.can_write_in_family(auth.uid(), family_id)
  );

CREATE POLICY "children_update_policy"
  ON public.children FOR UPDATE
  USING (
    family_id IS NULL
    OR public.can_write_in_family(auth.uid(), family_id)
  );

CREATE POLICY "children_delete_policy"
  ON public.children FOR DELETE
  USING (
    family_id IS NULL
    OR public.can_write_in_family(auth.uid(), family_id)
  );

-- Documents table
DROP POLICY IF EXISTS "Family members can view documents" ON public.documents;
DROP POLICY IF EXISTS "Parents can insert documents" ON public.documents;
DROP POLICY IF EXISTS "Parents can update documents" ON public.documents;
DROP POLICY IF EXISTS "Parents can delete documents" ON public.documents;
DROP POLICY IF EXISTS "documents_select_policy" ON public.documents;
DROP POLICY IF EXISTS "documents_insert_policy" ON public.documents;
DROP POLICY IF EXISTS "documents_update_policy" ON public.documents;
DROP POLICY IF EXISTS "documents_delete_policy" ON public.documents;

CREATE POLICY "documents_select_policy"
  ON public.documents FOR SELECT
  USING (
    family_id IS NULL
    OR public.can_read_in_family(auth.uid(), family_id)
  );

CREATE POLICY "documents_insert_policy"
  ON public.documents FOR INSERT
  WITH CHECK (
    family_id IS NULL
    OR public.can_write_in_family(auth.uid(), family_id)
  );

CREATE POLICY "documents_update_policy"
  ON public.documents FOR UPDATE
  USING (
    family_id IS NULL
    OR public.can_write_in_family(auth.uid(), family_id)
  );

CREATE POLICY "documents_delete_policy"
  ON public.documents FOR DELETE
  USING (
    family_id IS NULL
    OR public.can_write_in_family(auth.uid(), family_id)
  );

-- Expenses table
DROP POLICY IF EXISTS "Family members can view expenses" ON public.expenses;
DROP POLICY IF EXISTS "Parents can insert expenses" ON public.expenses;
DROP POLICY IF EXISTS "Parents can update expenses" ON public.expenses;
DROP POLICY IF EXISTS "Parents can delete expenses" ON public.expenses;
DROP POLICY IF EXISTS "expenses_select_policy" ON public.expenses;
DROP POLICY IF EXISTS "expenses_insert_policy" ON public.expenses;
DROP POLICY IF EXISTS "expenses_update_policy" ON public.expenses;
DROP POLICY IF EXISTS "expenses_delete_policy" ON public.expenses;

CREATE POLICY "expenses_select_policy"
  ON public.expenses FOR SELECT
  USING (
    family_id IS NULL
    OR public.can_read_in_family(auth.uid(), family_id)
  );

CREATE POLICY "expenses_insert_policy"
  ON public.expenses FOR INSERT
  WITH CHECK (
    family_id IS NULL
    OR public.can_write_in_family(auth.uid(), family_id)
  );

CREATE POLICY "expenses_update_policy"
  ON public.expenses FOR UPDATE
  USING (
    family_id IS NULL
    OR public.can_write_in_family(auth.uid(), family_id)
  );

CREATE POLICY "expenses_delete_policy"
  ON public.expenses FOR DELETE
  USING (
    family_id IS NULL
    OR public.can_write_in_family(auth.uid(), family_id)
  );

-- Custody schedules
DROP POLICY IF EXISTS "Family members can view schedules" ON public.custody_schedules;
DROP POLICY IF EXISTS "Parents can insert schedules" ON public.custody_schedules;
DROP POLICY IF EXISTS "Parents can update schedules" ON public.custody_schedules;
DROP POLICY IF EXISTS "Parents can delete schedules" ON public.custody_schedules;
DROP POLICY IF EXISTS "custody_schedules_select_policy" ON public.custody_schedules;
DROP POLICY IF EXISTS "custody_schedules_insert_policy" ON public.custody_schedules;
DROP POLICY IF EXISTS "custody_schedules_update_policy" ON public.custody_schedules;
DROP POLICY IF EXISTS "custody_schedules_delete_policy" ON public.custody_schedules;

CREATE POLICY "custody_schedules_select_policy"
  ON public.custody_schedules FOR SELECT
  USING (
    family_id IS NULL
    OR public.can_read_in_family(auth.uid(), family_id)
  );

CREATE POLICY "custody_schedules_insert_policy"
  ON public.custody_schedules FOR INSERT
  WITH CHECK (
    family_id IS NULL
    OR public.can_write_in_family(auth.uid(), family_id)
  );

CREATE POLICY "custody_schedules_update_policy"
  ON public.custody_schedules FOR UPDATE
  USING (
    family_id IS NULL
    OR public.can_write_in_family(auth.uid(), family_id)
  );

CREATE POLICY "custody_schedules_delete_policy"
  ON public.custody_schedules FOR DELETE
  USING (
    family_id IS NULL
    OR public.can_write_in_family(auth.uid(), family_id)
  );

-- Child activities
DROP POLICY IF EXISTS "Family members can view activities" ON public.child_activities;
DROP POLICY IF EXISTS "Parents can insert activities" ON public.child_activities;
DROP POLICY IF EXISTS "Parents can update activities" ON public.child_activities;
DROP POLICY IF EXISTS "Parents can delete activities" ON public.child_activities;
DROP POLICY IF EXISTS "child_activities_select_policy" ON public.child_activities;
DROP POLICY IF EXISTS "child_activities_insert_policy" ON public.child_activities;
DROP POLICY IF EXISTS "child_activities_update_policy" ON public.child_activities;
DROP POLICY IF EXISTS "child_activities_delete_policy" ON public.child_activities;

CREATE POLICY "child_activities_select_policy"
  ON public.child_activities FOR SELECT
  USING (
    family_id IS NULL
    OR public.can_read_in_family(auth.uid(), family_id)
  );

CREATE POLICY "child_activities_insert_policy"
  ON public.child_activities FOR INSERT
  WITH CHECK (
    family_id IS NULL
    OR public.can_write_in_family(auth.uid(), family_id)
  );

CREATE POLICY "child_activities_update_policy"
  ON public.child_activities FOR UPDATE
  USING (
    family_id IS NULL
    OR public.can_write_in_family(auth.uid(), family_id)
  );

CREATE POLICY "child_activities_delete_policy"
  ON public.child_activities FOR DELETE
  USING (
    family_id IS NULL
    OR public.can_write_in_family(auth.uid(), family_id)
  );

-- Gift lists
DROP POLICY IF EXISTS "Family members can view gift lists" ON public.gift_lists;
DROP POLICY IF EXISTS "Parents can insert gift lists" ON public.gift_lists;
DROP POLICY IF EXISTS "Parents can update gift lists" ON public.gift_lists;
DROP POLICY IF EXISTS "Parents can delete gift lists" ON public.gift_lists;
DROP POLICY IF EXISTS "gift_lists_select_policy" ON public.gift_lists;
DROP POLICY IF EXISTS "gift_lists_insert_policy" ON public.gift_lists;
DROP POLICY IF EXISTS "gift_lists_update_policy" ON public.gift_lists;
DROP POLICY IF EXISTS "gift_lists_delete_policy" ON public.gift_lists;

CREATE POLICY "gift_lists_select_policy"
  ON public.gift_lists FOR SELECT
  USING (
    family_id IS NULL
    OR public.can_read_in_family(auth.uid(), family_id)
  );

CREATE POLICY "gift_lists_insert_policy"
  ON public.gift_lists FOR INSERT
  WITH CHECK (
    family_id IS NULL
    OR public.can_write_in_family(auth.uid(), family_id)
  );

CREATE POLICY "gift_lists_update_policy"
  ON public.gift_lists FOR UPDATE
  USING (
    family_id IS NULL
    OR public.can_write_in_family(auth.uid(), family_id)
  );

CREATE POLICY "gift_lists_delete_policy"
  ON public.gift_lists FOR DELETE
  USING (
    family_id IS NULL
    OR public.can_write_in_family(auth.uid(), family_id)
  );