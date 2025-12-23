// Stripe product and price configuration
export const STRIPE_TIERS = {
  premium: {
    name: "Premium",
    price: "$5",
    period: "per month",
    priceId: "price_1SgZlqHpttmwwVs1qra7Wfew",
    productId: "prod_TdrUhvfZzXYDTT",
  },
  mvp: {
    name: "MVP",
    price: "$10",
    period: "per month",
    priceId: "price_1SgZlwHpttmwwVs1Tf2hv4p7",
    productId: "prod_TdrUORgbP3ko1q",
  },
  law_office: {
    name: "Law Office",
    price: "$49",
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
