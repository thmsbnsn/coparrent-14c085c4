import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFamilySubscription } from "@/hooks/useFamilySubscription";
import { Skeleton } from "@/components/ui/skeleton";
import { recordPremiumDenial } from "@/lib/denialTelemetry";
import { useFamilyRole } from "@/hooks/useFamilyRole";
import { useFamily } from "@/contexts/FamilyContext";

interface PremiumFeatureGateProps {
  children: ReactNode;
  featureName?: string;
  /** Show inline message instead of full card overlay */
  inline?: boolean;
  /** Show nothing instead of upgrade prompt when locked */
  hideWhenLocked?: boolean;
  /** Custom fallback component */
  fallback?: ReactNode;
}

/**
 * PremiumFeatureGate - Plan-based access control
 * 
 * CRITICAL: Uses family-level entitlements, NOT individual user tier.
 * If ANY family member has Power plan, ALL family members get access.
 * 
 * This is DIFFERENT from RoleGate which checks role (parent/third-party).
 * - RoleGate = "Can this role use this feature?" (e.g., third-party can't edit)
 * - PremiumFeatureGate = "Does this family have the plan?" (e.g., Power required)
 */
export const PremiumFeatureGate = ({
  children,
  featureName = "This feature",
  inline = false,
  hideWhenLocked = false,
  fallback,
}: PremiumFeatureGateProps) => {
  const navigate = useNavigate();
  const { hasFamilyPremiumAccess, familyTier, familyTrial, loading } = useFamilySubscription();
  const { isParent } = useFamilyRole();
  const { activeFamily } = useFamily();

  const isExpired = familyTier === "free" && !hasFamilyPremiumAccess;

  // Record telemetry when access is denied
  useEffect(() => {
    if (!loading && !hasFamilyPremiumAccess) {
      recordPremiumDenial(
        featureName,
        familyTier || "free",
        "premium_required"
      );
    }
  }, [loading, hasFamilyPremiumAccess, featureName, familyTier]);

  if (loading) {
    return inline ? (
      <Skeleton className="h-8 w-full" />
    ) : (
      <Card className="border-dashed">
        <CardContent className="p-6">
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (hasFamilyPremiumAccess) {
    return <>{children}</>;
  }

  if (hideWhenLocked) {
    return null;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  // Build clear messaging that distinguishes PLAN denial from ROLE denial
  const familyName = activeFamily?.display_name || "your family";
  
  if (inline) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Lock className="h-4 w-4" />
        <span>Upgrade Required</span>
        <Button 
          variant="link" 
          size="sm" 
          className="h-auto p-0 text-primary"
          onClick={() => navigate("/pricing")}
        >
          Compare Plans
        </Button>
      </div>
    );
  }

  return (
    <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
      <CardContent className="p-6 flex flex-col items-center text-center gap-4">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Crown className="h-6 w-6 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Upgrade Required</h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            {featureName} is included with the Power plan. {familyName === "your family" ? "Your family" : familyName} is currently on the Free tier.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Return to Dashboard
          </Button>
          <Button onClick={() => navigate("/pricing")} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Compare Plans
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
