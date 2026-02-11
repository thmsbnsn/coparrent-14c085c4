-- Cleanup: remove non-functional table created by AI-generated SQL.
-- This table does not create real schedules in Supabase.
DROP TABLE IF EXISTS public.scheduled_http_jobs;
