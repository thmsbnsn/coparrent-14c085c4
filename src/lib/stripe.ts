// Stripe product and price configuration
// These price IDs and product IDs must match your Stripe dashboard
// NOTE: Prefer setting VITE_STRIPE_* env vars to avoid hardcoded ID drift.

// Plan structure: Free (default) + Power ($5/month)
// Power includes: Expenses Tracking, Court Exports, Sports & Events Hub

const ENV_LIVE_POWER_PRICE_ID = import.meta.env.VITE_STRIPE_POWER_PRICE_ID as string | undefined;
const ENV_LIVE_POWER_PRODUCT_ID = import.meta.env.VITE_STRIPE_POWER_PRODUCT_ID as string | undefined;
const ENV_TEST_POWER_PRICE_ID = import.meta.env.VITE_STRIPE_TEST_POWER_PRICE_ID as string | undefined;
const ENV_TEST_POWER_PRODUCT_ID = import.meta.env.VITE_STRIPE_TEST_POWER_PRODUCT_ID as string | undefined;

// Live mode IDs (CoParrent account - acct_1Sg5Y5HH6NsbcWgZ)
const LIVE_MODE_TIERS = {
  power: {
    name: "Power",
    price: "$5",
    period: "per month",
    priceId: ENV_LIVE_POWER_PRICE_ID || "price_1Sz2IZHpttmwwVs1H4deOgQe",
    productId: ENV_LIVE_POWER_PRODUCT_ID || "prod_TwwA5VNxPgt62D",
  },
};

// Test mode IDs (sandbox) - same account, different environment
const TEST_MODE_TIERS = {
  power: {
    name: "Power",
    price: "$5",
    period: "per month",
    priceId: ENV_TEST_POWER_PRICE_ID || "price_1ShhNiHH6NsbcWgZd5TaJRr3",
    productId: ENV_TEST_POWER_PRODUCT_ID || "prod_Tf1Qq9jGVEyUOM",
  },
};

// Legacy product ID mappings for migration - old subscribers map to "power"
export const LEGACY_PRODUCT_MAPPING: Record<string, string> = {
  // Live mode legacy products
  "prod_TnoLYRDnjKqtA8": "power", // Old Premium
  "prod_TnoLKasOQOvLwL": "power", // Old MVP
  // Test mode legacy products
  "prod_Tf1Qq9jGVEyUOM": "power", // Old Premium (test)
  "prod_Tf1QUUhL8Tx1Ks": "power", // Old MVP (test)
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
  
  // Check current tier products first
  for (const [tier, config] of Object.entries(STRIPE_TIERS)) {
    if (config.productId === productId) {
      return tier as StripeTier;
    }
  }
  
  // Check legacy product mappings
  const legacyTier = LEGACY_PRODUCT_MAPPING[productId];
  if (legacyTier) {
    return legacyTier as StripeTier;
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
