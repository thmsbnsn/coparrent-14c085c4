/**
 * CORS configuration for AI Edge Functions
 * Implements strict origin validation with env-based allowlist
 */

// Default allowed origins for production
const DEFAULT_ALLOWED_ORIGINS = [
  "https://coparrent.app",
  "https://www.coparrent.app",
  "https://lovable.dev",
];

// Localhost patterns for development
const LOCALHOST_PATTERNS = [
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
  /^https?:\/\/\[::1](:\d+)?$/,
];

/**
 * Get the list of allowed origins from environment
 */
function getAllowedOrigins(): string[] {
  const envOrigins = Deno.env.get("ALLOWED_ORIGINS");
  
  if (envOrigins) {
    return envOrigins.split(",").map((o) => o.trim()).filter(Boolean);
  }
  
  return DEFAULT_ALLOWED_ORIGINS;
}

/**
 * Check if we're in development mode
 */
function isDevelopment(): boolean {
  return Deno.env.get("DENO_ENV") === "development";
}

/**
 * Validate if an origin is allowed
 */
function isOriginAllowed(origin: string | null): boolean {
  if (!origin) {
    return false;
  }

  // Check allowed origins list
  const allowedOrigins = getAllowedOrigins();
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  // In development, allow localhost
  if (isDevelopment()) {
    for (const pattern of LOCALHOST_PATTERNS) {
      if (pattern.test(origin)) {
        return true;
      }
    }
  }

  // Allow Lovable preview URLs (they use dynamic subdomains)
  if (origin.includes(".lovableproject.com") || origin.includes(".lovable.app")) {
    return true;
  }

  return false;
}

/**
 * Get CORS headers for a request
 * Returns appropriate headers based on origin validation
 */
export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin");
  
  // If origin is allowed, return it in the header
  // Otherwise, don't include Access-Control-Allow-Origin (browser will block)
  const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400", // Cache preflight for 24 hours
  };

  if (isOriginAllowed(origin)) {
    corsHeaders["Access-Control-Allow-Origin"] = origin!;
    corsHeaders["Access-Control-Allow-Credentials"] = "true";
  }

  return corsHeaders;
}

/**
 * Handle CORS preflight (OPTIONS) request
 */
export function handleCorsPreflightRequest(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    const origin = req.headers.get("Origin");
    
    if (isOriginAllowed(origin)) {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(req),
      });
    }
    
    // Reject preflight for disallowed origins
    return new Response(null, { status: 403 });
  }
  
  return null;
}

/**
 * Validate origin and return error response if blocked
 */
export function validateOrigin(req: Request): Response | null {
  const origin = req.headers.get("Origin");
  
  // Allow requests without Origin header (e.g., server-to-server)
  if (!origin) {
    return null;
  }
  
  if (!isOriginAllowed(origin)) {
    console.warn(`Blocked request from disallowed origin: ${origin}`);
    return new Response(
      JSON.stringify({ 
        error: "Origin not allowed", 
        code: "CORS_BLOCKED" 
      }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
  
  return null;
}

/**
 * Strict CORS middleware - validates origin before processing
 * Returns null if allowed, Response if blocked
 */
export function strictCors(req: Request): Response | null {
  // Handle preflight
  const preflightResponse = handleCorsPreflightRequest(req);
  if (preflightResponse) {
    return preflightResponse;
  }
  
  // Validate origin for actual request
  return validateOrigin(req);
}

// Legacy export for backward compatibility
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
