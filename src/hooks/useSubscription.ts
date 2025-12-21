import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { STRIPE_TIERS, StripeTier } from "@/lib/stripe";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionStatus {
  subscribed: boolean;
  tier: StripeTier | "free";
  subscriptionEnd: string | null;
  loading: boolean;
  freeAccess: boolean;
  accessReason: string | null;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    tier: "free",
    subscriptionEnd: null,
    loading: true,
    freeAccess: false,
    accessReason: null,
  });

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setStatus({ subscribed: false, tier: "free", subscriptionEnd: null, loading: false, freeAccess: false, accessReason: null });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      
      if (error) throw error;

      setStatus({
        subscribed: data.subscribed || data.free_access,
        tier: data.tier || "free",
        subscriptionEnd: data.subscription_end,
        loading: false,
        freeAccess: data.free_access || false,
        accessReason: data.access_reason || null,
      });
    } catch (error) {
      console.error("Error checking subscription:", error);
      setStatus(prev => ({ ...prev, loading: false }));
    }
  }, [user]);

  useEffect(() => {
    checkSubscription();
    
    // Auto-refresh every minute
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [checkSubscription]);

  const createCheckout = async (tier: StripeTier) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to subscribe.",
        variant: "destructive",
      });
      return;
    }

    try {
      const priceId = STRIPE_TIERS[tier].priceId;
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch (error: any) {
      toast({
        title: "Checkout failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openCustomerPortal = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");

      if (error) throw error;

      if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch (error: any) {
      toast({
        title: "Portal access failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Helper to check if user has premium access (either paid or free)
  const hasPremiumAccess = status.subscribed || status.freeAccess;

  return {
    ...status,
    hasPremiumAccess,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
  };
};
