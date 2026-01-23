/**
 * Centralized Rate Limit Configuration
 * 
 * SINGLE SOURCE OF TRUTH for all server-side rate limits.
 * 
 * COST CONTROL INVARIANTS:
 * 1. The client is NEVER trusted - all limits enforced server-side
 * 2. Rate limits are enforced per-user (auth.uid), not per-session
 * 3. Expensive operations have stricter limits
 * 4. Limits fail CLOSED (deny on error)
 * 
 * Each limit protects against specific abuse vectors:
 * - AI: Token consumption, API costs
 * - Export: CPU/memory for PDF generation
 * - Bulk: Database load, bandwidth
 * - Spam: Email/notification costs, harassment
 */

// Operation categories for semantic grouping
export type RateLimitCategory = 
  | "ai"       // AI model calls (OpenAI, Gemini)
  | "export"   // PDF generation, data exports
  | "bulk"     // List endpoints, search, large reads
  | "spam"     // Invites, notifications, messages
  | "compute"; // Heavy server-side computation

export interface RateLimitRule {
  /** Maximum requests per day (24h rolling or midnight reset) */
  maxPerDay: number;
  /** Maximum requests per minute (burst protection) */
  maxPerMinute: number;
  /** Category for telemetry and monitoring */
  category: RateLimitCategory;
  /** Human-readable description of what this limit protects */
  protects: string;
  /** Whether to use sliding window (true) or fixed window (false) */
  slidingWindow?: boolean;
}

/**
 * Master rate limit configuration
 * 
 * ADDING A NEW ENDPOINT:
 * 1. Add entry here with appropriate limits
 * 2. Use checkRateLimit() in your edge function
 * 3. Return standardized error response
 */
export const RATE_LIMIT_RULES: Record<string, RateLimitRule> = {
  // ============ AI OPERATIONS (HIGHEST COST) ============
  // Each AI call costs real money - strict limits
  "ai-message-assist": {
    maxPerDay: 200,
    maxPerMinute: 10,
    category: "ai",
    protects: "OpenAI/Gemini API costs for message tone analysis",
  },
  "ai-schedule-suggest": {
    maxPerDay: 50,
    maxPerMinute: 5,
    category: "ai",
    protects: "AI schedule generation costs",
  },
  "nurse-nancy-chat": {
    maxPerDay: 100,
    maxPerMinute: 10,
    category: "ai",
    protects: "AI chat costs for health assistant",
  },
  "kid-activity-generator": {
    maxPerDay: 50,
    maxPerMinute: 5,
    category: "ai",
    protects: "AI activity generation costs",
  },
  "generate-coloring-page": {
    maxPerDay: 20,
    maxPerMinute: 3,
    category: "ai",
    protects: "Image generation API costs",
  },

  // ============ EXPORT OPERATIONS (HIGH CPU/MEMORY) ============
  // PDF generation, large data exports
  "generate-expense-report": {
    maxPerDay: 20,
    maxPerMinute: 3,
    category: "export",
    protects: "PDF generation CPU and memory",
  },
  "export-user-data": {
    maxPerDay: 5,
    maxPerMinute: 1,
    category: "export",
    protects: "Full data export bandwidth and processing",
  },
  "court-export": {
    maxPerDay: 10,
    maxPerMinute: 2,
    category: "export",
    protects: "Court document PDF generation",
  },

  // ============ SPAM-PRONE OPERATIONS ============
  // Invites, notifications - abuse vector for harassment
  "send-coparent-invite": {
    maxPerDay: 20,
    maxPerMinute: 5,
    category: "spam",
    protects: "Email delivery costs, harassment prevention",
  },
  "send-third-party-invite": {
    maxPerDay: 20,
    maxPerMinute: 5,
    category: "spam",
    protects: "Email delivery costs, harassment prevention",
  },
  "send-notification": {
    maxPerDay: 100,
    maxPerMinute: 20,
    category: "spam",
    protects: "Push notification costs, user experience",
  },
  "login-notification": {
    maxPerDay: 50,
    maxPerMinute: 10,
    category: "spam",
    protects: "Email delivery costs",
  },
  "create-message-thread": {
    maxPerDay: 50,
    maxPerMinute: 10,
    category: "spam",
    protects: "Database load, spam prevention",
  },

  // ============ BULK OPERATIONS (DATABASE LOAD) ============
  "search-messages": {
    maxPerDay: 200,
    maxPerMinute: 30,
    category: "bulk",
    protects: "Database full-text search load",
  },
  "list-documents": {
    maxPerDay: 500,
    maxPerMinute: 50,
    category: "bulk",
    protects: "Storage API calls",
  },

  // ============ BILLING OPERATIONS ============
  // Stripe API calls - carefully limited
  "create-checkout": {
    maxPerDay: 20,
    maxPerMinute: 5,
    category: "compute",
    protects: "Stripe API rate limits",
  },
  "customer-portal": {
    maxPerDay: 20,
    maxPerMinute: 5,
    category: "compute",
    protects: "Stripe API rate limits",
  },
  "check-subscription": {
    maxPerDay: 500, // Higher - used for UI updates
    maxPerMinute: 30,
    category: "bulk",
    protects: "Stripe API rate limits",
  },

  // ============ DEFAULT (fallback for unlisted endpoints) ============
  "default": {
    maxPerDay: 100,
    maxPerMinute: 30,
    category: "compute",
    protects: "General abuse prevention",
  },
};

/**
 * Get rate limit rules for an endpoint
 * Falls back to default if endpoint not explicitly configured
 */
export function getRateLimitRules(endpoint: string): RateLimitRule {
  return RATE_LIMIT_RULES[endpoint] || RATE_LIMIT_RULES["default"];
}

/**
 * Get all endpoints in a category (for monitoring dashboards)
 */
export function getEndpointsByCategory(category: RateLimitCategory): string[] {
  return Object.entries(RATE_LIMIT_RULES)
    .filter(([_, rule]) => rule.category === category)
    .map(([endpoint]) => endpoint);
}

// ============ TIER-BASED LIMIT MULTIPLIERS ============
// Power users get higher limits for some operations

export interface TierMultipliers {
  ai: number;
  export: number;
  bulk: number;
  spam: number;
  compute: number;
}

export const TIER_MULTIPLIERS: Record<string, TierMultipliers> = {
  free: {
    ai: 0.5,      // Half the AI limits
    export: 0.5,  // Half the export limits
    bulk: 1.0,    // Same bulk limits
    spam: 1.0,    // Same spam limits (prevent abuse)
    compute: 1.0, // Same compute limits
  },
  trial: {
    ai: 1.0,
    export: 1.0,
    bulk: 1.0,
    spam: 1.0,
    compute: 1.0,
  },
  power: {
    ai: 1.0,
    export: 1.5,  // 50% more exports
    bulk: 2.0,    // Double bulk limits
    spam: 1.0,    // Same spam limits
    compute: 1.0,
  },
  admin_access: {
    ai: 5.0,
    export: 5.0,
    bulk: 5.0,
    spam: 5.0,
    compute: 5.0,
  },
};

/**
 * Get adjusted limits based on user tier
 */
export function getAdjustedLimits(
  endpoint: string,
  tier: string
): { maxPerDay: number; maxPerMinute: number } {
  const rule = getRateLimitRules(endpoint);
  const multipliers = TIER_MULTIPLIERS[tier] || TIER_MULTIPLIERS.free;
  const multiplier = multipliers[rule.category];
  
  return {
    maxPerDay: Math.floor(rule.maxPerDay * multiplier),
    maxPerMinute: Math.floor(rule.maxPerMinute * multiplier),
  };
}
