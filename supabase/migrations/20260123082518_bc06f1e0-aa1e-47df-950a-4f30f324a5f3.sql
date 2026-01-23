-- Webhook event idempotency tracking
-- Prevents duplicate processing of Stripe webhook events
CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'processed',
  customer_email TEXT,
  metadata JSONB
);

-- Index for cleanup of old events
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_processed_at 
ON public.stripe_webhook_events(processed_at);

-- Abuse telemetry table for rate limit tracking
CREATE TABLE IF NOT EXISTS public.rate_limit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  ip_hash TEXT,
  endpoint TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  outcome TEXT NOT NULL DEFAULT 'denied',
  limit_type TEXT NOT NULL,
  limit_value INTEGER
);

-- Index for querying recent events
CREATE INDEX IF NOT EXISTS idx_rate_limit_events_created_at 
ON public.rate_limit_events(created_at);

-- Index for user-based queries
CREATE INDEX IF NOT EXISTS idx_rate_limit_events_user_id 
ON public.rate_limit_events(user_id);

-- RLS for rate_limit_events (only service role can insert, no user access)
ALTER TABLE public.rate_limit_events ENABLE ROW LEVEL SECURITY;

-- Only service role can access rate limit events
CREATE POLICY "Service role only for rate limit events"
ON public.rate_limit_events
FOR ALL
USING (false)
WITH CHECK (false);

-- RLS for stripe_webhook_events (only service role)
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only for webhook events"
ON public.stripe_webhook_events
FOR ALL
USING (false)
WITH CHECK (false);

-- Cleanup function for old webhook events (keep 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_webhook_events()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM stripe_webhook_events 
  WHERE processed_at < now() - interval '30 days';
  
  DELETE FROM rate_limit_events
  WHERE created_at < now() - interval '7 days';
END;
$$;