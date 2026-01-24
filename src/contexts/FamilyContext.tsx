/**
 * FamilyContext - Single source of truth for active family selection & effective role
 * 
 * MULTI-FAMILY ROLE ISOLATION:
 * - One user can belong to multiple families with DIFFERENT roles
 * - Role is a property of MEMBERSHIP, not the user globally
 * - effective_role = role_in_active_family
 * - All permission checks MUST use the effective role in the active family
 * 
 * @see docs/SECURITY_MODEL.md for isolation requirements
 */

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

type MemberRole = Database["public"]["Enums"]["member_role"];

export interface Family {
  id: string;
  display_name: string | null;
  created_by_user_id: string;
  created_at: string;
}

export interface FamilyMembership {
  familyId: string;
  role: MemberRole;
  relationshipLabel: string | null;
  status: string;
}

interface FamilyContextType {
  /** Currently active family for all scoped queries */
  activeFamilyId: string | null;
  /** All families the user belongs to */
  families: Family[];
  /** Currently active family object */
  activeFamily: Family | null;
  /** Whether user has multiple families */
  hasMultipleFamilies: boolean;
  /** Switch to a different family */
  setActiveFamilyId: (familyId: string) => void;
  /** Create a new family (for multi-family scenarios) */
  createFamily: (displayName?: string) => Promise<string | null>;
  /** Loading state */
  loading: boolean;
  /** Refresh families list */
  refreshFamilies: () => Promise<void>;
  
  // =========================================
  // EFFECTIVE ROLE IN ACTIVE FAMILY
  // Role is per-family, NOT global
  // =========================================
  
  /** User's role in the currently active family (NOT global) */
  effectiveRole: MemberRole | null;
  /** User's profile ID */
  profileId: string | null;
  /** Whether user is a parent/guardian in the ACTIVE family */
  isParentInActiveFamily: boolean;
  /** Whether user is a third-party in the ACTIVE family */
  isThirdPartyInActiveFamily: boolean;
  /** Whether user is a child account in the ACTIVE family */
  isChildInActiveFamily: boolean;
  /** UI-only display label (step_parent, grandparent, etc.) */
  relationshipLabel: string | null;
  /** All memberships the user has across families */
  memberships: FamilyMembership[];
  /** Loading state for role data */
  roleLoading: boolean;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

const ACTIVE_FAMILY_STORAGE_KEY = "coparrent_active_family_id";

export const FamilyProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [activeFamilyId, setActiveFamilyIdState] = useState<string | null>(null);
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Role state (per-family)
  const [effectiveRole, setEffectiveRole] = useState<MemberRole | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [relationshipLabel, setRelationshipLabel] = useState<string | null>(null);
  const [memberships, setMemberships] = useState<FamilyMembership[]>([]);
  const [roleLoading, setRoleLoading] = useState(true);

  // Fetch all families the user belongs to
  const fetchFamilies = useCallback(async () => {
    if (!user) {
      setFamilies([]);
      setActiveFamilyIdState(null);
      setMemberships([]);
      setLoading(false);
      return;
    }

    try {
      // Get user's profile ID first
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (profile) {
        setProfileId(profile.id);
      }

      // Get families through family_members (user membership) with role info
      const { data: memberFamilies, error: memberError } = await supabase
        .from("family_members")
        .select("family_id, role, relationship_label, status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .not("family_id", "is", null);

      if (memberError) {
        console.error("Error fetching family memberships:", memberError);
      }

      // Build memberships array
      const membershipsList: FamilyMembership[] = (memberFamilies || []).map(m => ({
        familyId: m.family_id!,
        role: m.role,
        relationshipLabel: m.relationship_label,
        status: m.status,
      }));

      const familyIds = memberFamilies?.map(m => m.family_id).filter(Boolean) || [];

      // Also include families created by this user (they're automatically a parent)
      const { data: createdFamilies, error: createdError } = await supabase
        .from("families")
        .select("*")
        .eq("created_by_user_id", user.id);

      if (createdError) {
        console.error("Error fetching created families:", createdError);
      }

      // Add creator families as parent memberships if not already in list
      if (createdFamilies) {
        for (const f of createdFamilies) {
          if (!membershipsList.some(m => m.familyId === f.id)) {
            membershipsList.push({
              familyId: f.id,
              role: "parent",
              relationshipLabel: null,
              status: "active",
            });
          }
        }
      }

      setMemberships(membershipsList);

      // Get all unique family IDs
      const allFamilyIds = [
        ...familyIds,
        ...(createdFamilies?.map(f => f.id) || [])
      ];
      const uniqueFamilyIds = [...new Set(allFamilyIds)];

      if (uniqueFamilyIds.length === 0) {
        setFamilies([]);
        setActiveFamilyIdState(null);
        setLoading(false);
        return;
      }

      // Fetch full family data
      const { data: familyData, error: familyError } = await supabase
        .from("families")
        .select("*")
        .in("id", uniqueFamilyIds)
        .order("created_at", { ascending: true });

      if (familyError) {
        console.error("Error fetching families:", familyError);
        setLoading(false);
        return;
      }

      setFamilies(familyData || []);

      // Restore saved active family or default to first
      const savedFamilyId = localStorage.getItem(ACTIVE_FAMILY_STORAGE_KEY);
      const validSavedFamily = familyData?.find(f => f.id === savedFamilyId);
      
      if (validSavedFamily) {
        setActiveFamilyIdState(validSavedFamily.id);
      } else if (familyData && familyData.length > 0) {
        setActiveFamilyIdState(familyData[0].id);
        localStorage.setItem(ACTIVE_FAMILY_STORAGE_KEY, familyData[0].id);
      }
    } catch (error) {
      console.error("Error in fetchFamilies:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Compute effective role when active family changes
  useEffect(() => {
    // Don't compute role until family data is fully loaded
    if (loading) {
      setRoleLoading(true);
      return;
    }
    
    setRoleLoading(true);
    
    if (!activeFamilyId || memberships.length === 0) {
      // If no active family but we have families, default to first one
      if (families.length > 0 && !activeFamilyId) {
        setActiveFamilyIdState(families[0].id);
        localStorage.setItem(ACTIVE_FAMILY_STORAGE_KEY, families[0].id);
        // Role will be computed on next render when activeFamilyId updates
        return;
      }
      
      setEffectiveRole(null);
      setRelationshipLabel(null);
      setRoleLoading(false);
      return;
    }

    // Find membership for the active family
    const activeMembership = memberships.find(m => m.familyId === activeFamilyId);
    
    if (activeMembership) {
      console.log("[FamilyContext] Setting effective role:", activeMembership.role, "for family:", activeFamilyId);
      setEffectiveRole(activeMembership.role);
      setRelationshipLabel(activeMembership.relationshipLabel);
    } else {
      // User might be family creator without explicit membership
      const isCreator = families.find(f => f.id === activeFamilyId && f.created_by_user_id === user?.id);
      if (isCreator) {
        console.log("[FamilyContext] User is family creator, setting role to parent");
        setEffectiveRole("parent");
        setRelationshipLabel(null);
      } else {
        console.log("[FamilyContext] No membership found for active family:", activeFamilyId);
        setEffectiveRole(null);
        setRelationshipLabel(null);
      }
    }
    
    setRoleLoading(false);
  }, [activeFamilyId, memberships, families, user?.id, loading]);

  // Initial fetch and realtime subscription
  useEffect(() => {
    fetchFamilies();

    // Subscribe to realtime changes on families table
    const channel = supabase
      .channel("families-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "families",
        },
        () => {
          fetchFamilies();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "family_members",
        },
        () => {
          fetchFamilies();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchFamilies]);

  // Set active family with persistence
  const setActiveFamilyId = useCallback((familyId: string) => {
    setActiveFamilyIdState(familyId);
    localStorage.setItem(ACTIVE_FAMILY_STORAGE_KEY, familyId);
  }, []);

  // Create a new family
  const createFamily = useCallback(async (displayName?: string): Promise<string | null> => {
    if (!user) return null;

    try {
      // Create the family
      const { data: newFamily, error: familyError } = await supabase
        .from("families")
        .insert({
          created_by_user_id: user.id,
          display_name: displayName || null,
        })
        .select()
        .single();

      if (familyError) {
        console.error("Error creating family:", familyError);
        return null;
      }

      // Get user's profile ID for family_members entry
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        // Add creator as a parent member of the family
        await supabase
          .from("family_members")
          .insert({
            user_id: user.id,
            profile_id: profile.id,
            family_id: newFamily.id,
            primary_parent_id: profile.id, // Legacy compatibility
            role: "parent",
            status: "active",
          });
      }

      // Refresh families list
      await fetchFamilies();

      return newFamily.id;
    } catch (error) {
      console.error("Error creating family:", error);
      return null;
    }
  }, [user, fetchFamilies]);

  // Compute active family object
  const activeFamily = families.find(f => f.id === activeFamilyId) || null;

  // Compute role booleans from effectiveRole (NOT global)
  const isParentInActiveFamily = effectiveRole === "parent" || effectiveRole === "guardian";
  const isThirdPartyInActiveFamily = effectiveRole === "third_party";
  const isChildInActiveFamily = effectiveRole === "child";

  return (
    <FamilyContext.Provider
      value={{
        activeFamilyId,
        families,
        activeFamily,
        hasMultipleFamilies: families.length > 1,
        setActiveFamilyId,
        createFamily,
        loading,
        refreshFamilies: fetchFamilies,
        
        // Role in active family
        effectiveRole,
        profileId,
        isParentInActiveFamily,
        isThirdPartyInActiveFamily,
        isChildInActiveFamily,
        relationshipLabel,
        memberships,
        roleLoading,
      }}
    >
      {children}
    </FamilyContext.Provider>
  );
};

export const useFamily = () => {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error("useFamily must be used within a FamilyProvider");
  }
  return context;
};

/**
 * Hook to require an active family for a component
 * Throws if no family is selected (fail-closed behavior)
 */
export const useRequireFamily = () => {
  const { activeFamilyId, loading } = useFamily();
  
  if (!loading && !activeFamilyId) {
    throw new Error("No active family selected. This component requires an active family context.");
  }
  
  return { activeFamilyId: activeFamilyId!, loading };
};
