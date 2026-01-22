/**
 * User-friendly error messages
 * 
 * Maps technical errors to human-readable messages.
 * Ensures users never see raw UUIDs, enum values, or Supabase error objects.
 */

import { captureError } from "@/lib/sentry";

// Standard user-facing messages
export const ERROR_MESSAGES = {
  // Generic fallbacks
  GENERIC: "Something went wrong. Please try again.",
  NETWORK: "Unable to connect. Please check your internet connection.",
  TIMEOUT: "The request took too long. Please try again.",
  
  // Auth/Permission
  NOT_AUTHENTICATED: "Please log in to continue.",
  SESSION_EXPIRED: "Your session has expired. Please log in again.",
  NOT_PARENT: "This action requires a parent account.",
  ACCESS_DENIED: "You don't have permission to access this.",
  CHILD_ACCOUNT_RESTRICTED: "This feature is not available for child accounts.",
  
  // Plan limits
  LIMIT_REACHED: "You've reached your plan limit. Upgrade to add more.",
  UPGRADE_REQUIRED: "Upgrade to Power to access this feature.",
  TRIAL_EXPIRED: "Your trial has ended. Upgrade to continue.",
  
  // Validation
  INVALID_INPUT: "Please check your input and try again.",
  REQUIRED_FIELD: "Please fill in all required fields.",
  INVALID_EMAIL: "Please enter a valid email address.",
  
  // Stripe/Billing
  PAYMENT_FAILED: "Payment failed. Please try a different payment method.",
  CHECKOUT_ERROR: "Unable to start checkout. Please try again.",
  SUBSCRIPTION_ERROR: "There was an issue with your subscription.",
  
  // Data operations
  SAVE_FAILED: "Unable to save. Please try again.",
  DELETE_FAILED: "Unable to delete. Please try again.",
  LOAD_FAILED: "Unable to load data. Please refresh the page.",
  
  // Feature-specific
  EXPORT_FAILED: "Export failed. Please try again.",
  UPLOAD_FAILED: "Upload failed. Please try again.",
  INVITE_FAILED: "Unable to send invitation. Please try again.",
} as const;

// Error code mapping from RPC functions
const RPC_ERROR_MAP: Record<string, keyof typeof ERROR_MESSAGES> = {
  NOT_AUTHENTICATED: "NOT_AUTHENTICATED",
  NOT_PARENT: "NOT_PARENT",
  LIMIT_REACHED: "LIMIT_REACHED",
  VALIDATION_ERROR: "INVALID_INPUT",
  UNKNOWN_ERROR: "GENERIC",
};

/**
 * Check if a string looks like a UUID
 */
const isUUID = (str: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

/**
 * Check if a string looks like a technical error
 */
const isTechnicalError = (str: string): boolean => {
  const technicalPatterns = [
    /^PGRST\d+/i, // PostgREST errors
    /^JWT/i, // JWT errors
    /violates foreign key/i,
    /violates unique constraint/i,
    /relation ".+" does not exist/i,
    /column ".+" does not exist/i,
    /permission denied/i,
    /row-level security/i,
    /RLS/i,
    /^Error: /,
    /supabase/i,
    /postgres/i,
  ];
  return technicalPatterns.some((pattern) => pattern.test(str));
};

/**
 * Sanitize error message for user display
 * Removes UUIDs, technical jargon, and replaces with friendly text
 */
export const sanitizeErrorForUser = (error: unknown): string => {
  // Handle null/undefined
  if (!error) return ERROR_MESSAGES.GENERIC;
  
  // Handle Error objects
  if (error instanceof Error) {
    return sanitizeErrorMessage(error.message);
  }
  
  // Handle RPC response objects
  if (typeof error === "object" && error !== null) {
    const obj = error as Record<string, unknown>;
    
    // Handle our standard RPC error format
    if ("code" in obj && typeof obj.code === "string") {
      const mappedKey = RPC_ERROR_MAP[obj.code];
      if (mappedKey) {
        // Use custom message if provided, otherwise use default
        if ("message" in obj && typeof obj.message === "string" && !isTechnicalError(obj.message)) {
          return obj.message;
        }
        return ERROR_MESSAGES[mappedKey];
      }
    }
    
    // Handle Supabase error objects
    if ("message" in obj && typeof obj.message === "string") {
      return sanitizeErrorMessage(obj.message);
    }
    
    // Handle error objects with details
    if ("error" in obj && typeof obj.error === "string") {
      return sanitizeErrorMessage(obj.error);
    }
  }
  
  // Handle string errors
  if (typeof error === "string") {
    return sanitizeErrorMessage(error);
  }
  
  return ERROR_MESSAGES.GENERIC;
};

/**
 * Sanitize an error message string
 */
const sanitizeErrorMessage = (message: string): string => {
  // If it looks technical, return generic message
  if (isTechnicalError(message)) {
    return ERROR_MESSAGES.GENERIC;
  }
  
  // Remove any UUIDs
  if (isUUID(message) || message.includes("-") && /[0-9a-f]{8}/.test(message)) {
    let sanitized = message.replace(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
      ""
    ).trim();
    
    // If message becomes empty or too short after removing UUID, use generic
    if (sanitized.length < 10) {
      return ERROR_MESSAGES.GENERIC;
    }
    return sanitized;
  }
  
  // Common Supabase/Postgres error translations
  const translations: [RegExp, string][] = [
    [/duplicate key value/i, "This item already exists."],
    [/foreign key constraint/i, "This item is linked to other data."],
    [/not null constraint/i, ERROR_MESSAGES.REQUIRED_FIELD],
    [/invalid input syntax/i, ERROR_MESSAGES.INVALID_INPUT],
    [/JWT expired/i, ERROR_MESSAGES.SESSION_EXPIRED],
    [/no rows returned/i, "Item not found."],
    [/rate limit/i, "Too many requests. Please wait a moment."],
  ];
  
  for (const [pattern, replacement] of translations) {
    if (pattern.test(message)) {
      return replacement;
    }
  }
  
  // If the message is reasonably short and doesn't look technical, use it
  if (message.length < 100 && !isTechnicalError(message)) {
    return message;
  }
  
  return ERROR_MESSAGES.GENERIC;
};

/**
 * Handle and log an error, returning a user-friendly message
 * Also reports to Sentry
 */
export const handleError = (
  error: unknown,
  context?: {
    feature?: string;
    action?: string;
    silent?: boolean;
  }
): string => {
  const userMessage = sanitizeErrorForUser(error);
  
  // Log to Sentry (with full error for debugging)
  if (error instanceof Error) {
    captureError(error, {
      feature: context?.feature,
      action: context?.action,
      extra: { userMessage },
    });
  }
  
  // Console log in development
  if (import.meta.env.DEV) {
    console.error(`[${context?.feature || "Error"}]`, error);
  }
  
  return userMessage;
};

/**
 * Type guard for RPC result format
 */
export interface RpcErrorResult {
  ok: false;
  code: string;
  message?: string;
  meta?: Record<string, unknown>;
}

export const isRpcError = (result: unknown): result is RpcErrorResult => {
  return (
    typeof result === "object" &&
    result !== null &&
    "ok" in result &&
    (result as Record<string, unknown>).ok === false
  );
};
