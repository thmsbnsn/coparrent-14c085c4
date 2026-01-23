/**
 * useFamilyChildren - Fetch children scoped to the active family
 * 
 * MULTI-FAMILY ISOLATION:
 * - Only returns children belonging to the active family
 * - Requires an active family to be selected
 * - Uses family_id for queries, not parent relationships
 * 
 * @see Part A.3 of MULTI-FAMILY spec
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFamily } from "@/contexts/FamilyContext";

export interface FamilyChild {
  id: string;
  name: string;
  date_of_birth: string | null;
  avatar_url: string | null;
  family_id: string | null;
  created_at: string;
}

interface UseFamilyChildrenResult {
  children: FamilyChild[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useFamilyChildren = (): UseFamilyChildrenResult => {
  const { activeFamilyId, loading: familyLoading } = useFamily();
  const [children, setChildren] = useState<FamilyChild[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChildren = useCallback(async () => {
    if (!activeFamilyId) {
      // No active family - check for legacy children without family_id
      // This handles the migration period where children may not have family_id yet
      const { data: legacyChildren, error: legacyError } = await supabase
        .from("children")
        .select("*")
        .is("family_id", null)
        .order("name");

      if (legacyError) {
        console.error("Error fetching legacy children:", legacyError);
        setError(legacyError.message);
      } else {
        setChildren(legacyChildren || []);
      }
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("children")
        .select("*")
        .eq("family_id", activeFamilyId)
        .order("name");

      if (fetchError) {
        console.error("Error fetching family children:", fetchError);
        setError(fetchError.message);
        return;
      }

      setChildren(data || []);
    } catch (err) {
      console.error("Error in useFamilyChildren:", err);
      setError("Failed to load children");
    } finally {
      setLoading(false);
    }
  }, [activeFamilyId]);

  useEffect(() => {
    if (!familyLoading) {
      fetchChildren();
    }
  }, [familyLoading, fetchChildren]);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!activeFamilyId) return;

    const channel = supabase
      .channel(`children-family-${activeFamilyId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "children",
          filter: `family_id=eq.${activeFamilyId}`,
        },
        () => {
          fetchChildren();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeFamilyId, fetchChildren]);

  return {
    children,
    loading: loading || familyLoading,
    error,
    refetch: fetchChildren,
  };
};
