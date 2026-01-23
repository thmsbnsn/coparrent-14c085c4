/**
 * Billing Verification Utilities
 * 
 * Runtime verification that billing state matches expected behavior.
 * Use these to confirm access changes match webhook events.
 * 
 * BILLING VERIFICATION INVARIANTS:
 * 1. Webhook is source of truth - UI must match webhook state
 * 2. Access changes should be verifiable within 30 seconds
 * 3. Downgrade should remove access
 * 4. Upgrade should grant access
 * 5. Payment failure should trigger past_due state
 */

import { supabase } from "@/integrations/supabase/client";
import { 
  validateSubscriptionState, 
  type ProfileSubscriptionData,
  type SubscriptionState 
} from "./subscriptionInvariants";

// ============ VERIFICATION TYPES ============

export interface BillingVerificationResult {
  passed: boolean;
  checks: BillingCheck[];
  summary: string;
}

export interface BillingCheck {
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
  critical: boolean;
}

// ============ PROFILE STATE FETCHING ============

/**
 * Fetch current subscription state from profile
 * Used to verify webhook updated the database correctly
 */
export async function fetchProfileSubscriptionState(
  userId: string
): Promise<ProfileSubscriptionData | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      subscription_status,
      subscription_tier,
      trial_ends_at,
      trial_started_at,
      free_premium_access,
      access_reason
    `)
    .eq("user_id", userId)
    .maybeSingle();
  
  if (error || !data) {
    console.error("[BillingVerification] Failed to fetch profile:", error);
    return null;
  }
  
  return data as ProfileSubscriptionData;
}

// ============ STATE VERIFICATION ============

/**
 * Verify that profile state matches expected subscription state
 * 
 * Use after webhook processing to confirm state was updated
 */
export async function verifySubscriptionState(
  userId: string,
  expectedState: SubscriptionState
): Promise<BillingCheck> {
  const profile = await fetchProfileSubscriptionState(userId);
  
  if (!profile) {
    return {
      name: "Subscription State",
      passed: false,
      expected: expectedState,
      actual: "Profile not found",
      critical: true,
    };
  }
  
  const validation = validateSubscriptionState(profile);
  const passed = validation.state === expectedState;
  
  return {
    name: "Subscription State",
    passed,
    expected: expectedState,
    actual: validation.state,
    critical: true,
  };
}

/**
 * Verify access is correctly granted/revoked
 */
export async function verifyAccess(
  userId: string,
  expectedHasAccess: boolean
): Promise<BillingCheck> {
  const profile = await fetchProfileSubscriptionState(userId);
  
  if (!profile) {
    return {
      name: "Access Check",
      passed: false,
      expected: expectedHasAccess ? "Has Access" : "No Access",
      actual: "Profile not found",
      critical: true,
    };
  }
  
  const validation = validateSubscriptionState(profile);
  const passed = validation.hasAccess === expectedHasAccess;
  
  return {
    name: "Access Check",
    passed,
    expected: expectedHasAccess ? "Has Access" : "No Access",
    actual: validation.hasAccess ? "Has Access" : "No Access",
    critical: true,
  };
}

/**
 * Verify tier is correctly set
 */
export async function verifyTier(
  userId: string,
  expectedTier: "free" | "power"
): Promise<BillingCheck> {
  const profile = await fetchProfileSubscriptionState(userId);
  
  if (!profile) {
    return {
      name: "Tier Check",
      passed: false,
      expected: expectedTier,
      actual: "Profile not found",
      critical: true,
    };
  }
  
  const validation = validateSubscriptionState(profile);
  const passed = validation.tier === expectedTier;
  
  return {
    name: "Tier Check",
    passed,
    expected: expectedTier,
    actual: validation.tier,
    critical: true,
  };
}

// ============ BILLING FLOW VERIFICATION ============

/**
 * Run full billing verification for upgrade flow
 * 
 * Expected behavior:
 * 1. subscription_status = "active"
 * 2. subscription_tier = "power"
 * 3. hasAccess = true
 */
export async function verifyUpgradeFlow(
  userId: string
): Promise<BillingVerificationResult> {
  const checks: BillingCheck[] = [];
  
  // Check state
  checks.push(await verifySubscriptionState(userId, "subscribed"));
  
  // Check access
  checks.push(await verifyAccess(userId, true));
  
  // Check tier
  checks.push(await verifyTier(userId, "power"));
  
  const allPassed = checks.every(c => c.passed);
  const criticalFailed = checks.filter(c => c.critical && !c.passed);
  
  return {
    passed: allPassed,
    checks,
    summary: allPassed 
      ? "Upgrade verified successfully"
      : `Failed ${criticalFailed.length} critical check(s)`,
  };
}

/**
 * Run full billing verification for downgrade flow
 * 
 * Expected behavior:
 * 1. subscription_status = "canceled" or null
 * 2. subscription_tier = "free"
 * 3. hasAccess = false
 */
export async function verifyDowngradeFlow(
  userId: string
): Promise<BillingVerificationResult> {
  const checks: BillingCheck[] = [];
  
  // Check state (free or trial_expired)
  const stateCheck = await verifySubscriptionState(userId, "free");
  checks.push(stateCheck);
  
  // Check access
  checks.push(await verifyAccess(userId, false));
  
  // Check tier
  checks.push(await verifyTier(userId, "free"));
  
  const allPassed = checks.every(c => c.passed);
  const criticalFailed = checks.filter(c => c.critical && !c.passed);
  
  return {
    passed: allPassed,
    checks,
    summary: allPassed 
      ? "Downgrade verified successfully"
      : `Failed ${criticalFailed.length} critical check(s)`,
  };
}

/**
 * Run full billing verification for payment failure
 * 
 * Expected behavior:
 * 1. subscription_status = "past_due"
 * 2. hasAccess = true (grace period)
 */
export async function verifyPaymentFailureFlow(
  userId: string
): Promise<BillingVerificationResult> {
  const checks: BillingCheck[] = [];
  
  // Check state
  checks.push(await verifySubscriptionState(userId, "past_due"));
  
  // Check access (should still have access during grace)
  checks.push(await verifyAccess(userId, true));
  
  const allPassed = checks.every(c => c.passed);
  const criticalFailed = checks.filter(c => c.critical && !c.passed);
  
  return {
    passed: allPassed,
    checks,
    summary: allPassed 
      ? "Payment failure state verified"
      : `Failed ${criticalFailed.length} critical check(s)`,
  };
}

// ============ CONSOLE LOGGING ============

/**
 * Log verification result to console with formatting
 */
export function logVerificationResult(
  flowName: string,
  result: BillingVerificationResult
): void {
  const icon = result.passed ? "✅" : "❌";
  console.log(`\n${icon} Billing Verification: ${flowName}`);
  console.log(`   Summary: ${result.summary}`);
  
  for (const check of result.checks) {
    const checkIcon = check.passed ? "✓" : "✗";
    const criticalLabel = check.critical ? " (CRITICAL)" : "";
    console.log(`   ${checkIcon} ${check.name}${criticalLabel}`);
    if (!check.passed) {
      console.log(`      Expected: ${check.expected}`);
      console.log(`      Actual: ${check.actual}`);
    }
  }
}
