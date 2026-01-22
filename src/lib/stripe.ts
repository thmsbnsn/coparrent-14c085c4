// Stripe product and price configuration
// These price IDs and product IDs must match your Stripe dashboard
// NOTE: When switching between test/live mode, update these IDs accordingly

// Test mode IDs (use when STRIPE_SECRET_KEY starts with sk_test_)
const TEST_MODE_TIERS = {
  premium: {
    name: "Premium",
    price: "$5",
    period: "per month",
    priceId: "price_1SqCiwHH6NsbcWgZB7TfWnhQ",
    productId: "prod_TnoLYRDnjKqtA8",
  },
  mvp: {
    name: "MVP",
    price: "$10",
    period: "per month",
    priceId: "price_1SqCiyHH6NsbcWgZ8qD5XfWu",
    productId: "prod_TnoLKasOQOvLwL",
  },
};

// Live mode IDs (use when STRIPE_SECRET_KEY starts with sk_live_)
// IMPORTANT: Before going live, create products in Stripe Dashboard live mode
// and update these IDs with the live mode product/price IDs
const LIVE_MODE_TIERS = {
  premium: {
    name: "Premium",
    price: "$5",
    period: "per month",
    priceId: "", // Set your live price ID (price_live_...)
    productId: "", // Set your live product ID (prod_...)
  },
  mvp: {
    name: "MVP",
    price: "$10",
    period: "per month",
    priceId: "", // Set your live price ID (price_live_...)
    productId: "", // Set your live product ID (prod_...)
  },
};

// Toggle this to switch between test and live mode
// Set to false for production with live Stripe keys
// CRITICAL: Ensure STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET are live keys when false
const USE_TEST_MODE = true;

// Helper to check if we're in test mode based on secret key prefix
export const isStripeTestMode = () => USE_TEST_MODE;

export const STRIPE_TIERS = USE_TEST_MODE ? TEST_MODE_TIERS : LIVE_MODE_TIERS;

export type StripeTier = keyof typeof STRIPE_TIERS;

export const getTierFromProductId = (productId: string | null): StripeTier | "free" => {
  if (!productId) return "free";
  for (const [tier, config] of Object.entries(STRIPE_TIERS)) {
    if (config.productId === productId) {
      return tier as StripeTier;
    }
  }
  return "free";
};

export const getTierFromPriceId = (priceId: string | null): StripeTier | "free" => {
  if (!priceId) return "free";
  for (const [tier, config] of Object.entries(STRIPE_TIERS)) {
    if (config.priceId === priceId) {
      return tier as StripeTier;
    }
  }
  return "free";
};
