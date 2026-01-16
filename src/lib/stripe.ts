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
// TODO: Create live mode products with same pricing when ready for production
const LIVE_MODE_TIERS = {
  premium: {
    name: "Premium",
    price: "$5",
    period: "per month",
    priceId: "price_1SgZlqHpttmwwVs1qra7Wfew", // Update with new live price ID
    productId: "prod_TdrUhvfZzXYDTT", // Update with new live product ID
  },
  mvp: {
    name: "MVP",
    price: "$10",
    period: "per month",
    priceId: "price_1SgZlwHpttmwwVs1Tf2hv4p7", // Update with new live price ID
    productId: "prod_TdrUORgbP3ko1q", // Update with new live product ID
  },
};

// Toggle this to switch between test and live mode
// Set to false for production with live Stripe keys
const USE_TEST_MODE = true;

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
