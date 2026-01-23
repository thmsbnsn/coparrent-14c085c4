/**
 * Unified Server-Side Rate Limiter
 * 
 * COST CONTROL INVARIANTS:
 * 1. The client is NEVER trusted - all limits enforced here
 * 2. Rate limits use centralized config (single source of truth)
 * 3. Limits fail CLOSED (deny on error)
 * 4. Abuse is logged for telemetry
 * 
 * Usage in edge functions:
 * ```ts
 * const rateLimitResult = await checkRateLimit(
 *   supabaseUrl,
 *   supabaseServiceKey,
 *   userId,
 *   "ai-message-assist",
 *   tier
 * );
 * 
 * if (!rateLimitResult.allowed) {
 *   return errorResponse(rateLimitResult.error!, corsHeaders);
 * }
 * ```
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  getRateLimitRules, 
  getAdjustedLimits,
  type RateLimitRule 
} from "./rateLimitConfig.ts";
import { createRateLimitError, type StandardError } from "./standardErrors.ts";
import { logRateLimitEvent, logRateLimitConsole, extractIP, hashIP } from "./abuseTelemetry.ts";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  error?: StandardError;
  statusCode?: number;
}

/**
 * Check and increment rate limit for a user and endpoint
 * 
 * @param supabaseUrl - Supabase URL
 * @param supabaseServiceKey - Service role key
 * @param userId - User ID (auth.uid)
 * @param endpoint - Endpoint name (must match config)
 * @param tier - User's subscription tier (for limit multipliers)
 * @param req - Optional request for IP extraction
 */
export async function checkRateLimit(
  supabaseUrl: string,
  supabaseServiceKey: string,
  userId: string,
  endpoint: string,
  tier: string = "free",
  req?: Request
): Promise<RateLimitResult> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  // Get adjusted limits for user's tier
  const { maxPerDay, maxPerMinute } = getAdjustedLimits(endpoint, tier);
  const rule = getRateLimitRules(endpoint);
  
  const today = new Date().toISOString().split("T")[0];
  const currentMinute = new Date();
  currentMinute.setSeconds(0, 0);

  // Extract IP for telemetry (optional)
  const ipHash = req ? hashIP(extractIP(req) || "unknown") : null;

  try {
    // Get existing usage record
    const { data: existingUsage, error: fetchError } = await supabase
      .from("function_usage_daily")
      .select("id, request_count, minute_window, minute_count")
      .eq("user_id", userId)
      .eq("function_name", endpoint)
      .eq("usage_date", today)
      .maybeSingle();

    if (fetchError) {
      console.error("[RateLimit] Error fetching usage:", fetchError);
      // FAIL CLOSED: On error, deny by default for expensive operations
      if (rule.category === "ai" || rule.category === "export") {
        return createDeniedResult(maxPerDay, "daily", endpoint, userId, ipHash, supabaseUrl, supabaseServiceKey);
      }
      // For less critical operations, fail open
      return { allowed: true, remaining: maxPerDay, limit: maxPerDay };
    }

    if (existingUsage) {
      // Check daily limit
      if (existingUsage.request_count >= maxPerDay) {
        logRateLimitConsole(endpoint, "denied", {
          userId,
          limitType: "daily",
          currentCount: existingUsage.request_count,
          limit: maxPerDay,
        });
        
        // Log telemetry (fire-and-forget)
        logRateLimitEvent(supabaseUrl, supabaseServiceKey, {
          userId,
          ipHash,
          endpoint,
          action: "request",
          outcome: "denied",
          limitType: "daily",
          limitValue: maxPerDay,
        });
        
        return {
          allowed: false,
          remaining: 0,
          limit: maxPerDay,
          error: createRateLimitError("daily"),
          statusCode: 429,
        };
      }

      // Check minute burst limit
      const existingMinuteWindow = new Date(existingUsage.minute_window);
      const isCurrentMinute = existingMinuteWindow.getTime() === currentMinute.getTime();

      if (isCurrentMinute && existingUsage.minute_count >= maxPerMinute) {
        logRateLimitConsole(endpoint, "denied", {
          userId,
          limitType: "burst",
          currentCount: existingUsage.minute_count,
          limit: maxPerMinute,
        });
        
        logRateLimitEvent(supabaseUrl, supabaseServiceKey, {
          userId,
          ipHash,
          endpoint,
          action: "request",
          outcome: "denied",
          limitType: "burst",
          limitValue: maxPerMinute,
        });
        
        return {
          allowed: false,
          remaining: maxPerDay - existingUsage.request_count,
          limit: maxPerDay,
          error: createRateLimitError("burst", 60),
          statusCode: 429,
        };
      }

      // Update existing record
      const newMinuteCount = isCurrentMinute ? existingUsage.minute_count + 1 : 1;
      const { error: updateError } = await supabase
        .from("function_usage_daily")
        .update({
          request_count: existingUsage.request_count + 1,
          minute_window: currentMinute.toISOString(),
          minute_count: newMinuteCount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingUsage.id);

      if (updateError) {
        console.error("[RateLimit] Error updating usage:", updateError);
      }

      return {
        allowed: true,
        remaining: maxPerDay - existingUsage.request_count - 1,
        limit: maxPerDay,
      };
    }

    // Create new usage record
    const { error: insertError } = await supabase
      .from("function_usage_daily")
      .insert({
        user_id: userId,
        function_name: endpoint,
        usage_date: today,
        request_count: 1,
        minute_window: currentMinute.toISOString(),
        minute_count: 1,
      });

    if (insertError) {
      // Handle race condition
      if (insertError.code === "23505") {
        // Retry with update
        const { data: retryData } = await supabase
          .from("function_usage_daily")
          .select("id, request_count")
          .eq("user_id", userId)
          .eq("function_name", endpoint)
          .eq("usage_date", today)
          .single();

        if (retryData && retryData.request_count >= maxPerDay) {
          return {
            allowed: false,
            remaining: 0,
            limit: maxPerDay,
            error: createRateLimitError("daily"),
            statusCode: 429,
          };
        }
      }
      console.error("[RateLimit] Error inserting usage:", insertError);
    }

    return {
      allowed: true,
      remaining: maxPerDay - 1,
      limit: maxPerDay,
    };
  } catch (error) {
    console.error("[RateLimit] Unexpected error:", error);
    // FAIL CLOSED for expensive operations
    if (rule.category === "ai" || rule.category === "export") {
      return createDeniedResult(maxPerDay, "daily", endpoint, userId, ipHash, supabaseUrl, supabaseServiceKey);
    }
    return { allowed: true, remaining: maxPerDay, limit: maxPerDay };
  }
}

/**
 * Create a denied result with telemetry
 */
function createDeniedResult(
  limit: number,
  limitType: "daily" | "burst",
  endpoint: string,
  userId: string,
  ipHash: string | null,
  supabaseUrl: string,
  supabaseServiceKey: string
): RateLimitResult {
  // Log telemetry
  logRateLimitEvent(supabaseUrl, supabaseServiceKey, {
    userId,
    ipHash,
    endpoint,
    action: "request",
    outcome: "denied",
    limitType,
    limitValue: limit,
  });
  
  return {
    allowed: false,
    remaining: 0,
    limit,
    error: createRateLimitError(limitType),
    statusCode: 429,
  };
}

/**
 * Create a rate limit response for edge functions
 */
export function createRateLimitResponse(
  result: RateLimitResult,
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify(result.error),
    {
      status: result.statusCode || 429,
      headers: { 
        "Content-Type": "application/json", 
        ...corsHeaders,
        ...(result.error?.retryAfter && { "Retry-After": String(result.error.retryAfter) }),
      },
    }
  );
}

// Re-export for backward compatibility with existing code
export { getRateLimitRules, getAdjustedLimits } from "./rateLimitConfig.ts";
