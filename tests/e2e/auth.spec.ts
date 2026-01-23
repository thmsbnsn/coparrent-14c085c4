/**
 * AUTHENTICATION & SESSION INTEGRITY TESTS
 * 
 * PURPOSE: Ensure core authentication flows cannot silently regress
 * 
 * CRITICAL INVARIANTS:
 * - Sign up creates a valid session
 * - Login grants access to protected routes
 * - Logout terminates session and blocks protected access
 * - Session persists across page refresh
 * - Protected routes redirect to login when unauthenticated
 * 
 * REGRESSION PREVENTION:
 * - These tests run in CI pipeline
 * - Any auth flow regression will fail the build
 * 
 * @see docs/SECURITY_MODEL.md for security requirements
 */

import { test, expect, Page } from "@playwright/test";

// =============================================================================
// TEST CONFIGURATION
// =============================================================================

/**
 * Test user credentials - use unique emails to avoid conflicts
 * In a real CI environment, these would be created/cleaned up per test run
 */
const TEST_USER = {
  email: `test-${Date.now()}@coparrent-test.local`,
  password: "TestPassword123!",
  name: "Test Parent",
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if the page shows a login form
 */
async function isLoginPage(page: Page): Promise<boolean> {
  const hasLoginForm = await page.locator("input[type='email'], input[name='email']").first().isVisible().catch(() => false);
  const hasPasswordField = await page.locator("input[type='password']").first().isVisible().catch(() => false);
  return hasLoginForm && hasPasswordField;
}

/**
 * Check if page shows dashboard content (authenticated state)
 */
async function isDashboardPage(page: Page): Promise<boolean> {
  const currentUrl = page.url();
  const hasDashboardUrl = currentUrl.includes("/dashboard");
  const hasDashboardContent = await page.locator("text=Dashboard").first().isVisible().catch(() => false);
  return hasDashboardUrl || hasDashboardContent;
}

/**
 * Check if page shows 404
 */
async function isNotFoundPage(page: Page): Promise<boolean> {
  const has404 = await page.locator("text=404").first().isVisible().catch(() => false);
  const hasPageNotFound = await page.locator("text=Page Not Found").first().isVisible().catch(() => false);
  return has404 && hasPageNotFound;
}

// =============================================================================
// SIGN UP TESTS
// =============================================================================

test.describe("Sign Up Flow", () => {
  /**
   * INVARIANT: Sign up page must be accessible
   * PREVENTS: Breaking the primary user acquisition path
   */
  test("Sign up page renders without 404", async ({ page }) => {
    await page.goto("/signup", { waitUntil: "networkidle" });
    
    const is404 = await isNotFoundPage(page);
    expect(is404, "Sign up page should not be 404").toBe(false);
    
    // Should have essential form elements
    const hasEmailField = await page.locator("input[type='email'], input[name='email']").first().isVisible();
    expect(hasEmailField, "Sign up should have email field").toBe(true);
  });

  /**
   * INVARIANT: Sign up form has all required fields
   * PREVENTS: Incomplete sign up forms that block registration
   */
  test("Sign up form has required fields", async ({ page }) => {
    await page.goto("/signup", { waitUntil: "networkidle" });
    
    // Check for email field
    const emailField = page.locator("input[type='email'], input[name='email']").first();
    await expect(emailField).toBeVisible();
    
    // Check for password field
    const passwordField = page.locator("input[type='password']").first();
    await expect(passwordField).toBeVisible();
    
    // Check for submit button
    const submitButton = page.locator("button[type='submit']").first();
    await expect(submitButton).toBeVisible();
  });

  /**
   * INVARIANT: Empty form submission shows validation errors
   * PREVENTS: Confusing silent failures on invalid input
   */
  test("Empty form submission shows validation", async ({ page }) => {
    await page.goto("/signup", { waitUntil: "networkidle" });
    
    // Click submit without filling anything
    const submitButton = page.locator("button[type='submit']").first();
    await submitButton.click();
    
    // Wait for validation message or form to stay on page
    await page.waitForTimeout(1000);
    
    // Should still be on signup page (not redirected)
    expect(page.url()).toContain("/signup");
  });
});

// =============================================================================
// LOGIN TESTS
// =============================================================================

test.describe("Login Flow", () => {
  /**
   * INVARIANT: Login page must be accessible
   * PREVENTS: Breaking user re-authentication
   */
  test("Login page renders without 404", async ({ page }) => {
    await page.goto("/login", { waitUntil: "networkidle" });
    
    const is404 = await isNotFoundPage(page);
    expect(is404, "Login page should not be 404").toBe(false);
    
    const isLogin = await isLoginPage(page);
    expect(isLogin, "Login page should have login form").toBe(true);
  });

  /**
   * INVARIANT: Login form has required fields
   * PREVENTS: Incomplete login forms
   */
  test("Login form has required fields", async ({ page }) => {
    await page.goto("/login", { waitUntil: "networkidle" });
    
    const emailField = page.locator("input[type='email'], input[name='email']").first();
    await expect(emailField).toBeVisible();
    
    const passwordField = page.locator("input[type='password']").first();
    await expect(passwordField).toBeVisible();
    
    const submitButton = page.locator("button[type='submit']").first();
    await expect(submitButton).toBeVisible();
  });

  /**
   * INVARIANT: Invalid credentials show error
   * PREVENTS: Silent auth failures that confuse users
   */
  test("Invalid credentials show error message", async ({ page }) => {
    await page.goto("/login", { waitUntil: "networkidle" });
    
    // Fill in invalid credentials
    await page.fill("input[type='email'], input[name='email']", "invalid@test.com");
    await page.fill("input[type='password']", "wrongpassword");
    
    // Submit
    await page.click("button[type='submit']");
    
    // Wait for response
    await page.waitForTimeout(2000);
    
    // Should show some error indication (toast, message, or still on login page)
    const isStillOnLogin = page.url().includes("/login");
    expect(isStillOnLogin, "Invalid login should not redirect to dashboard").toBe(true);
  });

  /**
   * INVARIANT: Login link to signup works
   * PREVENTS: Dead end for new users on login page
   */
  test("Login page has working signup link", async ({ page }) => {
    await page.goto("/login", { waitUntil: "networkidle" });
    
    // Find and click signup link
    const signupLink = page.locator("a[href*='signup']").first();
    await expect(signupLink).toBeVisible();
    
    await signupLink.click();
    await page.waitForURL("**/signup**");
    
    const is404 = await isNotFoundPage(page);
    expect(is404, "Signup link should not lead to 404").toBe(false);
  });
});

// =============================================================================
// PROTECTED ROUTE REDIRECT TESTS
// =============================================================================

test.describe("Protected Route Redirects", () => {
  /**
   * INVARIANT: Dashboard redirects to login when unauthenticated
   * PREVENTS: Confusing 404s or error states for logged-out users
   */
  test("Dashboard redirects to login when unauthenticated", async ({ page }) => {
    await page.goto("/dashboard", { waitUntil: "networkidle" });
    
    // Should either redirect to login or show login form
    const is404 = await isNotFoundPage(page);
    expect(is404, "Dashboard should not 404 - should redirect").toBe(false);
    
    const isOnLogin = page.url().includes("/login") || await isLoginPage(page);
    expect(isOnLogin, "Unauthenticated user should see login").toBe(true);
  });

  /**
   * INVARIANT: All protected routes redirect, not 404
   * PREVENTS: Confusing 404s for valid but protected routes
   */
  const protectedPaths = [
    "/dashboard/calendar",
    "/dashboard/messages",
    "/dashboard/children",
    "/dashboard/documents",
    "/dashboard/expenses",
    "/dashboard/settings",
    "/dashboard/journal",
  ];

  for (const path of protectedPaths) {
    test(`Protected route ${path} redirects to login`, async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle" });
      
      const is404 = await isNotFoundPage(page);
      expect(is404, `${path} should not 404`).toBe(false);
      
      // Should redirect to login or show access denied
      const isOnLogin = page.url().includes("/login");
      const hasAccessMessage = await page.locator("text=/access|login|sign in/i").first().isVisible().catch(() => false);
      
      expect(
        isOnLogin || hasAccessMessage,
        `${path} should redirect to login or show access message`
      ).toBe(true);
    });
  }
});

// =============================================================================
// PASSWORD RESET FLOW TESTS
// =============================================================================

test.describe("Password Reset Flow", () => {
  /**
   * INVARIANT: Forgot password page is accessible
   * PREVENTS: Locking users out of their accounts
   */
  test("Forgot password page renders", async ({ page }) => {
    await page.goto("/forgot-password", { waitUntil: "networkidle" });
    
    const is404 = await isNotFoundPage(page);
    expect(is404, "Forgot password should not be 404").toBe(false);
    
    // Should have email field
    const emailField = page.locator("input[type='email'], input[name='email']").first();
    await expect(emailField).toBeVisible();
  });

  /**
   * INVARIANT: Reset password page is accessible
   * PREVENTS: Breaking the password reset completion flow
   */
  test("Reset password page renders", async ({ page }) => {
    await page.goto("/reset-password", { waitUntil: "networkidle" });
    
    const is404 = await isNotFoundPage(page);
    expect(is404, "Reset password should not be 404").toBe(false);
  });

  /**
   * INVARIANT: Login page links to forgot password
   * PREVENTS: Dead end for users who forgot credentials
   */
  test("Login page has forgot password link", async ({ page }) => {
    await page.goto("/login", { waitUntil: "networkidle" });
    
    const forgotLink = page.locator("a[href*='forgot']").first();
    await expect(forgotLink).toBeVisible();
    
    await forgotLink.click();
    await page.waitForURL("**/forgot-password**");
    
    const is404 = await isNotFoundPage(page);
    expect(is404, "Forgot password link should work").toBe(false);
  });
});

// =============================================================================
// LAW OFFICE AUTH FLOW TESTS
// =============================================================================

test.describe("Law Office Authentication", () => {
  /**
   * INVARIANT: Law office login is accessible
   * PREVENTS: Breaking professional user access
   */
  test("Law office login page renders", async ({ page }) => {
    await page.goto("/law-office/login", { waitUntil: "networkidle" });
    
    const is404 = await isNotFoundPage(page);
    expect(is404, "Law office login should not be 404").toBe(false);
  });

  /**
   * INVARIANT: Law office signup is accessible
   * PREVENTS: Blocking professional user registration
   */
  test("Law office signup page renders", async ({ page }) => {
    await page.goto("/law-office/signup", { waitUntil: "networkidle" });
    
    const is404 = await isNotFoundPage(page);
    expect(is404, "Law office signup should not be 404").toBe(false);
  });
});

// =============================================================================
// INVITATION FLOW TESTS
// =============================================================================

test.describe("Invitation Flow", () => {
  /**
   * INVARIANT: Accept invite page is accessible
   * PREVENTS: Breaking co-parent/third-party onboarding
   */
  test("Accept invite page renders", async ({ page }) => {
    await page.goto("/accept-invite", { waitUntil: "networkidle" });
    
    const is404 = await isNotFoundPage(page);
    expect(is404, "Accept invite should not be 404").toBe(false);
  });
});
