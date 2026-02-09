import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkFunctionRateLimit } from "./functionRateLimit.ts";

const SCHEDULER_RATE_LIMIT_USER_ID = "11111111-1111-1111-1111-111111111111";

function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.slice("Bearer ".length).trim();
}

function constantTimeEqual(a: string, b: string): boolean {
  const aBytes = new TextEncoder().encode(a);
  const bBytes = new TextEncoder().encode(b);

  if (aBytes.length !== bBytes.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < aBytes.length; i++) {
    result |= aBytes[i] ^ bBytes[i];
  }

  return result === 0;
}

export function isSchedulerAuthorized(req: Request): boolean {
  const schedulerSecret = Deno.env.get("SCHEDULER_SECRET");
  const requestSecret =
    req.headers.get("x-scheduler-secret") ??
    req.headers.get("x-cron-secret");

  if (schedulerSecret && requestSecret && constantTimeEqual(requestSecret, schedulerSecret)) {
    return true;
  }

  const bearerToken = extractBearerToken(req.headers.get("Authorization"));
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (serviceRoleKey && bearerToken && constantTimeEqual(bearerToken, serviceRoleKey)) {
    return true;
  }

  return false;
}

export async function checkSchedulerRateLimit(
  supabaseUrl: string,
  supabaseServiceKey: string,
  functionName: string,
) {
  return checkFunctionRateLimit(
    supabaseUrl,
    supabaseServiceKey,
    SCHEDULER_RATE_LIMIT_USER_ID,
    functionName,
  );
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function deterministicUuid(seed: string): Promise<string> {
  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(seed),
  );
  const hash = toHex(hashBuffer).slice(0, 32);
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
}

export function buildInvocationKey(req: Request, functionName: string): string {
  const explicitKey =
    req.headers.get("x-idempotency-key") ??
    req.headers.get("x-invocation-id");

  if (explicitKey) {
    return `${functionName}:${explicitKey}`;
  }

  const minuteBucket = Math.floor(Date.now() / (60 * 1000));
  return `${functionName}:minute:${minuteBucket}`;
}

export async function claimInvocation(
  supabaseUrl: string,
  supabaseServiceKey: string,
  functionName: string,
  invocationKey: string,
): Promise<{ duplicate: boolean; error?: string }> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  const userId = await deterministicUuid(`scheduler:${functionName}:${invocationKey}`);
  const now = new Date();
  const usageDate = now.toISOString().split("T")[0];
  now.setSeconds(0, 0);

  const { error } = await supabase.from("function_usage_daily").insert({
    user_id: userId,
    function_name: `${functionName}:invocation`,
    usage_date: usageDate,
    request_count: 1,
    minute_window: now.toISOString(),
    minute_count: 1,
  });

  if (!error) {
    return { duplicate: false };
  }

  if (error.code === "23505") {
    return { duplicate: true };
  }

  return { duplicate: false, error: error.message };
}
