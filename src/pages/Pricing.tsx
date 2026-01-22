import { motion } from "framer-motion";
import { Check, Loader2, Sparkles, Zap } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { StripeTier } from "@/lib/stripe";
import { Badge } from "@/components/ui/badge";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Essential co-parenting tools for families",
    features: [
      { text: "Up to 4 child profiles", included: true },
      { text: "Shared custody calendar", included: true },
      { text: "Messaging with co-parent", included: true },
      { text: "Child info hub", included: true },
      { text: "Photo gallery albums", included: true },
      { text: "Document vault", included: true },
      { text: "Kids fun center", included: true },
      { text: "Law library access", included: true },
      { text: "Up to 4 family member accounts", included: true },
    ],
    cta: "Start Free",
    variant: "outline" as const,
    popular: false,
    stripeTier: null as StripeTier | null,
  },
  {
    name: "Power",
    price: "$5",
    period: "per month",
    description: "Full features for active co-parents",
    features: [
      { text: "Everything in Free", included: true },
      { text: "Up to 6 child profiles", included: true },
      { text: "Up to 6 family member accounts", included: true },
      { text: "Expense tracking & reports", included: true },
      { text: "Court-ready document exports", included: true },
      { text: "Sports & events hub", included: true },
      { text: "AI message assistance", included: true },
      { text: "Priority email support", included: true },
    ],
    cta: "Upgrade to Power",
    variant: "default" as const,
    popular: true,
    stripeTier: "power" as StripeTier,
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const { tier: currentTier, subscribed, loading, checkoutLoading, createCheckout } = useSubscription();

  useEffect(() => {
    if (searchParams.get("canceled") === "true") {
      toast({
        title: "Checkout canceled",
        description: "You can try again when you're ready.",
      });
    }
  }, [searchParams, toast]);

  const handleSubscribe = async (tier: typeof tiers[number]) => {
    if (!tier.stripeTier) {
      if (!user) {
        navigate("/signup");
      } else {
        toast({
          title: "You're on the free plan",
          description: "Upgrade to Power for premium features.",
        });
      }
      return;
    }

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in or create an account to subscribe.",
      });
      navigate("/signup");
      return;
    }

    await createCheckout(tier.stripeTier);
  };

  // Normalize tier for comparison (legacy tiers map to power)
  const normalizedTier = (currentTier as string) === "premium" || (currentTier as string) === "mvp" ? "power" : currentTier;

  const isCurrentPlan = (tier: typeof tiers[number]) => {
    if (!tier.stripeTier && normalizedTier === "free" && !subscribed) return true;
    if (tier.stripeTier === normalizedTier && subscribed) return true;
    return false;
  };

  const isButtonDisabled = (tier: typeof tiers[number]) => {
    if (loading || checkoutLoading) return true;
    if (isCurrentPlan(tier)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 lg:pt-32 pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-16">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl font-display font-bold mb-6"
            >
              Simple, transparent pricing
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground"
            >
              Start free with essential features. Upgrade to Power when you need more.
            </motion.p>
          </div>

          {/* Pricing Grid - 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-3xl mx-auto">
            {tiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "relative rounded-2xl p-6 lg:p-8 border bg-card",
                  tier.popular
                    ? "border-primary shadow-lg ring-1 ring-primary"
                    : "border-border"
                )}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Recommended
                  </div>
                )}

                {/* Tier Header */}
                <div className="mb-6">
                  <h3 className="text-lg font-display font-semibold mb-2 flex items-center gap-2">
                    {tier.name}
                    {tier.popular && <Sparkles className="w-4 h-4 text-primary" />}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-display font-bold">{tier.price}</span>
                    <span className="text-muted-foreground text-sm">/{tier.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature.text}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  variant={isCurrentPlan(tier) ? "outline" : tier.variant}
                  className={cn("w-full", isCurrentPlan(tier) && "border-success text-success")}
                  onClick={() => handleSubscribe(tier)}
                  disabled={isButtonDisabled(tier)}
                >
                  {(loading || checkoutLoading) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isCurrentPlan(tier) ? (
                    "Current Plan"
                  ) : (
                    tier.cta
                  )}
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-24 max-w-3xl mx-auto"
          >
            <h2 className="text-2xl font-display font-bold text-center mb-8">
              Compare plans
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 font-medium">Feature</th>
                    <th className="text-center py-4 px-4 font-medium">Free</th>
                    <th className="text-center py-4 px-4 font-medium text-primary">Power</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    ["Child profiles", "4", "6"],
                    ["Family member accounts", "4", "6"],
                    ["Custody calendar", "✓", "✓"],
                    ["Messaging", "✓", "✓"],
                    ["Child info hub", "✓", "✓"],
                    ["Photo gallery", "✓", "✓"],
                    ["Document vault", "✓", "✓"],
                    ["Kids fun center", "✓", "✓"],
                    ["Law library", "✓", "✓"],
                    ["Expense tracking", "—", "✓"],
                    ["Court-ready exports", "—", "✓"],
                    ["Sports & events hub", "—", "✓"],
                    ["AI message assistance", "—", "✓"],
                    ["Priority support", "—", "✓"],
                  ].map(([feature, ...values], i) => (
                    <tr key={feature} className={cn("border-b border-border/50", i % 2 === 0 && "bg-muted/30")}>
                      <td className="py-3 px-4">{feature}</td>
                      {values.map((value, j) => (
                        <td key={j} className="text-center py-3 px-4 text-muted-foreground">
                          {value === "✓" ? (
                            <Check className="w-5 h-5 text-success mx-auto" />
                          ) : (
                            value
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* FAQ/Trust Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16 max-w-2xl mx-auto text-center"
          >
            <p className="text-sm text-muted-foreground">
              No credit card required for free plan. Cancel Power subscription anytime.
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
