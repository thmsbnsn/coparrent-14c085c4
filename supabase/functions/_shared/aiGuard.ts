import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Types for AI Guard
export type FamilyRole = "parent" | "guardian" | "third_party" | "child" | null;
export type PlanTier = "free" | "trial" | "power" | "admin_access";
export type AiAction = 
  | "quick-check" 
  | "analyze" 
  | "rephrase" 
  | "draft" 
  | "schedule-suggest";

export interface UserContext {
  userId: string;
  profileId: string | null;
  role: FamilyRole;
  isParent: boolean;
  planTier: PlanTier;
  hasPremiumAccess: boolean;
  /** Whether access comes from family subscription (vs personal) */
  isFamilyEntitlement: boolean;
}

interface GuardResult {
  allowed: boolean;
  userContext?: UserContext;
  error?: { error: string; code: string };
  statusCode?: number;
}

interface PlanLimits {
  maxCallsPerDay: number;
  maxInputChars: number;
  maxTokens: number;
}

// Plan-based limits (simplified: free vs power)
const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: { maxCallsPerDay: 10, maxInputChars: 600, maxTokens: 500 },
  trial: { maxCallsPerDay: 200, maxInputChars: 3000, maxTokens: 2000 },
  power: { maxCallsPerDay: 200, maxInputChars: 3000, maxTokens: 2000 },
  admin_access: { maxCallsPerDay: 200, maxInputChars: 3000, maxTokens: 2000 },
};

/**
 * AI TOOL ACCESS POLICY:
 * - All family members (parents, guardians, third-party, children) can use AI tools
 * - Requirement: ANY member of the family must have a Power subscription
 * - This enables grandparents, babysitters, and children to use Nurse Nancy, etc.
 */
const ACTION_ALLOWLIST: Record<AiAction, { requiresPremium: boolean }> = {
  "quick-check": { requiresPremium: false },
  "analyze": { requiresPremium: true },
  "rephrase": { requiresPremium: true },
  "draft": { requiresPremium: true },
  "schedule-suggest": { requiresPremium: true },
};

/**
 * Validates JWT token and returns user from Supabase auth
 */
async function validateAuth(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  authHeader: string | null
): Promise<{ user: { id: string; email?: string } | null; error: string | null }> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { user: null, error: "Missing or invalid Authorization header" };
  }

  const token = authHeader.replace("Bearer ", "");
  
  const { data, error } = await supabase.auth.getUser(token);
  
  if (error || !data?.user) {
    return { user: null, error: error?.message || "Invalid or expired token" };
  }

  return { user: data.user, error: null };
}

/**
 * Determines user's family role using the same logic as useFamilyRole.ts
 */
async function getUserFamilyRole(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  userId: string
): Promise<{ profileId: string | null; role: FamilyRole; isParent: boolean; familyId: string | null }> {
  try {
    // Get user's profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, co_parent_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!profile) {
      return { profileId: null, role: null, isParent: false, familyId: null };
    }

    // Check if user is a family member (third-party, child, etc.)
    const { data: familyMember } = await supabase
      .from("family_members")
      .select("role, family_id")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();

    if (familyMember) {
      const role = familyMember.role as FamilyRole;
      return { 
        profileId: profile.id, 
        role, 
        isParent: role === "parent" || role === "guardian",
        familyId: familyMember.family_id,
      };
    }

    // Check for family via parent relationship
    const { data: parentFamily } = await supabase
      .from("family_members")
      .select("family_id")
      .eq("profile_id", profile.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    // User is a parent/guardian
    return { 
      profileId: profile.id, 
      role: "parent", 
      isParent: true,
      familyId: parentFamily?.family_id || null,
    };
  } catch (error) {
    console.error("Error fetching family role:", error);
    return { profileId: null, role: null, isParent: false, familyId: null };
  }
}

/**
 * Normalize tier from database (handles legacy values)
 */
function normalizeTier(tier: string | null): PlanTier {
  if (!tier) return "free";
  // Map legacy tiers to power
  if (tier === "premium" || tier === "mvp" || tier === "power") {
    return "power";
  }
  if (tier === "trial") return "trial";
  return "free";
}

/**
 * Checks if user personally has premium access
 */
async function getUserPersonalPlanTier(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  userId: string
): Promise<{ planTier: PlanTier; hasPremiumAccess: boolean }> {
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("free_premium_access, subscription_status, subscription_tier, trial_ends_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (!profile) {
      return { planTier: "free", hasPremiumAccess: false };
    }

    // Admin free access (highest priority)
    if (profile.free_premium_access === true) {
      return { planTier: "admin_access", hasPremiumAccess: true };
    }

    // Active paid subscription
    if (profile.subscription_status === "active") {
      const tier = normalizeTier(profile.subscription_tier);
      if (tier === "power") {
        return { planTier: tier, hasPremiumAccess: true };
      }
    }
    
    // Past due (grace period - still has access)
    if (profile.subscription_status === "past_due") {
      return { planTier: "power", hasPremiumAccess: true };
    }

    // Trial check - real-time expiration validation
    if (profile.trial_ends_at) {
      const trialEnd = new Date(profile.trial_ends_at);
      const now = new Date();
      
      if (trialEnd > now) {
        return { planTier: "trial", hasPremiumAccess: true };
      }
    }

    return { planTier: "free", hasPremiumAccess: false };
  } catch (error) {
    console.error("Error fetching personal plan tier:", error);
    return { planTier: "free", hasPremiumAccess: false };
  }
}

/**
 * FAMILY-LEVEL ENTITLEMENT CHECK
 * 
 * If any member of the family has Power access, ALL members get access.
 * This enables co-parents, grandparents, babysitters, and children to use AI tools.
 */
async function getFamilyEntitlement(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  familyId: string | null
): Promise<{ hasFamilyPremiumAccess: boolean; familyTier: PlanTier }> {
  if (!familyId) {
    return { hasFamilyPremiumAccess: false, familyTier: "free" };
  }

  try {
    // Get all family members' profiles
    const { data: familyMembers } = await supabase
      .from("family_members")
      .select(`
        profile_id,
        profiles!inner (
          id,
          subscription_tier,
          subscription_status,
          free_premium_access,
          trial_ends_at
        )
      `)
      .eq("family_id", familyId)
      .eq("status", "active");

    if (!familyMembers || familyMembers.length === 0) {
      return { hasFamilyPremiumAccess: false, familyTier: "free" };
    }

    const now = new Date();

    // Check if ANY family member has premium access
    for (const member of familyMembers) {
      const profile = member.profiles;
      if (!profile) continue;

      // Free premium access (admin granted)
      if (profile.free_premium_access === true) {
        return { hasFamilyPremiumAccess: true, familyTier: "power" };
      }

      // Active subscription
      if (profile.subscription_status === "active" || profile.subscription_status === "past_due") {
        const tier = normalizeTier(profile.subscription_tier);
        if (tier === "power") {
          return { hasFamilyPremiumAccess: true, familyTier: "power" };
        }
      }

      // Active trial
      if (profile.trial_ends_at) {
        const trialEnd = new Date(profile.trial_ends_at);
        if (trialEnd > now) {
          return { hasFamilyPremiumAccess: true, familyTier: "trial" };
        }
      }
    }

    return { hasFamilyPremiumAccess: false, familyTier: "free" };
  } catch (error) {
    console.error("Error checking family entitlement:", error);
    return { hasFamilyPremiumAccess: false, familyTier: "free" };
  }
}

/**
 * Checks if user is an admin
 */
async function isUserAdmin(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  userId: string
): Promise<boolean> {
  try {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    return !!data;
  } catch {
    return false;
  }
}

/**
 * Main AI Guard function - validates auth, role, plan, and action permissions
 * 
 * ACCESS POLICY FOR AI TOOLS:
 * - ANY family member can use AI tools (parents, guardians, third-party, children)
 * - Requirement: At least ONE family member must have Power subscription
 * - This shares the benefit across the entire family
 */
export async function aiGuard(
  req: Request,
  action: AiAction,
  supabaseUrl: string,
  supabaseServiceKey: string
): Promise<GuardResult> {
  // Create Supabase client with service role for admin access
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  });

  // 1. Validate authentication
  const authHeader = req.headers.get("Authorization");
  const { user, error: authError } = await validateAuth(supabase, authHeader);

  if (authError || !user) {
    return {
      allowed: false,
      error: { error: authError || "Authentication required", code: "UNAUTHORIZED" },
      statusCode: 401,
    };
  }

  // 2. Get user's family role and family ID
  const { profileId, role, isParent, familyId } = await getUserFamilyRole(supabase, user.id);

  // 3. Get user's personal plan tier
  const { planTier: personalTier, hasPremiumAccess: hasPersonalAccess } = await getUserPersonalPlanTier(supabase, user.id);

  // 4. Get family-level entitlement (if any family member has premium)
  const { hasFamilyPremiumAccess, familyTier } = await getFamilyEntitlement(supabase, familyId);

  // 5. Check if user is admin (admins bypass restrictions)
  const isAdmin = await isUserAdmin(supabase, user.id);

  // Determine effective access: personal OR family entitlement
  const hasPremiumAccess = hasPersonalAccess || hasFamilyPremiumAccess || isAdmin;
  const effectiveTier = isAdmin ? "admin_access" : (hasPersonalAccess ? personalTier : familyTier);

  const userContext: UserContext = {
    userId: user.id,
    profileId,
    role,
    isParent: isParent || isAdmin,
    planTier: effectiveTier,
    hasPremiumAccess,
    isFamilyEntitlement: !hasPersonalAccess && hasFamilyPremiumAccess,
  };

  // 6. Check action allowlist
  const actionConfig = ACTION_ALLOWLIST[action];
  
  if (!actionConfig) {
    return {
      allowed: false,
      error: { error: `Unknown action: ${action}`, code: "INVALID_ACTION" },
      statusCode: 400,
    };
  }

  // Admins bypass all restrictions
  if (isAdmin) {
    return { allowed: true, userContext };
  }

  // Check premium requirement (personal OR family entitlement satisfies this)
  if (actionConfig.requiresPremium && !hasPremiumAccess) {
    return {
      allowed: false,
      error: { 
        error: "This action requires a Power subscription", 
        code: "PREMIUM_REQUIRED" 
      },
      statusCode: 403,
    };
  }

  return { allowed: true, userContext };
}

/**
 * Get plan limits for a user context
 */
export function getPlanLimits(userContext: UserContext): PlanLimits {
  return PLAN_LIMITS[userContext.planTier] || PLAN_LIMITS.free;
}

/**
 * Validate input length against plan limits
 */
export function validateInputLength(
  input: string,
  userContext: UserContext
): { valid: boolean; error?: { error: string; code: string } } {
  const limits = getPlanLimits(userContext);
  
  if (input.length > limits.maxInputChars) {
    return {
      valid: false,
      error: {
        error: `Input exceeds maximum length of ${limits.maxInputChars} characters for your plan`,
        code: "INPUT_TOO_LONG",
      },
    };
  }

  return { valid: true };
}

export { PLAN_LIMITS };
