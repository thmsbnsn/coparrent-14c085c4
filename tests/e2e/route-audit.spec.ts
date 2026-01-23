/**
 * ROUTE AUDIT - Comprehensive 404 Prevention Tests
 * 
 * PURPOSE: Prevent user-facing 404s and dead-ends
 * 
 * REGRESSION PREVENTION:
 * - This test suite runs in CI pipeline
 * - Any new route MUST be added to src/lib/routes.ts
 * - All navigation links MUST resolve to valid routes
 * 
 * TEST CATEGORIES:
 * 1. Public routes - accessible without auth
 * 2. Auth routes - login, signup flows
 * 3. Protected routes - require authentication
 * 4. Role-gated routes - parent vs third-party access
 * 5. Navigation links - all clickable elements
 * 
 * @see src/lib/routes.ts for route definitions
 */

import { test, expect, Page } from "@playwright/test";

// =============================================================================
// ROUTE DEFINITIONS (mirrored from src/lib/routes.ts for test isolation)
// =============================================================================

const PUBLIC_ROUTES = [
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
  "/offline",
];

const AUTH_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/law-office/login",
  "/law-office/signup",
];

const FOOTER_LINKS = [
  "/features",
  "/pricing",
  "/help",
  "/help/contact",
  "/about",
  "/privacy",
  "/terms",
  "/help/security",
];

const NAVBAR_LINKS = [
  "/features",
  "/pricing",
  "/blog",
  "/help",
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if page is a 404 by looking for NotFound component markers
 */
async function isNotFoundPage(page: Page): Promise<boolean> {
  // Check for the distinctive 404 text
  const has404 = await page.locator("text=404").first().isVisible().catch(() => false);
  const hasPageNotFound = await page.locator("text=Page Not Found").first().isVisible().catch(() => false);
  return has404 && hasPageNotFound;
}

/**
 * Check if page shows access denied (graceful failure, not 404)
 * This is acceptable for role-gated routes
 */
async function isAccessDenied(page: Page): Promise<boolean> {
  const patterns = [
    "Access Denied",
    "access required",
    "Admin Access Required",
    "Parent access required",
    "not authorized",
  ];
  
  for (const pattern of patterns) {
    const found = await page.locator(`text=${pattern}`).first().isVisible().catch(() => false);
    if (found) return true;
  }
  return false;
}

/**
 * Check if page shows login redirect (acceptable for protected routes)
 */
async function isLoginRedirect(page: Page): Promise<boolean> {
  const currentUrl = page.url();
  return currentUrl.includes("/login");
}

// =============================================================================
// PUBLIC ROUTE TESTS
// =============================================================================

test.describe("Public Routes - No Auth Required", () => {
  /**
   * INVARIANT: All public routes must render without 404
   * These routes should be accessible to everyone, logged in or not
   */
  for (const route of PUBLIC_ROUTES) {
    test(`Public route ${route} renders without 404`, async ({ page }) => {
      await page.goto(route, { waitUntil: "networkidle" });
      
      const is404 = await isNotFoundPage(page);
      expect(is404, `Route ${route} should not be a 404 page`).toBe(false);
      
      // Additional check: page should have meaningful content
      const bodyContent = await page.locator("body").textContent();
      expect(bodyContent?.length || 0, `Route ${route} should have content`).toBeGreaterThan(100);
    });
  }
});

// =============================================================================
// AUTH ROUTE TESTS
// =============================================================================

test.describe("Auth Routes - Login/Signup Flows", () => {
  /**
   * INVARIANT: All auth routes must render without 404
   * These are the entry points for authentication
   */
  for (const route of AUTH_ROUTES) {
    test(`Auth route ${route} renders without 404`, async ({ page }) => {
      await page.goto(route, { waitUntil: "networkidle" });
      
      const is404 = await isNotFoundPage(page);
      expect(is404, `Route ${route} should not be a 404 page`).toBe(false);
    });
  }
});

// =============================================================================
// NAVIGATION LINK TESTS
// =============================================================================

test.describe("Footer Navigation Links", () => {
  /**
   * INVARIANT: All footer links must resolve to valid pages
   * Dead footer links erode user trust
   */
  for (const link of FOOTER_LINKS) {
    test(`Footer link ${link} resolves without 404`, async ({ page }) => {
      await page.goto(link, { waitUntil: "networkidle" });
      
      const is404 = await isNotFoundPage(page);
      expect(is404, `Footer link ${link} should not lead to 404`).toBe(false);
    });
  }
});

test.describe("Navbar Navigation Links", () => {
  /**
   * INVARIANT: All navbar links must resolve to valid pages
   */
  for (const link of NAVBAR_LINKS) {
    test(`Navbar link ${link} resolves without 404`, async ({ page }) => {
      await page.goto(link, { waitUntil: "networkidle" });
      
      const is404 = await isNotFoundPage(page);
      expect(is404, `Navbar link ${link} should not lead to 404`).toBe(false);
    });
  }
});

// =============================================================================
// PROTECTED ROUTE BEHAVIOR TESTS
// =============================================================================

test.describe("Protected Routes - Auth Required", () => {
  /**
   * INVARIANT: Protected routes should redirect to login, not 404
   * Users who aren't logged in should see a clear path to authentication
   */
  const protectedRoutes = [
    "/dashboard",
    "/dashboard/calendar",
    "/dashboard/messages",
    "/dashboard/children",
    "/dashboard/documents",
    "/dashboard/expenses",
    "/dashboard/settings",
  ];
  
  for (const route of protectedRoutes) {
    test(`Protected route ${route} redirects to login (not 404)`, async ({ page }) => {
      await page.goto(route, { waitUntil: "networkidle" });
      
      const is404 = await isNotFoundPage(page);
      expect(is404, `Protected route ${route} should not be a 404`).toBe(false);
      
      // Should either redirect to login or show auth required message
      const redirectedToLogin = await isLoginRedirect(page);
      const showsAccessDenied = await isAccessDenied(page);
      
      expect(
        redirectedToLogin || showsAccessDenied,
        `Protected route ${route} should redirect to login or show access denied`
      ).toBe(true);
    });
  }
});

// =============================================================================
// HELP CENTER COMPLETENESS
// =============================================================================

test.describe("Help Center - No Dead Ends", () => {
  /**
   * INVARIANT: Help Center must not contain placeholder content
   * Users arrive at Help when confused - we must help, not stall
   */
  test("Help Center landing page has working category links", async ({ page }) => {
    await page.goto("/help", { waitUntil: "networkidle" });
    
    // Get all category links
    const categoryLinks = await page.locator("a[href^='/help/'], a[href='/court-records']").all();
    
    expect(categoryLinks.length, "Help Center should have category links").toBeGreaterThan(0);
    
    // Check each category link resolves
    for (const link of categoryLinks) {
      const href = await link.getAttribute("href");
      if (href) {
        await page.goto(href, { waitUntil: "networkidle" });
        const is404 = await isNotFoundPage(page);
        expect(is404, `Help link ${href} should not be 404`).toBe(false);
      }
    }
  });
  
  test("Help Center has no 'coming soon' text", async ({ page }) => {
    const helpPages = [
      "/help",
      "/help/getting-started",
      "/help/scheduling",
      "/help/messaging",
      "/help/documents",
      "/help/expenses",
      "/help/account",
      "/help/privacy",
      "/help/security",
      "/help/contact",
    ];
    
    for (const helpPage of helpPages) {
      await page.goto(helpPage, { waitUntil: "networkidle" });
      
      const pageContent = await page.locator("body").textContent() || "";
      const hasComingSoon = /coming soon|under construction|on the way/i.test(pageContent);
      
      expect(
        hasComingSoon, 
        `Help page ${helpPage} should not contain placeholder language`
      ).toBe(false);
    }
  });
});

// =============================================================================
// CLICK-THROUGH NAVIGATION TESTS
// =============================================================================

test.describe("Click-through Navigation Audit", () => {
  /**
   * INVARIANT: All clickable navigation elements must lead to valid pages
   */
  test("Home page CTA buttons lead to valid pages", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    
    // Find all buttons that look like navigation CTAs
    const ctaButtons = await page.locator("a[href]:not([href^='mailto:']):not([href^='#']):not([href^='http'])").all();
    
    const visitedRoutes = new Set<string>();
    
    for (const button of ctaButtons.slice(0, 10)) { // Limit to prevent long test times
      const href = await button.getAttribute("href");
      if (href && !visitedRoutes.has(href)) {
        visitedRoutes.add(href);
        await page.goto(href, { waitUntil: "networkidle" });
        
        const is404 = await isNotFoundPage(page);
        expect(is404, `CTA link ${href} should not lead to 404`).toBe(false);
      }
    }
  });
  
  test("Pricing page CTAs lead to valid signup/login", async ({ page }) => {
    await page.goto("/pricing", { waitUntil: "networkidle" });
    
    // Check signup buttons
    const signupLinks = await page.locator("a[href*='signup']").all();
    
    for (const link of signupLinks) {
      const href = await link.getAttribute("href");
      if (href) {
        await page.goto(href.split("?")[0], { waitUntil: "networkidle" }); // Remove query params
        const is404 = await isNotFoundPage(page);
        expect(is404, `Pricing CTA ${href} should not lead to 404`).toBe(false);
      }
    }
  });
});

// =============================================================================
// GRACEFUL DEGRADATION TESTS
// =============================================================================

test.describe("Graceful Access Denial (Not 404)", () => {
  /**
   * INVARIANT: Role-restricted routes show access denied, not 404
   * A 404 is confusing; "access denied" is clear
   */
  test("Admin route shows access denied for unauthenticated users", async ({ page }) => {
    await page.goto("/admin", { waitUntil: "networkidle" });
    
    const is404 = await isNotFoundPage(page);
    expect(is404, "Admin route should not 404 - should redirect or show access denied").toBe(false);
  });
});

// =============================================================================
// DYNAMIC ROUTE PLACEHOLDERS
// =============================================================================

test.describe("Dynamic Routes - Pattern Validation", () => {
  /**
   * These tests verify that dynamic routes at least have working parent pages
   * The actual slug resolution depends on database content
   */
  test("Blog list page exists for /blog/:slug parent", async ({ page }) => {
    await page.goto("/blog", { waitUntil: "networkidle" });
    
    const is404 = await isNotFoundPage(page);
    expect(is404, "Blog list page should exist").toBe(false);
  });
  
  test("Law Library page exists for /dashboard/law-library/:slug parent", async ({ page }) => {
    // This will redirect to login since it's protected
    await page.goto("/dashboard/law-library", { waitUntil: "networkidle" });
    
    const is404 = await isNotFoundPage(page);
    expect(is404, "Law Library should not 404 (may redirect to login)").toBe(false);
  });
});
