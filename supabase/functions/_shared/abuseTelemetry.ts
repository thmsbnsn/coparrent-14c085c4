/**
 * Abuse Telemetry
 * 
 * Minimal, privacy-respecting telemetry for rate limit events.
 * 
 * TELEMETRY INVARIANTS:
 * 1. NEVER log sensitive payload data
 * 2. ONLY log: actor ID (or hash), endpoint, timestamp, outcome
 * 3. Hash IPs for privacy
 * 4. Keep logs minimal for cost efficiency
 * 
 * Use cases:
 * - Detect abuse patterns
 * - Tune rate limits
 * - Identify bot attacks
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { RateLimitCategory } from "./rateLimitConfig.ts";

interface RateLimitEvent {
  userId: string | null;
  ipHash: string | null;
  endpoint: string;
  action: string;
  outcome: "denied" | "warned" | "allowed";
  limitType: "daily" | "burst" | "tier";
  limitValue: number;
}

/**
 * Hash an IP address for privacy
 * Uses simple hash - not cryptographic, just for grouping
 */
export function hashIP(ip: string): string {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `ip_${Math.abs(hash).toString(16)}`;
}

/**
 * Extract IP from request headers
 * Checks common proxy headers first
 */
export function extractIP(req: Request): string | null {
  // Check common headers in order of preference
  const headers = [
    "cf-connecting-ip",     // Cloudflare
    "x-real-ip",            // nginx
    "x-forwarded-for",      // Generic proxy
  ];
  
  for (const header of headers) {
    const value = req.headers.get(header);
    if (value) {
      // x-forwarded-for can have multiple IPs, take first
      return value.split(",")[0].trim();
    }
  }
  
  return null;
}

/**
 * Log a rate limit event to the database
 * 
 * This is fire-and-forget - don't block on it
 */
export async function logRateLimitEvent(
  supabaseUrl: string,
  supabaseServiceKey: string,
  event: RateLimitEvent
): Promise<void> {
  // Don't await - fire and forget
  logEventAsync(supabaseUrl, supabaseServiceKey, event);
}

async function logEventAsync(
  supabaseUrl: string,
  supabaseServiceKey: string,
  event: RateLimitEvent
): Promise<void> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });
    
    await supabase.from("rate_limit_events").insert({
      user_id: event.userId,
      ip_hash: event.ipHash,
      endpoint: event.endpoint,
      action: event.action,
      outcome: event.outcome,
      limit_type: event.limitType,
      limit_value: event.limitValue,
    });
  } catch (error) {
    // Log to console but don't throw - telemetry should never break the app
    console.error("[AbuseTelemetry] Failed to log event:", error);
  }
}

/**
 * Console log for rate limit events (always runs)
 * Safe for production - no sensitive data
 */
export function logRateLimitConsole(
  endpoint: string,
  outcome: "denied" | "warned" | "allowed",
  details: {
    userId?: string;
    limitType: "daily" | "burst" | "tier";
    currentCount?: number;
    limit?: number;
  }
): void {
  // Only log denials and warnings to reduce noise
  if (outcome === "allowed") return;
  
  console.log(`[RATE_LIMIT] ${outcome.toUpperCase()}`, {
    endpoint,
    outcome,
    ...details,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Get abuse summary for an endpoint (for admin dashboards)
 */
export async function getAbuseSummary(
  supabaseUrl: string,
  supabaseServiceKey: string,
  endpoint: string,
  hours = 24
): Promise<{
  totalDenials: number;
  uniqueUsers: number;
  uniqueIPs: number;
  topOffenders: { id: string; count: number }[];
}> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  });
  
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  
  const { data, error } = await supabase
    .from("rate_limit_events")
    .select("user_id, ip_hash")
    .eq("endpoint", endpoint)
    .eq("outcome", "denied")
    .gte("created_at", since);
  
  if (error || !data) {
    return {
      totalDenials: 0,
      uniqueUsers: 0,
      uniqueIPs: 0,
      topOffenders: [],
    };
  }
  
  // Aggregate results
  const userCounts = new Map<string, number>();
  const ips = new Set<string>();
  
  for (const row of data) {
    if (row.user_id) {
      userCounts.set(row.user_id, (userCounts.get(row.user_id) || 0) + 1);
    }
    if (row.ip_hash) {
      ips.add(row.ip_hash);
    }
  }
  
  // Get top offenders
  const topOffenders = Array.from(userCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({ id, count }));
  
  return {
    totalDenials: data.length,
    uniqueUsers: userCounts.size,
    uniqueIPs: ips.size,
    topOffenders,
  };
}
