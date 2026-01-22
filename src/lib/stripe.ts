// Stripe product and price configuration
// These price IDs and product IDs must match your Stripe dashboard
// NOTE: When switching between test/live mode, update these IDs accordingly

// Live mode IDs (CoParrent account - acct_1Sg5Y5HH6NsbcWgZ)
const LIVE_MODE_TIERS = {
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

// Test mode IDs (sandbox) - same account, different environment
const TEST_MODE_TIERS = {
  premium: {
    name: "Premium",
    price: "$5",
    period: "per month",
    priceId: "price_1ShhNiHH6NsbcWgZd5TaJRr3",
    productId: "prod_Tf1Qq9jGVEyUOM",
  },
  mvp: {
    name: "MVP",
    price: "$10",
    period: "per month",
    priceId: "price_1ShhNkHH6NsbcWgZWIFS07Q5",
    productId: "prod_Tf1QUUhL8Tx1Ks",
  },
};

// PRODUCTION MODE ENABLED
// Set to true to use sandbox/test mode for development
const USE_TEST_MODE = false;

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
