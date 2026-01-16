import { motion } from "framer-motion";
import { Check, Loader2, FlaskConical, Sparkles } from "lucide-react";
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
    name: "Free Forever",
    price: "$0",
    period: "forever",
    description: "Get started with essential co-parenting tools",
    features: [
      { text: "Core parenting calendar", included: true },
      { text: "Basic messaging with co-parent", included: true },
      { text: "1 child profile", included: true },
      { text: "30-day message history", included: true },
      { text: "Email notifications", included: true },
    ],
    cta: "Start Free",
    variant: "outline" as const,
    popular: false,
    stripeTier: null as StripeTier | null,
  },
  {
    name: "Premium",
    price: "$5",
    period: "per month",
    description: "Full features for active co-parents",
    features: [
      { text: "Everything in Free", included: true },
      { text: "Unlimited child profiles", included: true },
      { text: "Full message history", included: true },
      { text: "AI message rewrite & tone analysis", included: true, beta: true },
      { text: "Sports & activities hub", included: true, beta: true },
      { text: "Court-ready document exports", included: true },
      { text: "Smart exchange reminders", included: true, beta: true },
      { text: "Priority email support", included: true },
    ],
    cta: "Start Premium Trial",
    variant: "default" as const,
    popular: true,
    stripeTier: "premium" as StripeTier,
  },
  {
    name: "MVP",
    price: "$10",
    period: "per month",
    description: "For power users & founding members",
    features: [
      { text: "Everything in Premium", included: true },
      { text: "Early access to new features", included: true },
      { text: "AI schedule suggestions", included: true, beta: true },
      { text: "Priority support", included: true },
      { text: "Beta feature influence", included: true },
      { text: "Founding member badge", included: true, badge: true },
    ],
    cta: "Join as MVP",
    variant: "outline" as const,
    popular: false,
    stripeTier: "mvp" as StripeTier,
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
          description: "Upgrade to access premium features.",
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

  const isCurrentPlan = (tier: typeof tiers[number]) => {
    if (!tier.stripeTier && currentTier === "free" && !subscribed) return true;
    if (tier.stripeTier === currentTier && subscribed) return true;
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
              Start free, upgrade when you're ready. All paid plans include a 14-day free trial.
            </motion.p>
          </div>

          {/* Pricing Grid - 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
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
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    Most Popular
                  </div>
                )}

                {/* Tier Header */}
                <div className="mb-6">
                  <h3 className="text-lg font-display font-semibold mb-2">{tier.name}</h3>
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
                      <span className="text-sm flex items-center gap-2 flex-wrap">
                        {feature.text}
                        {feature.beta && (
                          <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
                            <FlaskConical className="w-3 h-3 mr-1" />
                            Beta
                          </Badge>
                        )}
                        {feature.badge && (
                          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Exclusive
                          </Badge>
                        )}
                      </span>
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
            transition={{ delay: 0.5 }}
            className="mt-24 max-w-4xl mx-auto"
          >
            <h2 className="text-2xl font-display font-bold text-center mb-8">
              Compare all features
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 font-medium">Feature</th>
                    <th className="text-center py-4 px-4 font-medium">Free</th>
                    <th className="text-center py-4 px-4 font-medium text-primary">Premium</th>
                    <th className="text-center py-4 px-4 font-medium">MVP</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    ["Parenting calendar", "Basic", "Advanced", "Advanced"],
                    ["Child profiles", "1", "Unlimited", "Unlimited"],
                    ["Message history", "30 days", "Full", "Full"],
                    ["Messaging", "✓", "✓", "✓"],
                    ["AI message assist", "—", "Beta", "Beta"],
                    ["Sports & activities hub", "—", "Beta", "Beta"],
                    ["Court-ready exports", "—", "✓", "✓"],
                    ["Smart reminders", "—", "Beta", "Beta"],
                    ["AI schedule suggestions", "—", "—", "Beta"],
                    ["Early access features", "—", "—", "✓"],
                    ["Priority support", "—", "Email", "Priority"],
                    ["Founding member badge", "—", "—", "✓"],
                  ].map(([feature, ...values], i) => (
                    <tr key={feature} className={cn("border-b border-border/50", i % 2 === 0 && "bg-muted/30")}>
                      <td className="py-3 px-4">{feature}</td>
                      {values.map((value, j) => (
                        <td key={j} className="text-center py-3 px-4 text-muted-foreground">
                          {value === "✓" ? (
                            <Check className="w-5 h-5 text-success mx-auto" />
                          ) : value === "Beta" ? (
                            <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
                              Beta
                            </Badge>
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
            transition={{ delay: 0.6 }}
            className="mt-16 max-w-2xl mx-auto text-center"
          >
            <p className="text-sm text-muted-foreground">
              No credit card required for free plan. Cancel paid plans anytime.
              <br />
              <span className="text-xs">Features marked as "Beta" are under active development.</span>
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
