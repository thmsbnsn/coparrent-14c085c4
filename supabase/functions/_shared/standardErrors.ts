/**
 * Standardized Error Responses
 * 
 * All edge functions MUST use these error responses for consistency.
 * 
 * ERROR RESPONSE INVARIANTS:
 * 1. NEVER expose internal IDs, stack traces, or raw provider responses
 * 2. ALWAYS return a stable shape: { error: boolean, code: string, message: string }
 * 3. NEVER include sensitive data in error messages
 * 4. ALWAYS include actionable user guidance
 */

export interface StandardError {
  error: true;
  code: string;
  message: string;
  /** Optional retry-after in seconds (for rate limits) */
  retryAfter?: number;
}

// ============ ERROR CODES ============
// These codes are stable API contracts - do not change without versioning

export const ERROR_CODES = {
  // Authentication
  UNAUTHORIZED: "UNAUTHORIZED",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  INVALID_TOKEN: "INVALID_TOKEN",
  
  // Authorization
  FORBIDDEN: "FORBIDDEN",
  ROLE_REQUIRED: "ROLE_REQUIRED",
  PREMIUM_REQUIRED: "PREMIUM_REQUIRED",
  
  // Rate limiting
  RATE_LIMIT: "RATE_LIMIT",
  DAILY_LIMIT_EXCEEDED: "DAILY_LIMIT_EXCEEDED",
  BURST_LIMIT_EXCEEDED: "BURST_LIMIT_EXCEEDED",
  
  // Validation
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_INPUT: "INVALID_INPUT",
  MISSING_REQUIRED: "MISSING_REQUIRED",
  
  // Business logic
  ALREADY_EXISTS: "ALREADY_EXISTS",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  
  // External services
  STRIPE_ERROR: "STRIPE_ERROR",
  AI_ERROR: "AI_ERROR",
  EMAIL_ERROR: "EMAIL_ERROR",
  
  // Server errors (never expose details)
  INTERNAL_ERROR: "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// ============ USER-FRIENDLY MESSAGES ============
// These messages are shown to users - keep them helpful and non-technical

const USER_MESSAGES: Record<string, string> = {
  [ERROR_CODES.UNAUTHORIZED]: "Please sign in to continue.",
  [ERROR_CODES.TOKEN_EXPIRED]: "Your session has expired. Please sign in again.",
  [ERROR_CODES.INVALID_TOKEN]: "Invalid session. Please sign in again.",
  [ERROR_CODES.FORBIDDEN]: "You don't have permission to do this.",
  [ERROR_CODES.ROLE_REQUIRED]: "This action requires parent or guardian access.",
  [ERROR_CODES.PREMIUM_REQUIRED]: "This feature requires a Power subscription.",
  [ERROR_CODES.RATE_LIMIT]: "You've made too many requests. Please wait a moment.",
  [ERROR_CODES.DAILY_LIMIT_EXCEEDED]: "You've reached your daily limit. Try again tomorrow.",
  [ERROR_CODES.BURST_LIMIT_EXCEEDED]: "Too many requests. Please wait a moment.",
  [ERROR_CODES.VALIDATION_ERROR]: "Please check your input and try again.",
  [ERROR_CODES.INVALID_INPUT]: "The provided data is invalid.",
  [ERROR_CODES.MISSING_REQUIRED]: "Some required information is missing.",
  [ERROR_CODES.ALREADY_EXISTS]: "This already exists.",
  [ERROR_CODES.NOT_FOUND]: "The requested item was not found.",
  [ERROR_CODES.CONFLICT]: "This action conflicts with current state.",
  [ERROR_CODES.STRIPE_ERROR]: "Payment processing error. Please try again.",
  [ERROR_CODES.AI_ERROR]: "AI service temporarily unavailable. Please try again.",
  [ERROR_CODES.EMAIL_ERROR]: "Unable to send email. Please try again later.",
  [ERROR_CODES.INTERNAL_ERROR]: "Something went wrong. Please try again.",
  [ERROR_CODES.SERVICE_UNAVAILABLE]: "Service temporarily unavailable. Please try again later.",
};

// ============ HTTP STATUS CODES ============

const STATUS_CODES: Record<string, number> = {
  [ERROR_CODES.UNAUTHORIZED]: 401,
  [ERROR_CODES.TOKEN_EXPIRED]: 401,
  [ERROR_CODES.INVALID_TOKEN]: 401,
  [ERROR_CODES.FORBIDDEN]: 403,
  [ERROR_CODES.ROLE_REQUIRED]: 403,
  [ERROR_CODES.PREMIUM_REQUIRED]: 403,
  [ERROR_CODES.RATE_LIMIT]: 429,
  [ERROR_CODES.DAILY_LIMIT_EXCEEDED]: 429,
  [ERROR_CODES.BURST_LIMIT_EXCEEDED]: 429,
  [ERROR_CODES.VALIDATION_ERROR]: 400,
  [ERROR_CODES.INVALID_INPUT]: 400,
  [ERROR_CODES.MISSING_REQUIRED]: 400,
  [ERROR_CODES.ALREADY_EXISTS]: 409,
  [ERROR_CODES.NOT_FOUND]: 404,
  [ERROR_CODES.CONFLICT]: 409,
  [ERROR_CODES.STRIPE_ERROR]: 502,
  [ERROR_CODES.AI_ERROR]: 502,
  [ERROR_CODES.EMAIL_ERROR]: 502,
  [ERROR_CODES.INTERNAL_ERROR]: 500,
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 503,
};

// ============ ERROR CREATION FUNCTIONS ============

/**
 * Create a standardized error object
 * 
 * @param code - Error code from ERROR_CODES
 * @param customMessage - Optional custom message (overrides default)
 * @param retryAfter - Optional retry-after in seconds
 */
export function createError(
  code: ErrorCode,
  customMessage?: string,
  retryAfter?: number
): StandardError {
  return {
    error: true,
    code,
    message: customMessage || USER_MESSAGES[code] || "An error occurred.",
    ...(retryAfter !== undefined && { retryAfter }),
  };
}

/**
 * Create a rate limit error with retry information
 */
export function createRateLimitError(
  type: "daily" | "burst",
  retryAfterSeconds?: number
): StandardError {
  const code = type === "daily" 
    ? ERROR_CODES.DAILY_LIMIT_EXCEEDED 
    : ERROR_CODES.BURST_LIMIT_EXCEEDED;
    
  const message = type === "daily"
    ? "You've reached your daily limit. Resets at midnight UTC."
    : "Too many requests. Please wait a moment.";
    
  return createError(code, message, retryAfterSeconds);
}

/**
 * Create an HTTP Response from a StandardError
 */
export function errorResponse(
  error: StandardError,
  corsHeaders: Record<string, string>
): Response {
  const status = STATUS_CODES[error.code] || 500;
  
  return new Response(JSON.stringify(error), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
      ...(error.retryAfter && { "Retry-After": String(error.retryAfter) }),
    },
  });
}

/**
 * Create a success response
 */
export function successResponse<T>(
  data: T,
  corsHeaders: Record<string, string>,
  status = 200
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

// ============ ERROR LOGGING (SAFE) ============

/**
 * Log an error safely (no sensitive data)
 * 
 * NEVER log:
 * - User emails or personal info
 * - Full request bodies
 * - Stack traces in production
 * - API keys or tokens
 */
export function logError(
  step: string,
  code: ErrorCode,
  details?: {
    userId?: string;
    endpoint?: string;
    action?: string;
    // Never include: email, body, token, etc.
  }
): void {
  console.error(`[ERROR] ${step}`, {
    code,
    ...details,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Sanitize error message from external services
 * Removes any potentially sensitive information
 */
export function sanitizeExternalError(error: unknown): string {
  if (error instanceof Error) {
    // Remove any URLs, IDs, or API keys from message
    const sanitized = error.message
      .replace(/https?:\/\/[^\s]+/g, "[URL]")
      .replace(/[a-f0-9]{32,}/gi, "[ID]")
      .replace(/sk_[a-zA-Z0-9_]+/g, "[KEY]")
      .replace(/Bearer [^\s]+/g, "[TOKEN]");
    
    // Truncate to reasonable length
    return sanitized.slice(0, 200);
  }
  
  return "External service error";
}
