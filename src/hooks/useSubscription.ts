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
  error: string | null;
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
    error: null,
  });
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setStatus({ 
        subscribed: false, 
        tier: "free", 
        subscriptionEnd: null, 
        loading: false, 
        freeAccess: false, 
        accessReason: null,
        error: null 
      });
      return;
    }

    try {
      console.log("[useSubscription] Checking subscription status...");
      const { data, error } = await supabase.functions.invoke("check-subscription");
      
      if (error) {
        console.error("[useSubscription] Error checking subscription:", error);
        throw error;
      }

      console.log("[useSubscription] Subscription data received:", data);

      setStatus({
        subscribed: data.subscribed || data.free_access,
        tier: data.tier || "free",
        subscriptionEnd: data.subscription_end,
        loading: false,
        freeAccess: data.free_access || false,
        accessReason: data.access_reason || null,
        error: null,
      });
    } catch (error: any) {
      console.error("[useSubscription] Error:", error);
      setStatus(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || "Failed to check subscription" 
      }));
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

    setCheckoutLoading(true);
    console.log("[useSubscription] Creating checkout for tier:", tier);

    try {
      const priceId = STRIPE_TIERS[tier].priceId;
      console.log("[useSubscription] Using price ID:", priceId);
      
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });

      if (error) {
        console.error("[useSubscription] Checkout error:", error);
        throw error;
      }

      console.log("[useSubscription] Checkout session created:", data);

      if (data.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error: any) {
      console.error("[useSubscription] Checkout failed:", error);
      toast({
        title: "Checkout failed",
        description: error.message || "Unable to start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to manage your subscription.",
        variant: "destructive",
      });
      return;
    }

    setPortalLoading(true);
    console.log("[useSubscription] Opening customer portal...");

    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");

      if (error) {
        console.error("[useSubscription] Portal error:", error);
        throw error;
      }

      console.log("[useSubscription] Portal session created:", data);

      if (data.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error("No portal URL returned");
      }
    } catch (error: any) {
      console.error("[useSubscription] Portal failed:", error);
      toast({
        title: "Portal access failed",
        description: error.message || "Unable to open billing portal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPortalLoading(false);
    }
  };

  // Helper to check if user has premium access (either paid or free)
  const hasPremiumAccess = status.subscribed || status.freeAccess;

  return {
    ...status,
    hasPremiumAccess,
    checkoutLoading,
    portalLoading,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
  };
};
