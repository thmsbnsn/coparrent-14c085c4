import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type FamilyRole = "parent" | "guardian" | "third_party" | null;

interface FamilyMemberInfo {
  role: FamilyRole;
  profileId: string | null;
  primaryParentId: string | null;
  isParent: boolean;
  isThirdParty: boolean;
  loading: boolean;
}

export const useFamilyRole = (): FamilyMemberInfo => {
  const { user } = useAuth();
  const [role, setRole] = useState<FamilyRole>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [primaryParentId, setPrimaryParentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFamilyRole = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // First check if user is a parent/guardian (has a profile with potential co_parent_id)
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, co_parent_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profile) {
          setProfileId(profile.id);
          
          // Check if user is a third-party member
          const { data: familyMember } = await supabase
            .from("family_members")
            .select("role, primary_parent_id")
            .eq("user_id", user.id)
            .eq("status", "active")
            .maybeSingle();

          if (familyMember) {
            // User is a third-party
            setRole(familyMember.role as FamilyRole);
            setPrimaryParentId(familyMember.primary_parent_id);
          } else {
            // User is a parent/guardian
            setRole("parent");
            // Primary parent ID is the "lower" of the two parent IDs for consistency
            if (profile.co_parent_id) {
              setPrimaryParentId(
                profile.id < profile.co_parent_id ? profile.id : profile.co_parent_id
              );
            } else {
              setPrimaryParentId(profile.id);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching family role:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFamilyRole();
  }, [user]);

  return {
    role,
    profileId,
    primaryParentId,
    isParent: role === "parent" || role === "guardian",
    isThirdParty: role === "third_party",
    loading,
  };
};
