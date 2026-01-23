/**
 * FamilyContext - Single source of truth for active family selection
 * 
 * MULTI-FAMILY ISOLATION:
 * - One user can belong to multiple families (co-parenting contexts)
 * - All family-scoped queries MUST use activeFamilyId
 * - No component should query family-scoped tables without an active family
 * - Switching families reloads all scoped data
 * 
 * @see docs/SECURITY_MODEL.md for isolation requirements
 */

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Family {
  id: string;
  display_name: string | null;
  created_by_user_id: string;
  created_at: string;
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
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

const ACTIVE_FAMILY_STORAGE_KEY = "coparrent_active_family_id";

export const FamilyProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [activeFamilyId, setActiveFamilyIdState] = useState<string | null>(null);
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all families the user belongs to
  const fetchFamilies = useCallback(async () => {
    if (!user) {
      setFamilies([]);
      setActiveFamilyIdState(null);
      setLoading(false);
      return;
    }

    try {
      // Get families through family_members (user membership)
      const { data: memberFamilies, error: memberError } = await supabase
        .from("family_members")
        .select("family_id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .not("family_id", "is", null);

      if (memberError) {
        console.error("Error fetching family memberships:", memberError);
      }

      const familyIds = memberFamilies?.map(m => m.family_id).filter(Boolean) || [];

      // Also include families created by this user (they're automatically a member)
      const { data: createdFamilies, error: createdError } = await supabase
        .from("families")
        .select("*")
        .eq("created_by_user_id", user.id);

      if (createdError) {
        console.error("Error fetching created families:", createdError);
      }

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
