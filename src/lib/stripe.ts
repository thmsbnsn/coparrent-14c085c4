// Stripe product and price configuration
// These price IDs and product IDs must match your Stripe dashboard
// NOTE: When switching between test/live mode, update these IDs accordingly

// Test mode IDs (use when STRIPE_SECRET_KEY starts with sk_test_)
const TEST_MODE_TIERS = {
  premium: {
    name: "Premium",
    price: "$9.99",
    period: "per month",
    priceId: "price_1ShhNiHH6NsbcWgZd5TaJRr3",
    productId: "prod_Tf1Qq9jGVEyUOM",
  },
  mvp: {
    name: "MVP",
    price: "$19.99",
    period: "per month",
    priceId: "price_1ShhNkHH6NsbcWgZWIFS07Q5",
    productId: "prod_Tf1QUUhL8Tx1Ks",
  },
  law_office: {
    name: "Law Office",
    price: "$49.99",
    period: "per month",
    priceId: "price_1ShhNmHH6NsbcWgZJF025EfU",
    productId: "prod_Tf1QG2gr5j0a3z",
  },
};

// Live mode IDs (use when STRIPE_SECRET_KEY starts with sk_live_)
const LIVE_MODE_TIERS = {
  premium: {
    name: "Premium",
    price: "$12",
    period: "per month",
    priceId: "price_1SgZlqHpttmwwVs1qra7Wfew",
    productId: "prod_TdrUhvfZzXYDTT",
  },
  mvp: {
    name: "MVP",
    price: "$24",
    period: "per month",
    priceId: "price_1SgZlwHpttmwwVs1Tf2hv4p7",
    productId: "prod_TdrUORgbP3ko1q",
  },
  law_office: {
    name: "Law Office",
    price: "$99",
    period: "per month",
    priceId: "price_1SgZlyHpttmwwVs14IW8cBth",
    productId: "prod_TdrUXgQVj7yCqw",
  },
};

// Toggle this to switch between test and live mode
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
