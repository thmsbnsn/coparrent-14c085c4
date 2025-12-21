import { useEffect, useState } from "react";
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
}

const AcceptInvite = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<"loading" | "valid" | "invalid" | "expired" | "accepted" | "wrong_email">("loading");
  const [inviterName, setInviterName] = useState<string>("");
  const [inviteeEmail, setInviteeEmail] = useState<string>("");
  const [isAccepting, setIsAccepting] = useState(false);

  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      checkInvitation();
    } else {
      setStatus("invalid");
    }
  }, [token]);

  const checkInvitation = async () => {
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

      setInviterName(invitation.inviter_name || invitation.inviter_email || "Your co-parent");
      setInviteeEmail(invitation.invitee_email);
      setStatus("valid");
    } catch (error) {
      console.error("Error checking invitation:", error);
      setStatus("invalid");
    }
  };

  const handleAcceptInvitation = async () => {
    if (!user) {
      // Store token and redirect to signup
      localStorage.setItem("pendingInviteToken", token || "");
      navigate("/signup");
      return;
    }

    setIsAccepting(true);

    try {
      // Use secure RPC function that validates email server-side
      const { data, error } = await supabase.rpc("accept_coparent_invitation", {
        _token: token,
        _acceptor_user_id: user.id,
      });

      if (error) {
        throw new Error("Failed to accept invitation");
      }

      const result = data as { success: boolean; error?: string };

      if (!result.success) {
        // Handle specific error for wrong email
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

      // Clear pending invite token
      localStorage.removeItem("pendingInviteToken");

      toast({
        title: "Successfully linked!",
        description: "You're now connected with your co-parent. Your 7-day free trial has started!",
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error accepting invitation:", error);
      toast({
        title: "Failed to accept invitation",
        description: error.message || "Please try again.",
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
                <CardTitle>Co-Parent Invitation</CardTitle>
                <CardDescription>
                  {inviterName} has invited you to co-parent on ClearNest
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
                    By accepting, you'll get:
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>✓ Shared custody calendar</li>
                    <li>✓ Court-friendly messaging</li>
                    <li>✓ Child information hub</li>
                    <li>✓ 7-day free trial</li>
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
                  {user ? "Accept & Link Accounts" : "Create Account to Accept"}
                </Button>

                {!user && (
                  <p className="text-xs text-center text-muted-foreground">
                    Already have an account?{" "}
                    <Button 
                      variant="link" 
                      className="p-0 h-auto"
                      onClick={() => {
                        localStorage.setItem("pendingInviteToken", token || "");
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
                  localStorage.setItem("pendingInviteToken", token || "");
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