import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2, UserPlus } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface InvitationData {
  id: string;
  inviter_id: string;
  invitee_email: string;
  status: string;
  expires_at: string;
  created_at: string;
  inviter_name: string | null;
  inviter_email: string | null;
  invitation_type?: string;
  role?: string;
}

const AcceptInvite = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<"loading" | "valid" | "invalid" | "expired" | "accepted" | "wrong_email">("loading");
  const [inviterName, setInviterName] = useState<string>("");
  const [inviteeEmail, setInviteeEmail] = useState<string>("");
  const [invitationType, setInvitationType] = useState<"co_parent" | "third_party">("co_parent");
  const [isAccepting, setIsAccepting] = useState(false);

  const token = searchParams.get("token");
  const typeParam = searchParams.get("type");

  const checkInvitation = useCallback(async () => {
    try {
      // Use secure RPC function instead of direct table query
      const { data, error } = await supabase.rpc("get_invitation_by_token", {
        _token: token,
      });

      if (error || !data || data.length === 0) {
        setStatus("invalid");
        return;
      }

      const invitation = data[0] as InvitationData;

      if (invitation.status === "accepted") {
        setStatus("accepted");
        return;
      }

      if (invitation.status === "expired" || new Date(invitation.expires_at) < new Date()) {
        setStatus("expired");
        return;
      }

      setInviterName(invitation.inviter_name || invitation.inviter_email || "A family member");
      setInviteeEmail(invitation.invitee_email);
      setInvitationType(typeParam === "third_party" ? "third_party" : "co_parent");
      setStatus("valid");
    } catch (error) {
      console.error("Error checking invitation:", error);
      setStatus("invalid");
    }
  }, [token, typeParam]);

  useEffect(() => {
    if (token) {
      checkInvitation();
    } else {
      setStatus("invalid");
    }
  }, [token, checkInvitation]);

  const handleAcceptInvitation = async () => {
    if (!user) {
      // Store token in sessionStorage (more secure than localStorage, clears on tab close)
      sessionStorage.setItem("pendingInviteToken", token || "");
      navigate("/signup");
      return;
    }

    setIsAccepting(true);

    try {
      if (invitationType === "third_party") {
        // Handle third-party invitation acceptance
        // Get user's profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, full_name")
          .eq("user_id", user.id)
          .single();

        if (profileError || !profile) {
          throw new Error("Profile not found");
        }

        // Get invitation details
        const { data: invitationData } = await supabase.rpc("get_invitation_by_token", {
          _token: token,
        });

        if (!invitationData || invitationData.length === 0) {
          throw new Error("Invitation not found");
        }

        const invitation = invitationData[0];

        // Verify email matches
        if (invitation.invitee_email.toLowerCase() !== user.email?.toLowerCase()) {
          setStatus("wrong_email");
          toast({
            title: "Email mismatch",
            description: "This invitation was sent to a different email address",
            variant: "destructive",
          });
          return;
        }

        // Get primary parent ID from inviter's profile
        const { data: inviterProfile } = await supabase
          .from("profiles")
          .select("id, co_parent_id")
          .eq("id", invitation.inviter_id)
          .single();

        if (!inviterProfile) {
          throw new Error("Inviter profile not found");
        }

        // Determine primary parent ID (lower of the two)
        const primaryParentId = inviterProfile.co_parent_id
          ? (inviterProfile.id < inviterProfile.co_parent_id ? inviterProfile.id : inviterProfile.co_parent_id)
          : inviterProfile.id;

        // Create family member record
        const { error: memberError } = await supabase.from("family_members").insert({
          user_id: user.id,
          profile_id: profile.id,
          primary_parent_id: primaryParentId,
          role: "third_party",
          status: "active",
          invited_by: invitation.inviter_id,
          accepted_at: new Date().toISOString(),
        });

        if (memberError) {
          console.error("Error creating family member:", memberError);
          throw new Error("Failed to join family");
        }

        // Update invitation status
        await supabase
          .from("invitations")
          .update({ status: "accepted", updated_at: new Date().toISOString() })
          .eq("token", token);

        // Notify parents about the new third-party member
        try {
          await supabase.functions.invoke("notify-third-party-added", {
            body: {
              primaryParentId,
              thirdPartyName: profile.full_name || user.email?.split("@")[0] || "Family member",
              thirdPartyEmail: user.email || "",
            },
          });
        } catch (notifyError) {
          console.error("Error sending notification:", notifyError);
          // Don't fail the join if notification fails
        }

        sessionStorage.removeItem("pendingInviteToken");
        localStorage.removeItem("pendingInviteToken");

        toast({
          title: "Successfully joined!",
          description: "You're now part of the family group.",
        });

        navigate("/dashboard");
      } else {
        // Handle co-parent invitation (existing logic)
        const { data, error } = await supabase.rpc("accept_coparent_invitation", {
          _token: token,
          _acceptor_user_id: user.id,
        });

        if (error) {
          throw new Error("Failed to accept invitation");
        }

        const result = data as { success: boolean; error?: string };

        if (!result.success) {
          if (result.error?.includes("different email")) {
            setStatus("wrong_email");
            toast({
              title: "Email mismatch",
              description: result.error,
              variant: "destructive",
            });
            return;
          }
          throw new Error(result.error || "Failed to accept invitation");
        }

        sessionStorage.removeItem("pendingInviteToken");
        localStorage.removeItem("pendingInviteToken");

        toast({
          title: "Successfully linked!",
          description: "You're now connected with your co-parent. Your 7-day free trial has started!",
        });

        navigate("/dashboard");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Please try again.";
      console.error("Error accepting invitation:", error);
      toast({
        title: "Failed to accept invitation",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAccepting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Logo size="lg" className="justify-center" />
        </div>

        <Card>
          <CardHeader className="text-center">
            {status === "loading" && (
              <>
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                <CardTitle>Checking invitation...</CardTitle>
              </>
            )}

            {status === "valid" && (
              <>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>
                  {invitationType === "third_party" ? "Family Invitation" : "Co-Parent Invitation"}
                </CardTitle>
                <CardDescription>
                  {inviterName} has invited you to {invitationType === "third_party" ? "join their family on" : "co-parent on"} CoParrent
                </CardDescription>
              </>
            )}

            {status === "invalid" && (
              <>
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-destructive" />
                </div>
                <CardTitle>Invalid Invitation</CardTitle>
                <CardDescription>
                  This invitation link is invalid or has already been used.
                </CardDescription>
              </>
            )}

            {status === "expired" && (
              <>
                <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-warning" />
                </div>
                <CardTitle>Invitation Expired</CardTitle>
                <CardDescription>
                  This invitation has expired. Please ask your co-parent to send a new one.
                </CardDescription>
              </>
            )}

            {status === "accepted" && (
              <>
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <CardTitle>Already Accepted</CardTitle>
                <CardDescription>
                  This invitation has already been accepted.
                </CardDescription>
              </>
            )}

            {status === "wrong_email" && (
              <>
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-destructive" />
                </div>
                <CardTitle>Wrong Account</CardTitle>
                <CardDescription>
                  This invitation was sent to {inviteeEmail}. Please sign in with that email address to accept.
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            {status === "valid" && (
              <>
                <div className="p-4 rounded-lg bg-muted text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    {invitationType === "third_party" 
                      ? "As a family member, you'll get:"
                      : "By accepting, you'll get:"}
                  </p>
                  <ul className="text-sm space-y-1">
                    {invitationType === "third_party" ? (
                      <>
                        <li>✓ Family messaging hub access</li>
                        <li>✓ View children's calendar (read-only)</li>
                        <li>✓ Private journaling</li>
                        <li>✓ Law library & blog access</li>
                      </>
                    ) : (
                      <>
                        <li>✓ Shared custody calendar</li>
                        <li>✓ Court-friendly messaging</li>
                        <li>✓ Child information hub</li>
                        <li>✓ 7-day free trial</li>
                      </>
                    )}
                  </ul>
                </div>

                <Button 
                  onClick={handleAcceptInvitation} 
                  className="w-full"
                  disabled={isAccepting}
                >
                  {isAccepting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {user 
                    ? (invitationType === "third_party" ? "Accept & Join Family" : "Accept & Link Accounts")
                    : "Create Account to Accept"}
                </Button>

                {!user && (
                  <p className="text-xs text-center text-muted-foreground">
                    Already have an account?{" "}
                    <Button 
                      variant="link" 
                      className="p-0 h-auto"
                      onClick={() => {
                        sessionStorage.setItem("pendingInviteToken", token || "");
                        navigate("/login");
                      }}
                    >
                      Sign in
                    </Button>
                  </p>
                )}
              </>
            )}

            {status === "wrong_email" && (
              <Button 
                onClick={() => {
                  sessionStorage.setItem("pendingInviteToken", token || "");
                  navigate("/login");
                }}
                className="w-full"
              >
                Sign in with different account
              </Button>
            )}

            {(status === "invalid" || status === "expired" || status === "accepted") && (
              <Button 
                onClick={() => navigate("/")} 
                variant="outline"
                className="w-full"
              >
                Go to Homepage
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AcceptInvite;
