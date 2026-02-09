import { useState } from "react";
import { Gift, Loader2, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AccessCodeRedeemerProps {
  onRedeemed?: () => void;
}

export const AccessCodeRedeemer = ({ onRedeemed }: AccessCodeRedeemerProps) => {
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);

  const handleRedeem = async () => {
    const normalized = code.trim().toUpperCase();
    if (!normalized) return;

    setRedeeming(true);
    try {
      const { data, error } = await supabase.functions.invoke("redeem-access-code", {
        body: { code: normalized },
      });

      if (error) {
        throw new Error(error.message || "Unable to redeem code");
      }

      const result = data as {
        ok?: boolean;
        code?: string;
        message?: string;
      };

      if (!result?.ok) {
        toast({
          title: "Could not redeem code",
          description: result?.message || "Please check the code and try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Power access activated",
        description: result.message || "Your complimentary access is now active.",
      });
      setCode("");
      onRedeemed?.();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please try again.";
      toast({
        title: "Redeem failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <Ticket className="w-5 h-5 text-primary" />
        <h2 className="font-display font-semibold">Redeem Access Code</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Have a complimentary access code from CoParrent? Redeem it here for free forever Power access.
      </p>

      <div className="space-y-3">
        <Label htmlFor="access-code">Access Code</Label>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            id="access-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="CP-XXXXXX-XXXXXX"
            autoCapitalize="characters"
            autoComplete="off"
          />
          <Button onClick={handleRedeem} disabled={redeeming || !code.trim()}>
            {redeeming ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Redeeming
              </>
            ) : (
              <>
                <Gift className="w-4 h-4 mr-2" />
                Redeem
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
