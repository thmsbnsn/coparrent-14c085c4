/**
 * useFamilySubscription - Family-based subscription hook
 * 
 * CRITICAL: Subscription entitlements are shared across all family members.
 * If ANY member of the family has Power plan or free_premium_access,
 * ALL family members inherit that entitlement.
 * 
 * This fixes the bug where co-parents were denied access even though
 * the primary parent has free_premium_access.
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useFamily } from "@/contexts/FamilyContext";
import type { StripeTier } from "@/lib/stripe";

interface FamilySubscriptionStatus {
  /** Whether any family member has premium access */
  hasFamilyPremiumAccess: boolean;
  /** The highest tier in the family */
  familyTier: StripeTier | "free";
  /** Reason for access (if granted) */
  accessReason: string | null;
  /** Whether user personally has premium (vs inherited from family) */
  isPersonalSubscription: boolean;
  /** Loading state */
  loading: boolean;
  /** Error if any */
  error: string | null;
  /** Whether any family member is on trial */
  familyTrial: boolean;
  /** Trial end date (earliest expiring) */
  familyTrialEndsAt: string | null;
}

/**
 * Hook to check family-level subscription status.
 * 
 * ENTITLEMENT RULES:
 * 1. If user has personal premium access → granted
 * 2. If any family member has free_premium_access → ALL members get access
 * 3. If any family member has active Stripe subscription → ALL members get access
 * 4. If any family member is in trial → ALL members get access
 */
export const useFamilySubscription = (): FamilySubscriptionStatus => {
  const { user } = useAuth();
  const { activeFamilyId, loading: familyLoading } = useFamily();
  const [status, setStatus] = useState<FamilySubscriptionStatus>({
    hasFamilyPremiumAccess: false,
    familyTier: "free",
    accessReason: null,
    isPersonalSubscription: false,
    loading: true,
    error: null,
    familyTrial: false,
    familyTrialEndsAt: null,
  });

  const checkFamilySubscription = useCallback(async () => {
    if (!user) {
      setStatus({
        hasFamilyPremiumAccess: false,
        familyTier: "free",
        accessReason: null,
        isPersonalSubscription: false,
        loading: false,
        error: null,
        familyTrial: false,
        familyTrialEndsAt: null,
      });
      return;
    }

    // Wait for family context to load
    if (familyLoading) {
      return;
    }

    try {
      // 1. First check user's own profile
      const { data: userProfile, error: userError } = await supabase
        .from("profiles")
        .select("id, subscription_tier, subscription_status, free_premium_access, access_reason, trial_ends_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (userError) {
        console.error("[useFamilySubscription] Error fetching user profile:", userError);
        throw userError;
      }

      // Check if user personally has premium
      if (userProfile?.free_premium_access === true) {
        setStatus({
          hasFamilyPremiumAccess: true,
          familyTier: "power",
          accessReason: userProfile.access_reason || "Personal premium access",
          isPersonalSubscription: true,
          loading: false,
          error: null,
          familyTrial: false,
          familyTrialEndsAt: null,
        });
        return;
      }

      if (userProfile?.subscription_tier === "power" && userProfile?.subscription_status === "active") {
        setStatus({
          hasFamilyPremiumAccess: true,
          familyTier: "power",
          accessReason: "Personal subscription",
          isPersonalSubscription: true,
          loading: false,
          error: null,
          familyTrial: false,
          familyTrialEndsAt: null,
        });
        return;
      }

      // 2. Check family members for shared entitlements
      if (activeFamilyId) {
        const { data: familyMembers, error: familyError } = await supabase
          .from("family_members")
          .select(`
            profile_id,
            profiles!inner (
              id,
              subscription_tier,
              subscription_status,
              free_premium_access,
              access_reason,
              trial_ends_at
            )
          `)
          .eq("family_id", activeFamilyId)
          .eq("status", "active");

        if (familyError) {
          console.error("[useFamilySubscription] Error fetching family members:", familyError);
        }

        // Check if ANY family member has premium
        if (familyMembers && familyMembers.length > 0) {
          for (const member of familyMembers) {
            const profile = member.profiles as unknown as {
              id: string;
              subscription_tier: string | null;
              subscription_status: string | null;
              free_premium_access: boolean | null;
              access_reason: string | null;
              trial_ends_at: string | null;
            };

            // Check for free premium access
            if (profile?.free_premium_access === true) {
              console.log("[useFamilySubscription] Family member has free premium:", profile.id);
              setStatus({
                hasFamilyPremiumAccess: true,
                familyTier: "power",
                accessReason: profile.access_reason || "Family premium access",
                isPersonalSubscription: false,
                loading: false,
                error: null,
                familyTrial: false,
                familyTrialEndsAt: null,
              });
              return;
            }

            // Check for active subscription
            if (profile?.subscription_tier === "power" && profile?.subscription_status === "active") {
              setStatus({
                hasFamilyPremiumAccess: true,
                familyTier: "power",
                accessReason: "Family subscription",
                isPersonalSubscription: false,
                loading: false,
                error: null,
                familyTrial: false,
                familyTrialEndsAt: null,
              });
              return;
            }

            // Check for active trial
            if (profile?.subscription_status === "trial" && profile?.trial_ends_at) {
              const trialEnd = new Date(profile.trial_ends_at);
              if (trialEnd > new Date()) {
                setStatus({
                  hasFamilyPremiumAccess: true,
                  familyTier: "power",
                  accessReason: "Family trial",
                  isPersonalSubscription: false,
                  loading: false,
                  error: null,
                  familyTrial: true,
                  familyTrialEndsAt: profile.trial_ends_at,
                });
                return;
              }
            }
          }
        }
      }

      // 3. Check co-parent relationship (legacy)
      if (userProfile?.id) {
        const { data: coParent, error: coParentError } = await supabase
          .from("profiles")
          .select("id, subscription_tier, subscription_status, free_premium_access, access_reason, trial_ends_at")
          .eq("co_parent_id", userProfile.id)
          .maybeSingle();

        if (!coParentError && coParent) {
          if (coParent.free_premium_access === true) {
            console.log("[useFamilySubscription] Co-parent has free premium:", coParent.id);
            setStatus({
              hasFamilyPremiumAccess: true,
              familyTier: "power",
              accessReason: coParent.access_reason || "Co-parent premium access",
              isPersonalSubscription: false,
              loading: false,
              error: null,
              familyTrial: false,
              familyTrialEndsAt: null,
            });
            return;
          }

          if (coParent.subscription_tier === "power" && coParent.subscription_status === "active") {
            setStatus({
              hasFamilyPremiumAccess: true,
              familyTier: "power",
              accessReason: "Co-parent subscription",
              isPersonalSubscription: false,
              loading: false,
              error: null,
              familyTrial: false,
              familyTrialEndsAt: null,
            });
            return;
          }
        }

        // Also check if user is someone's co-parent
        const { data: linkedParent } = await supabase
          .from("profiles")
          .select("id, subscription_tier, subscription_status, free_premium_access, access_reason")
          .eq("id", userProfile.id)
          .maybeSingle();

        if (linkedParent) {
          const { data: primaryParent } = await supabase
            .from("profiles")
            .select("id, subscription_tier, subscription_status, free_premium_access, access_reason")
            .eq("co_parent_id", linkedParent.id)
            .maybeSingle();

          if (primaryParent?.free_premium_access === true) {
            setStatus({
              hasFamilyPremiumAccess: true,
              familyTier: "power",
              accessReason: primaryParent.access_reason || "Linked parent premium",
              isPersonalSubscription: false,
              loading: false,
              error: null,
              familyTrial: false,
              familyTrialEndsAt: null,
            });
            return;
          }
        }
      }

      // No premium access found
      setStatus({
        hasFamilyPremiumAccess: false,
        familyTier: "free",
        accessReason: null,
        isPersonalSubscription: false,
        loading: false,
        error: null,
        familyTrial: false,
        familyTrialEndsAt: null,
      });
    } catch (error) {
      console.error("[useFamilySubscription] Error:", error);
      setStatus(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to check subscription",
      }));
    }
  }, [user, activeFamilyId, familyLoading]);

  useEffect(() => {
    checkFamilySubscription();
  }, [checkFamilySubscription]);

  // Refresh when family changes
  useEffect(() => {
    if (activeFamilyId) {
      checkFamilySubscription();
    }
  }, [activeFamilyId, checkFamilySubscription]);

  return status;
};
