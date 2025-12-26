import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserPlus, Check, X, Clock, Lock, Crown, Mail, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface ThirdPartyMember {
  id: string;
  user_id: string | null;
  profile_id: string | null;
  primary_parent_id: string;
  role: string;
  status: string;
  created_at: string;
  invitee_email?: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
  };
}

interface ThirdPartyManagerProps {
  subscriptionTier: string;
  isTrialActive: boolean;
}

const PLAN_LIMITS: Record<string, number> = {
  free: 0,
  pro: 2,
  mvp: 6,
  premium: 6,
  enterprise: 999,
};

export const ThirdPartyManager = ({ subscriptionTier, isTrialActive }: ThirdPartyManagerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<ThirdPartyMember[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [primaryParentId, setPrimaryParentId] = useState<string | null>(null);

  const tier = subscriptionTier || "free";
  const limit = PLAN_LIMITS[tier] || 0;
  const currentCount = members.filter(m => m.status === "active" || m.status === "invited").length;
  const canAddMore = isTrialActive || currentCount < limit;
  const isFeatureAvailable = isTrialActive || tier !== "free";

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, co_parent_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile) {
        setProfileId(profile.id);
        // Primary parent is the "lower" ID for consistency
        const ppId = profile.co_parent_id
          ? (profile.id < profile.co_parent_id ? profile.id : profile.co_parent_id)
          : profile.id;
        setPrimaryParentId(ppId);
        fetchMembers(ppId);
      }
    };

    fetchProfile();
  }, [user]);

  const fetchMembers = async (ppId: string) => {
    const { data } = await supabase
      .from("family_members")
      .select("*")
      .eq("primary_parent_id", ppId)
      .eq("role", "third_party")
      .neq("status", "removed");

    setMembers((data as unknown as ThirdPartyMember[]) || []);
  };

  const handleInviteThirdParty = async () => {
    if (!profileId || !primaryParentId || !email.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (!canAddMore) {
      toast({
        title: "Limit reached",
        description: `Your ${tier} plan allows up to ${limit} third-party members. Upgrade to add more.`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create invitation record
      const { data: invitation, error: inviteError } = await supabase
        .from("invitations")
        .insert({
          inviter_id: profileId,
          invitee_email: email.trim().toLowerCase(),
          invitation_type: "third_party",
          role: "third_party",
        })
        .select()
        .single();

      if (inviteError) throw inviteError;

      // Get inviter name
      const { data: inviterProfile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", profileId)
        .single();

      const inviterName = inviterProfile?.full_name || inviterProfile?.email || "A family member";

      // Send invitation email
      const { error: emailError } = await supabase.functions.invoke("send-third-party-invite", {
        body: {
          inviteeEmail: email.trim().toLowerCase(),
          inviterName,
          token: invitation.token,
          primaryParentId,
        },
      });

      if (emailError) {
        console.error("Email error:", emailError);
        // Continue anyway - invitation is created
      }

      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${email}`,
      });

      setEmail("");
      fetchMembers(primaryParentId);
    } catch (error: any) {
      console.error("Error inviting third-party:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!primaryParentId) return;

    const { error } = await supabase
      .from("family_members")
      .update({ status: "removed" })
      .eq("id", memberId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Member removed",
        description: "The family member has been removed",
      });
      fetchMembers(primaryParentId);
    }
  };

  if (!isFeatureAvailable) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-muted">
            <Lock className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold">Third-Party Access</h3>
              <Badge variant="secondary" className="gap-1">
                <Crown className="w-3 h-3" />
                Pro
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Invite step-parents, grandparents, babysitters, or other trusted adults to your family group. 
              They get access to the messaging hub and can view the child calendar.
            </p>
            <Button variant="outline" size="sm" onClick={() => navigate("/pricing")}>
              Upgrade to Pro
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with limits */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-primary/10">
            <Users2 className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Third-Party Access</h3>
              <Badge variant="outline">
                {currentCount} / {isTrialActive ? "∞" : limit} members
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Invite step-parents, grandparents, babysitters, or other trusted adults. 
              They can message the family and view the child calendar (read-only).
            </p>

            {/* Invite form */}
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="thirdparty-email" className="sr-only">
                  Email address
                </Label>
                <Input
                  id="thirdparty-email"
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!canAddMore}
                />
              </div>
              <Button 
                onClick={handleInviteThirdParty} 
                disabled={loading || !email.trim() || !canAddMore}
              >
                <Mail className="w-4 h-4 mr-2" />
                {loading ? "Sending..." : "Invite"}
              </Button>
            </div>

            {!canAddMore && !isTrialActive && (
              <p className="text-sm text-warning mt-2">
                You've reached your plan limit. 
                <Button variant="link" className="px-1 h-auto" onClick={() => navigate("/pricing")}>
                  Upgrade
                </Button>
                to add more members.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Current members */}
      {members.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold mb-4">Family Members</h3>
          <div className="space-y-3">
            {members.map((member) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {member.profiles?.full_name || member.profiles?.email || member.invitee_email || "Invited member"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {member.status === "invited" ? "Invitation pending" : "Active member"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={member.status === "active" ? "default" : "secondary"}>
                    {member.status === "active" && <Check className="w-3 h-3 mr-1" />}
                    {member.status === "invited" && <Clock className="w-3 h-3 mr-1" />}
                    {member.status === "active" ? "Active" : "Pending"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
