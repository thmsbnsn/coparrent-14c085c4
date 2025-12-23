// Stripe product and price configuration
// These price IDs and product IDs must match your Stripe dashboard
export const STRIPE_TIERS = {
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
} as const;

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
