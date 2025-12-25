import { useSubscription } from "@/hooks/useSubscription";

interface PremiumAccessResult {
  hasAccess: boolean;
  loading: boolean;
  reason: "subscribed" | "trial" | "free_access" | "expired" | "none";
  daysRemaining: number | null;
}

export const usePremiumAccess = (): PremiumAccessResult => {
  const { subscribed, trial, trialEndsAt, freeAccess, loading } = useSubscription();

  if (loading) {
    return { hasAccess: false, loading: true, reason: "none", daysRemaining: null };
  }

  // Free premium access (admin-granted)
  if (freeAccess) {
    return { hasAccess: true, loading: false, reason: "free_access", daysRemaining: null };
  }

  // Active paid subscription
  if (subscribed && !trial) {
    return { hasAccess: true, loading: false, reason: "subscribed", daysRemaining: null };
  }

  // Active trial
  if (trial && trialEndsAt) {
    const now = new Date();
    const endDate = new Date(trialEndsAt);
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    if (now < endDate) {
      return { hasAccess: true, loading: false, reason: "trial", daysRemaining };
    } else {
      return { hasAccess: false, loading: false, reason: "expired", daysRemaining: 0 };
    }
  }

  return { hasAccess: false, loading: false, reason: "none", daysRemaining: null };
};
