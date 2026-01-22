/**
 * Application version and build info
 * 
 * Keep this in sync with:
 * - src/lib/sentry.ts
 * - supabase/functions/health/index.ts
 */

export const APP_VERSION = "0.9.0-beta";
export const BUILD_DATE = "2026-01-22";

/**
 * Get environment name
 */
export const getEnvironment = (): "production" | "staging" | "development" => {
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  if (hostname === "coparrent.lovable.app") return "production";
  if (hostname.includes("preview")) return "staging";
  return "development";
};

/**
 * Get version info object
 */
export const getVersionInfo = () => ({
  version: APP_VERSION,
  buildDate: BUILD_DATE,
  environment: getEnvironment(),
});
