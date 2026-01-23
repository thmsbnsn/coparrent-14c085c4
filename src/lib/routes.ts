/**
 * ROUTE REGISTRY - Single Source of Truth for Route Audit
 * 
 * PURPOSE: Centralized route definitions used by:
 * 1. Route audit tests (Playwright)
 * 2. Navigation components
 * 3. Security assertions
 * 
 * REGRESSION PREVENTION:
 * - Any new route MUST be added here
 * - Playwright tests run against this registry
 * - CI pipeline will fail if routes 404
 * 
 * @see tests/e2e/route-audit.spec.ts for automated verification
 */

// =============================================================================
// PUBLIC ROUTES - Accessible without authentication
// =============================================================================

export const PUBLIC_ROUTES = [
  "/",
  "/pricing",
  "/about",
  "/features",
  "/help",
  "/help/getting-started",
  "/help/getting-started/invitations",
  "/help/scheduling",
  "/help/scheduling/change-requests",
  "/help/scheduling/patterns",
  "/help/messaging",
  "/help/documents",
  "/help/documents/exports",
  "/help/expenses",
  "/help/account",
  "/help/account/trial-ending",
  "/help/privacy",
  "/help/security",
  "/help/contact",
  "/court-records",
  "/terms",
  "/privacy",
  "/blog",
  // Dynamic: /blog/:slug - tested separately with known slugs
  "/offline",
] as const;

// =============================================================================
// AUTH ROUTES - Login, signup, password reset flows
// =============================================================================

export const AUTH_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/payment-success",
  "/accept-invite",
  "/law-office/login",
  "/law-office/signup",
] as const;

// =============================================================================
// PROTECTED ROUTES - Require authentication
// =============================================================================

/**
 * Routes accessible to ALL authenticated users (parents, third-party, children)
 */
export const PROTECTED_ROUTES_ALL = [
  "/dashboard",
  "/dashboard/calendar",
  "/dashboard/messages",
  "/dashboard/notifications",
  "/dashboard/journal",
  "/dashboard/blog",
  // Dynamic: /dashboard/blog/:slug
] as const;

/**
 * Routes restricted to PARENT/GUARDIAN only
 * Third-party and child accounts are redirected (not 404)
 */
export const PROTECTED_ROUTES_PARENT_ONLY = [
  "/onboarding",
  "/dashboard/children",
  "/dashboard/documents",
  "/dashboard/settings",
  "/dashboard/law-library",
  "/dashboard/law-library/resources",
  // Dynamic: /dashboard/law-library/:slug
  "/dashboard/expenses",
  "/dashboard/sports",
  "/dashboard/gifts",
  "/dashboard/kids-hub",
  "/dashboard/kids-hub/nurse-nancy",
  "/dashboard/kids-hub/coloring-pages",
  "/dashboard/kids-hub/chore-chart",
  "/dashboard/kids-hub/activities",
  "/dashboard/kids-hub/creations",
  "/dashboard/kid-center",
  "/dashboard/audit",
  "/admin",
] as const;

/**
 * Child-specific routes
 */
export const CHILD_ROUTES = [
  "/kids",
] as const;

// =============================================================================
// THIRD-PARTY ACCESS CONTROL
// Third-party users can access these routes (read-only in most cases)
// =============================================================================

export const THIRD_PARTY_ALLOWED_ROUTES = [
  "/dashboard",
  "/dashboard/messages",
  "/dashboard/calendar",
  "/dashboard/journal",
  "/dashboard/blog",
  "/dashboard/notifications",
  "/dashboard/law-library",
  "/onboarding",
] as const;

/**
 * Routes third-party users CANNOT access
 * They should see a graceful "access denied" UI, NOT a 404
 */
export const THIRD_PARTY_DENIED_ROUTES = [
  "/dashboard/children",
  "/dashboard/documents",
  "/dashboard/expenses",
  "/dashboard/settings",
  "/dashboard/audit",
  "/dashboard/kids-hub",
  "/admin",
] as const;

// =============================================================================
// DYNAMIC ROUTES - Require specific slugs/IDs for testing
// =============================================================================

export const DYNAMIC_ROUTES = {
  blogPost: "/blog/:slug",
  dashboardBlogPost: "/dashboard/blog/:slug",
  lawArticle: "/dashboard/law-library/:slug",
} as const;

/**
 * Known test slugs for dynamic route verification
 * These should exist in the database for complete testing
 */
export const TEST_SLUGS = {
  blog: ["sample-post"],
  lawLibrary: ["sample-article"],
} as const;

// =============================================================================
// NAVIGATION LINK AUDIT
// Links found in navigation components that MUST resolve
// =============================================================================

/**
 * Footer links - all must resolve (used by Footer.tsx)
 */
export const FOOTER_LINKS = [
  "/features",
  "/pricing",
  "/signup?type=lawoffice",
  "/help",
  "/help/contact",
  "/about",
  "/privacy",
  "/terms",
  "/help/security",
] as const;

/**
 * Navbar links - all must resolve (used by Navbar.tsx)
 */
export const NAVBAR_LINKS = [
  "/features",
  "/pricing",
  "/blog",
  "/help",
] as const;

/**
 * Dashboard sidebar links (used by DashboardLayout.tsx)
 */
export const DASHBOARD_NAV_LINKS = [
  "/dashboard",
  "/dashboard/calendar",
  "/dashboard/children",
  "/dashboard/sports",
  "/dashboard/kids-hub",
  "/dashboard/messages",
  "/dashboard/documents",
  "/dashboard/expenses",
  "/dashboard/journal",
  "/dashboard/law-library",
  "/dashboard/blog",
  "/dashboard/settings",
] as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get all static routes for audit
 */
export function getAllStaticRoutes(): string[] {
  return [
    ...PUBLIC_ROUTES,
    ...AUTH_ROUTES,
    ...PROTECTED_ROUTES_ALL,
    ...PROTECTED_ROUTES_PARENT_ONLY,
    ...CHILD_ROUTES,
  ];
}

/**
 * Check if a route requires authentication
 */
export function requiresAuth(path: string): boolean {
  const publicPaths = [...PUBLIC_ROUTES, ...AUTH_ROUTES];
  return !publicPaths.some(p => path === p || path.startsWith(p + "/"));
}

/**
 * Check if a route is parent-only
 */
export function isParentOnlyRoute(path: string): boolean {
  return PROTECTED_ROUTES_PARENT_ONLY.some(
    (route) => path === route || path.startsWith(route + "/")
  );
}

/**
 * Check if third-party can access a route
 */
export function isThirdPartyAllowed(path: string): boolean {
  return THIRD_PARTY_ALLOWED_ROUTES.some(
    (route) => path === route || path.startsWith(route + "/")
  );
}
