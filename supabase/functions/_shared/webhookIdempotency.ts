/**
 * Webhook Idempotency Layer
 * 
 * Ensures Stripe webhook events are processed exactly once.
 * 
 * IDEMPOTENCY INVARIANTS:
 * 1. Event ID is unique - if we've seen it, skip processing
 * 2. Database check is performed BEFORE any mutations
 * 3. Processing status is recorded even on failure (for debugging)
 * 4. Old events are cleaned up periodically
 * 
 * This protects against:
 * - Stripe retry storms
 * - Network timeouts causing duplicates
 * - Race conditions between multiple handlers
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface IdempotencyResult {
  shouldProcess: boolean;
  alreadyProcessed: boolean;
  error?: string;
}

interface ProcessedEvent {
  id: string;
  event_type: string;
  processed_at: string;
  status: string;
  customer_email?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Check if a webhook event has already been processed
 * 
 * @param eventId - Stripe event ID (evt_xxx)
 * @param eventType - Stripe event type (checkout.session.completed, etc.)
 * @param supabaseUrl - Supabase URL
 * @param supabaseServiceKey - Service role key for admin access
 * @returns Whether the event should be processed
 */
export async function checkIdempotency(
  eventId: string,
  eventType: string,
  supabaseUrl: string,
  supabaseServiceKey: string
): Promise<IdempotencyResult> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  });
  
  try {
    // Check if event was already processed
    const { data: existing, error: checkError } = await supabase
      .from("stripe_webhook_events")
      .select("id, status, processed_at")
      .eq("id", eventId)
      .maybeSingle();
    
    if (checkError) {
      // Log but don't fail - we'll process anyway to avoid losing events
      console.error("[Idempotency] Check failed:", checkError.message);
      return { shouldProcess: true, alreadyProcessed: false };
    }
    
    if (existing) {
      console.log(`[Idempotency] Event ${eventId} already processed at ${existing.processed_at}`);
      return { shouldProcess: false, alreadyProcessed: true };
    }
    
    // Reserve this event ID (optimistic locking)
    const { error: insertError } = await supabase
      .from("stripe_webhook_events")
      .insert({
        id: eventId,
        event_type: eventType,
        status: "processing",
        processed_at: new Date().toISOString(),
      });
    
    if (insertError) {
      // If insert fails with unique violation, another process got it first
      if (insertError.code === "23505") {
        console.log(`[Idempotency] Event ${eventId} claimed by another process`);
        return { shouldProcess: false, alreadyProcessed: true };
      }
      
      // Other errors - log but process anyway
      console.error("[Idempotency] Insert failed:", insertError.message);
      return { shouldProcess: true, alreadyProcessed: false };
    }
    
    return { shouldProcess: true, alreadyProcessed: false };
  } catch (error) {
    console.error("[Idempotency] Unexpected error:", error);
    // On unexpected errors, process anyway to avoid losing events
    return { shouldProcess: true, alreadyProcessed: false };
  }
}

/**
 * Mark an event as successfully processed
 */
export async function markEventProcessed(
  eventId: string,
  supabaseUrl: string,
  supabaseServiceKey: string,
  metadata?: {
    customerEmail?: string;
    outcome?: string;
    details?: Record<string, unknown>;
  }
): Promise<void> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  });
  
  try {
    await supabase
      .from("stripe_webhook_events")
      .update({
        status: "processed",
        customer_email: metadata?.customerEmail,
        metadata: metadata?.details ? metadata.details : undefined,
      })
      .eq("id", eventId);
  } catch (error) {
    // Log but don't throw - event was processed successfully
    console.error("[Idempotency] Failed to mark event processed:", error);
  }
}

/**
 * Mark an event as failed (for debugging/retry logic)
 */
export async function markEventFailed(
  eventId: string,
  supabaseUrl: string,
  supabaseServiceKey: string,
  errorMessage: string
): Promise<void> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  });
  
  try {
    await supabase
      .from("stripe_webhook_events")
      .update({
        status: "failed",
        metadata: { error: errorMessage.slice(0, 500) }, // Truncate for safety
      })
      .eq("id", eventId);
  } catch (error) {
    console.error("[Idempotency] Failed to mark event failed:", error);
  }
}

/**
 * Get recent processed events (for debugging)
 */
export async function getRecentEvents(
  supabaseUrl: string,
  supabaseServiceKey: string,
  limit = 10
): Promise<ProcessedEvent[]> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  });
  
  const { data, error } = await supabase
    .from("stripe_webhook_events")
    .select("*")
    .order("processed_at", { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error("[Idempotency] Failed to fetch recent events:", error);
    return [];
  }
  
  return data || [];
}

/**
 * Cleanup old events (call periodically via cron)
 */
export async function cleanupOldEvents(
  supabaseUrl: string,
  supabaseServiceKey: string
): Promise<number> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  });
  
  try {
    // Call the cleanup function
    const { error } = await supabase.rpc("cleanup_old_webhook_events");
    
    if (error) {
      console.error("[Idempotency] Cleanup failed:", error);
      return 0;
    }
    
    return 1; // Success
  } catch (error) {
    console.error("[Idempotency] Cleanup error:", error);
    return 0;
  }
}
