/**
 * CORE FEATURE FLOW TESTS
 * 
 * PURPOSE: Ensure critical user journeys cannot silently break
 * 
 * CRITICAL FLOWS:
 * - Parenting Calendar: view + navigation
 * - Messaging Hub: access thread view
 * - Expenses: view expense list
 * - Documents: access document view
 * - Help Center: all navigation works
 * 
 * REGRESSION PREVENTION:
 * - Core feature route changes will fail the build
 * - Missing semantic content will be caught
 * - NotFound or error boundaries trigger failures
 * 
 * @see src/lib/routes.ts for route definitions
 */

import { test, expect, Page } from "@playwright/test";

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if page shows 404
 */
async function isNotFoundPage(page: Page): Promise<boolean> {
  const has404 = await page.locator("text=404").first().isVisible().catch(() => false);
  const hasPageNotFound = await page.locator("text=Page Not Found").first().isVisible().catch(() => false);
  return has404 && hasPageNotFound;
}

/**
 * Check if page shows error boundary
 */
async function hasErrorBoundary(page: Page): Promise<boolean> {
  const patterns = [
    "Something went wrong",
    "error occurred",
    "crashed",
    "unexpected error",
  ];
  
  for (const pattern of patterns) {
    const found = await page.locator(`text=/${pattern}/i`).first().isVisible().catch(() => false);
    if (found) return true;
  }
  return false;
}

/**
 * Check if redirected to login
 */
async function isLoginRedirect(page: Page): Promise<boolean> {
  return page.url().includes("/login");
}

// =============================================================================
// PARENTING CALENDAR TESTS
// =============================================================================

test.describe("Parenting Calendar Flow", () => {
  /**
   * INVARIANT: Calendar route exists and redirects properly
   * PREVENTS: Breaking the primary scheduling interface
   */
  test("Calendar route is registered", async ({ page }) => {
    await page.goto("/dashboard/calendar", { waitUntil: "networkidle" });
    
    const is404 = await isNotFoundPage(page);
    expect(is404, "Calendar should not be 404").toBe(false);
    
    // Should redirect to login (unauthenticated)
    const isOnLogin = await isLoginRedirect(page);
    expect(isOnLogin, "Calendar should redirect to login when unauthenticated").toBe(true);
  });

  /**
   * INVARIANT: Calendar help documentation exists
   * PREVENTS: Users having no guidance on scheduling
   */
  test("Calendar help page exists", async ({ page }) => {
    await page.goto("/help/scheduling", { waitUntil: "networkidle" });
    
    const is404 = await isNotFoundPage(page);
    expect(is404, "Scheduling help should not be 404").toBe(false);
    
    // Should have scheduling content
    const pageContent = await page.locator("body").textContent() || "";
    const hasSchedulingInfo = /calendar|schedule|custody|parenting time/i.test(pageContent);
    expect(hasSchedulingInfo, "Should have scheduling information").toBe(true);
  });

  /**
   * INVARIANT: Schedule change requests help exists
   * PREVENTS: Users not knowing how to request changes
   */
  test("Schedule change requests help exists", async ({ page }) => {
    await page.goto("/help/scheduling/change-requests", { waitUntil: "networkidle" });
    
    const is404 = await isNotFoundPage(page);
    expect(is404, "Change requests help should not be 404").toBe(false);
  });

  /**
   * INVARIANT: Schedule patterns help exists
   * PREVENTS: Users not understanding custody patterns
   */
  test("Schedule patterns help exists", async ({ page }) => {
    await page.goto("/help/scheduling/patterns", { waitUntil: "networkidle" });
    
    const is404 = await isNotFoundPage(page);
    expect(is404, "Patterns help should not be 404").toBe(false);
  });
});

// =============================================================================
// MESSAGING HUB TESTS
// =============================================================================

test.describe("Messaging Hub Flow", () => {
  /**
   * INVARIANT: Messages route exists and redirects properly
   * PREVENTS: Breaking the communication interface
   */
  test("Messages route is registered", async ({ page }) => {
    await page.goto("/dashboard/messages", { waitUntil: "networkidle" });
    
    const is404 = await isNotFoundPage(page);
    expect(is404, "Messages should not be 404").toBe(false);
    
    const isOnLogin = await isLoginRedirect(page);
    expect(isOnLogin, "Messages should redirect to login when unauthenticated").toBe(true);
  });

  /**
   * INVARIANT: Messaging help documentation exists
   * PREVENTS: Users having no guidance on messaging
   */
  test("Messaging help page exists", async ({ page }) => {
    await page.goto("/help/messaging", { waitUntil: "networkidle" });
    
    const is404 = await isNotFoundPage(page);
    expect(is404, "Messaging help should not be 404").toBe(false);
    
    const pageContent = await page.locator("body").textContent() || "";
    const hasMessagingInfo = /message|communication|chat|thread/i.test(pageContent);
    expect(hasMessagingInfo, "Should have messaging information").toBe(true);
  });
});

// =============================================================================
// EXPENSES TESTS
// =============================================================================

test.describe("Expenses Flow", () => {
  /**
   * INVARIANT: Expenses route exists and redirects properly
   * PREVENTS: Breaking the financial tracking interface
   */
  test("Expenses route is registered", async ({ page }) => {
    await page.goto("/dashboard/expenses", { waitUntil: "networkidle" });
    
    const is404 = await isNotFoundPage(page);
    expect(is404, "Expenses should not be 404").toBe(false);
    
    const isOnLogin = await isLoginRedirect(page);
    expect(isOnLogin, "Expenses should redirect to login when unauthenticated").toBe(true);
  });

  /**
   * INVARIANT: Expenses help documentation exists
   * PREVENTS: Users having no guidance on expense tracking
   */
  test("Expenses help page exists", async ({ page }) => {
    await page.goto("/help/expenses", { waitUntil: "networkidle" });
    
    const is404 = await isNotFoundPage(page);
    expect(is404, "Expenses help should not be 404").toBe(false);
    
    const pageContent = await page.locator("body").textContent() || "";
    const hasExpenseInfo = /expense|cost|payment|reimburse|split/i.test(pageContent);
    expect(hasExpenseInfo, "Should have expense information").toBe(true);
  });
});

// =============================================================================
// DOCUMENTS TESTS
// =============================================================================

test.describe("Documents Flow", () => {
  /**
   * INVARIANT: Documents route exists and redirects properly
   * PREVENTS: Breaking the document management interface
   */
  test("Documents route is registered", async ({ page }) => {
    await page.goto("/dashboard/documents", { waitUntil: "networkidle" });
    
    const is404 = await isNotFoundPage(page);
    expect(is404, "Documents should not be 404").toBe(false);
    
    const isOnLogin = await isLoginRedirect(page);
    expect(isOnLogin, "Documents should redirect to login when unauthenticated").toBe(true);
  });

  /**
   * INVARIANT: Documents help documentation exists
   * PREVENTS: Users having no guidance on documents
   */
  test("Documents help page exists", async ({ page }) => {
    await page.goto("/help/documents", { waitUntil: "networkidle" });
    
    const is404 = await isNotFoundPage(page);
    expect(is404, "Documents help should not be 404").toBe(false);
  });

  /**
   * INVARIANT: Document exports help exists
   * PREVENTS: Users not knowing how to export documents
   */
  test("Document exports help exists", async ({ page }) => {
    await page.goto("/help/documents/exports", { waitUntil: "networkidle" });
    
    const is404 = await isNotFoundPage(page);
    expect(is404, "Exports help should not be 404").toBe(false);
  });
});

// =============================================================================
// COURT RECORDS TESTS
// =============================================================================

test.describe("Court Records Flow", () => {
  /**
   * INVARIANT: Court records page exists (public access for information)
   * PREVENTS: Breaking the court export information page
   */
  test("Court records page exists", async ({ page }) => {
    await page.goto("/court-records", { waitUntil: "networkidle" });
    
    const is404 = await isNotFoundPage(page);
    expect(is404, "Court records should not be 404").toBe(false);
  });
});

// =============================================================================
// HELP CENTER COMPLETENESS
// =============================================================================

test.describe("Help Center Navigation", () => {
  const helpPages = [
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
  ];

  /**
   * INVARIANT: All help pages exist and render content
   * PREVENTS: Dead ends in help center
   */
  for (const helpPage of helpPages) {
    test(`Help page ${helpPage} renders without 404`, async ({ page }) => {
      await page.goto(helpPage, { waitUntil: "networkidle" });
      
      const is404 = await isNotFoundPage(page);
      expect(is404, `${helpPage} should not be 404`).toBe(false);
      
      const hasError = await hasErrorBoundary(page);
      expect(hasError, `${helpPage} should not show error boundary`).toBe(false);
      
      // Should have meaningful content
      const pageContent = await page.locator("body").textContent() || "";
      expect(pageContent.length, `${helpPage} should have content`).toBeGreaterThan(100);
    });
  }

  /**
   * INVARIANT: Help center has no "coming soon" placeholders
   * PREVENTS: Unhelpful placeholder content
   */
  test("Help Center has no placeholder content", async ({ page }) => {
    for (const helpPage of helpPages) {
      await page.goto(helpPage, { waitUntil: "networkidle" });
      
      const pageContent = await page.locator("body").textContent() || "";
      const hasPlaceholder = /coming soon|under construction|on the way|placeholder/i.test(pageContent);
      
      expect(
        hasPlaceholder,
        `${helpPage} should not have placeholder content`
      ).toBe(false);
    }
  });
});

// =============================================================================
// SETTINGS FLOW TESTS
// =============================================================================

test.describe("Settings Flow", () => {
  /**
   * INVARIANT: Settings route exists
   * PREVENTS: Breaking account management
   */
  test("Settings route is registered", async ({ page }) => {
    await page.goto("/dashboard/settings", { waitUntil: "networkidle" });
    
    const is404 = await isNotFoundPage(page);
    expect(is404, "Settings should not be 404").toBe(false);
  });

  /**
   * INVARIANT: Account help exists
   * PREVENTS: Users having no guidance on account management
   */
  test("Account help page exists", async ({ page }) => {
    await page.goto("/help/account", { waitUntil: "networkidle" });
    
    const is404 = await isNotFoundPage(page);
    expect(is404, "Account help should not be 404").toBe(false);
  });
});

// =============================================================================
// JOURNAL FLOW TESTS
// =============================================================================

test.describe("Journal Flow", () => {
  /**
   * INVARIANT: Journal route exists
   * PREVENTS: Breaking the journaling feature
   */
  test("Journal route is registered", async ({ page }) => {
    await page.goto("/dashboard/journal", { waitUntil: "networkidle" });
    
    const is404 = await isNotFoundPage(page);
    expect(is404, "Journal should not be 404").toBe(false);
    
    const isOnLogin = await isLoginRedirect(page);
    expect(isOnLogin, "Journal should redirect to login when unauthenticated").toBe(true);
  });
});

// =============================================================================
// KIDS HUB FLOW TESTS
// =============================================================================

test.describe("Kids Hub Flow", () => {
  const kidsHubRoutes = [
    "/dashboard/kids-hub",
    "/dashboard/kids-hub/nurse-nancy",
    "/dashboard/kids-hub/coloring-pages",
    "/dashboard/kids-hub/chore-chart",
    "/dashboard/kids-hub/activities",
    "/dashboard/kids-hub/creations",
  ];

  /**
   * INVARIANT: Kids Hub routes exist
   * PREVENTS: Breaking child-focused features
   */
  for (const route of kidsHubRoutes) {
    test(`Kids Hub route ${route} is registered`, async ({ page }) => {
      await page.goto(route, { waitUntil: "networkidle" });
      
      const is404 = await isNotFoundPage(page);
      expect(is404, `${route} should not be 404`).toBe(false);
    });
  }
});

// =============================================================================
// LAW LIBRARY FLOW TESTS
// =============================================================================

test.describe("Law Library Flow", () => {
  /**
   * INVARIANT: Law library route exists
   * PREVENTS: Breaking legal resources access
   */
  test("Law library route is registered", async ({ page }) => {
    await page.goto("/dashboard/law-library", { waitUntil: "networkidle" });
    
    const is404 = await isNotFoundPage(page);
    expect(is404, "Law library should not be 404").toBe(false);
  });
});

// =============================================================================
// BLOG FLOW TESTS
// =============================================================================

test.describe("Blog Flow", () => {
  /**
   * INVARIANT: Public blog exists
   * PREVENTS: Breaking content marketing
   */
  test("Public blog page exists", async ({ page }) => {
    await page.goto("/blog", { waitUntil: "networkidle" });
    
    const is404 = await isNotFoundPage(page);
    expect(is404, "Blog should not be 404").toBe(false);
  });

  /**
   * INVARIANT: Dashboard blog exists
   * PREVENTS: Breaking internal blog access
   */
  test("Dashboard blog route exists", async ({ page }) => {
    await page.goto("/dashboard/blog", { waitUntil: "networkidle" });
    
    const is404 = await isNotFoundPage(page);
    expect(is404, "Dashboard blog should not be 404").toBe(false);
  });
});

// =============================================================================
// SPORTS / ACTIVITIES FLOW TESTS
// =============================================================================

test.describe("Sports & Activities Flow", () => {
  /**
   * INVARIANT: Sports route exists
   * PREVENTS: Breaking activity scheduling
   */
  test("Sports route is registered", async ({ page }) => {
    await page.goto("/dashboard/sports", { waitUntil: "networkidle" });
    
    const is404 = await isNotFoundPage(page);
    expect(is404, "Sports should not be 404").toBe(false);
  });
});

// =============================================================================
// GIFTS FLOW TESTS
// =============================================================================

test.describe("Gifts Flow", () => {
  /**
   * INVARIANT: Gifts route exists
   * PREVENTS: Breaking gift registry feature
   */
  test("Gifts route is registered", async ({ page }) => {
    await page.goto("/dashboard/gifts", { waitUntil: "networkidle" });
    
    const is404 = await isNotFoundPage(page);
    expect(is404, "Gifts should not be 404").toBe(false);
  });
});
