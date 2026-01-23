/**
 * useChoreCharts - Hook for multi-household chore chart management
 * 
 * Features:
 * - Family-scoped chore lists (one active per parent per family)
 * - Household isolation (parent_a / parent_b)
 * - Child assignments (per-child or all children)
 * - Completion tracking with optional parent confirmation
 * - Realtime sync for completions
 * 
 * @see docs/GATED_FEATURES.md for access rules
 */

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFamily } from "@/contexts/FamilyContext";
import { useToast } from "@/hooks/use-toast";
import { format, startOfWeek, endOfWeek } from "date-fns";

// Types
export type CompletionStyle = "box" | "circle" | "star" | "heart";
export type Household = "parent_a" | "parent_b";
export type RewardType = "allowance" | "privilege" | "experience" | "other";

export interface ChoreList {
  id: string;
  family_id: string;
  created_by_parent_id: string;
  household: Household;
  household_label: string | null;
  theme_id: string;
  color_scheme: string;
  active: boolean;
  allow_child_completion: boolean;
  require_parent_confirm: boolean;
  rewards_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Chore {
  id: string;
  chore_list_id: string;
  title: string;
  description: string | null;
  completion_style: CompletionStyle;
  order_index: number;
  days_active: boolean[];
  created_at: string;
  updated_at: string;
  // Joined data
  assignments?: ChoreAssignment[];
}

export interface ChoreAssignment {
  id: string;
  chore_id: string;
  child_id: string | null; // null = all children
  created_at: string;
}

export interface ChoreCompletion {
  id: string;
  chore_id: string;
  child_id: string;
  completion_date: string;
  completed_by_role: "parent" | "child";
  completed_by_profile_id: string;
  parent_confirmed: boolean;
  created_at: string;
}

export interface ChoreReward {
  id: string;
  family_id: string;
  household: Household;
  child_id: string;
  reward_type: RewardType;
  description: string;
  criteria: string | null;
  fulfilled: boolean;
  fulfilled_at: string | null;
  fulfilled_by: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface CreateChoreListInput {
  household: Household;
  household_label?: string;
  theme_id?: string;
  color_scheme?: string;
  allow_child_completion?: boolean;
  require_parent_confirm?: boolean;
  rewards_enabled?: boolean;
}

interface CreateChoreInput {
  chore_list_id: string;
  title: string;
  description?: string;
  completion_style?: CompletionStyle;
  order_index?: number;
  days_active?: boolean[];
  assigned_child_ids?: (string | null)[]; // null = all children
}

export const useChoreCharts = () => {
  const { activeFamilyId, profileId, isParentInActiveFamily } = useFamily();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedHousehold, setSelectedHousehold] = useState<Household | "all">("all");

  // =====================
  // QUERIES
  // =====================

  // Fetch all chore lists for the active family
  const {
    data: choreLists = [],
    isLoading: choreListsLoading,
    refetch: refetchChoreLists,
  } = useQuery({
    queryKey: ["chore-lists", activeFamilyId],
    queryFn: async () => {
      if (!activeFamilyId) return [];
      
      const { data, error } = await supabase
        .from("chore_lists")
        .select("*")
        .eq("family_id", activeFamilyId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ChoreList[];
    },
    enabled: !!activeFamilyId,
  });

  // Get my active chore list
  const myActiveChoreList = choreLists.find(
    (cl) => cl.created_by_parent_id === profileId && cl.active
  );

  // Get the other parent's active chore list
  const otherParentChoreList = choreLists.find(
    (cl) => cl.created_by_parent_id !== profileId && cl.active
  );

  // Fetch chores for a specific chore list
  const useChoresForList = (choreListId: string | null) => {
    return useQuery({
      queryKey: ["chores", choreListId],
      queryFn: async () => {
        if (!choreListId) return [];

        const { data: chores, error: choresError } = await supabase
          .from("chores")
          .select("*")
          .eq("chore_list_id", choreListId)
          .order("order_index", { ascending: true });

        if (choresError) throw choresError;

        // Fetch assignments for all chores
        const choreIds = chores.map((c) => c.id);
        const { data: assignments, error: assignError } = await supabase
          .from("chore_assignments")
          .select("*")
          .in("chore_id", choreIds);

        if (assignError) throw assignError;

        // Attach assignments to chores
        return chores.map((chore) => ({
          ...chore,
          assignments: assignments.filter((a) => a.chore_id === chore.id),
        })) as Chore[];
      },
      enabled: !!choreListId,
    });
  };

  // Fetch completions for a date range
  const useCompletions = (
    choreListId: string | null,
    startDate: Date,
    endDate: Date
  ) => {
    return useQuery({
      queryKey: ["chore-completions", choreListId, format(startDate, "yyyy-MM-dd"), format(endDate, "yyyy-MM-dd")],
      queryFn: async () => {
        if (!choreListId) return [];

        // First get chore IDs for this list
        const { data: chores, error: choreError } = await supabase
          .from("chores")
          .select("id")
          .eq("chore_list_id", choreListId);

        if (choreError) throw choreError;
        if (!chores.length) return [];

        const choreIds = chores.map((c) => c.id);

        const { data, error } = await supabase
          .from("chore_completions")
          .select("*")
          .in("chore_id", choreIds)
          .gte("completion_date", format(startDate, "yyyy-MM-dd"))
          .lte("completion_date", format(endDate, "yyyy-MM-dd"));

        if (error) throw error;
        return data as ChoreCompletion[];
      },
      enabled: !!choreListId,
    });
  };

  // Fetch rewards for the family
  const {
    data: rewards = [],
    isLoading: rewardsLoading,
    refetch: refetchRewards,
  } = useQuery({
    queryKey: ["chore-rewards", activeFamilyId],
    queryFn: async () => {
      if (!activeFamilyId) return [];

      const { data, error } = await supabase
        .from("chore_rewards")
        .select("*")
        .eq("family_id", activeFamilyId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ChoreReward[];
    },
    enabled: !!activeFamilyId,
  });

  // =====================
  // MUTATIONS
  // =====================

  // Create a new chore list
  const createChoreListMutation = useMutation({
    mutationFn: async (input: CreateChoreListInput) => {
      if (!activeFamilyId || !profileId) {
        throw new Error("No active family or profile");
      }

      const { data, error } = await supabase
        .from("chore_lists")
        .insert({
          family_id: activeFamilyId,
          created_by_parent_id: profileId,
          household: input.household,
          household_label: input.household_label || null,
          theme_id: input.theme_id || "default",
          color_scheme: input.color_scheme || "blue",
          allow_child_completion: input.allow_child_completion ?? true,
          require_parent_confirm: input.require_parent_confirm ?? false,
          rewards_enabled: input.rewards_enabled ?? false,
          active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chore-lists", activeFamilyId] });
      toast({ title: "Chore list created", description: "Your new chore chart is ready." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Update a chore list
  const updateChoreListMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ChoreList> & { id: string }) => {
      const { data, error } = await supabase
        .from("chore_lists")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chore-lists", activeFamilyId] });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Add a chore to a list
  const addChoreMutation = useMutation({
    mutationFn: async (input: CreateChoreInput) => {
      // Create the chore
      const { data: chore, error: choreError } = await supabase
        .from("chores")
        .insert({
          chore_list_id: input.chore_list_id,
          title: input.title,
          description: input.description || null,
          completion_style: input.completion_style || "box",
          order_index: input.order_index ?? 0,
          days_active: input.days_active ?? [true, true, true, true, true, true, true],
        })
        .select()
        .single();

      if (choreError) throw choreError;

      // Create assignments
      const childIds = input.assigned_child_ids ?? [null]; // Default to all children
      const assignments = childIds.map((childId) => ({
        chore_id: chore.id,
        child_id: childId,
      }));

      const { error: assignError } = await supabase
        .from("chore_assignments")
        .insert(assignments);

      if (assignError) {
        // Rollback chore creation
        await supabase.from("chores").delete().eq("id", chore.id);
        throw assignError;
      }

      return chore;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chores", variables.chore_list_id] });
    },
    onError: (error) => {
      toast({ title: "Error adding chore", description: error.message, variant: "destructive" });
    },
  });

  // Update a chore
  const updateChoreMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Chore> & { id: string }) => {
      const { data, error } = await supabase
        .from("chores")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["chores", data.chore_list_id] });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Delete a chore
  const deleteChoreMutation = useMutation({
    mutationFn: async ({ id, choreListId }: { id: string; choreListId: string }) => {
      const { error } = await supabase.from("chores").delete().eq("id", id);
      if (error) throw error;
      return { choreListId };
    },
    onSuccess: ({ choreListId }) => {
      queryClient.invalidateQueries({ queryKey: ["chores", choreListId] });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Mark a chore complete/incomplete
  const toggleCompletionMutation = useMutation({
    mutationFn: async ({
      choreId,
      childId,
      date,
      isComplete,
      role,
    }: {
      choreId: string;
      childId: string;
      date: Date;
      isComplete: boolean;
      role: "parent" | "child";
    }) => {
      if (!profileId) throw new Error("No profile");

      const completionDate = format(date, "yyyy-MM-dd");

      if (isComplete) {
        // Create completion
        const { error } = await supabase.from("chore_completions").insert({
          chore_id: choreId,
          child_id: childId,
          completion_date: completionDate,
          completed_by_role: role,
          completed_by_profile_id: profileId,
          parent_confirmed: role === "parent",
        });

        if (error) throw error;
      } else {
        // Remove completion
        const { error } = await supabase
          .from("chore_completions")
          .delete()
          .eq("chore_id", choreId)
          .eq("child_id", childId)
          .eq("completion_date", completionDate);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      // Invalidate all completion queries
      queryClient.invalidateQueries({ queryKey: ["chore-completions"] });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Confirm a child completion (parent action)
  const confirmCompletionMutation = useMutation({
    mutationFn: async (completionId: string) => {
      const { error } = await supabase
        .from("chore_completions")
        .update({ parent_confirmed: true })
        .eq("id", completionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chore-completions"] });
    },
  });

  // Create a reward
  const createRewardMutation = useMutation({
    mutationFn: async (input: Omit<ChoreReward, "id" | "created_at" | "updated_at" | "fulfilled" | "fulfilled_at" | "fulfilled_by" | "created_by">) => {
      if (!activeFamilyId || !profileId) throw new Error("No family/profile");

      const { data, error } = await supabase
        .from("chore_rewards")
        .insert({
          ...input,
          family_id: activeFamilyId,
          created_by: profileId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chore-rewards", activeFamilyId] });
      toast({ title: "Reward created" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Fulfill a reward
  const fulfillRewardMutation = useMutation({
    mutationFn: async (rewardId: string) => {
      if (!profileId) throw new Error("No profile");

      const { error } = await supabase
        .from("chore_rewards")
        .update({
          fulfilled: true,
          fulfilled_at: new Date().toISOString(),
          fulfilled_by: profileId,
        })
        .eq("id", rewardId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chore-rewards", activeFamilyId] });
      toast({ title: "Reward marked as fulfilled" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // =====================
  // REALTIME
  // =====================

  useEffect(() => {
    if (!activeFamilyId) return;

    const channel = supabase
      .channel("chore-completions-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chore_completions",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["chore-completions"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeFamilyId, queryClient]);

  return {
    // Lists
    choreLists,
    choreListsLoading,
    myActiveChoreList,
    otherParentChoreList,
    createChoreList: createChoreListMutation.mutateAsync,
    updateChoreList: updateChoreListMutation.mutateAsync,
    isCreatingList: createChoreListMutation.isPending,
    refetchChoreLists,

    // Chores
    useChoresForList,
    addChore: addChoreMutation.mutateAsync,
    updateChore: updateChoreMutation.mutateAsync,
    deleteChore: deleteChoreMutation.mutateAsync,
    isAddingChore: addChoreMutation.isPending,

    // Completions
    useCompletions,
    toggleCompletion: toggleCompletionMutation.mutateAsync,
    confirmCompletion: confirmCompletionMutation.mutateAsync,

    // Rewards
    rewards,
    rewardsLoading,
    createReward: createRewardMutation.mutateAsync,
    fulfillReward: fulfillRewardMutation.mutateAsync,
    refetchRewards,

    // UI State
    selectedHousehold,
    setSelectedHousehold,

    // Context
    isParent: isParentInActiveFamily,
    profileId,
    activeFamilyId,
  };
};

/**
 * Calculate age group for age-based UX
 */
export type AgeGroup = "early" | "middle" | "adolescent";

export const getAgeGroup = (dateOfBirth: string | null): AgeGroup => {
  if (!dateOfBirth) return "middle"; // Default

  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age <= 6) return "early";
  if (age <= 11) return "middle";
  return "adolescent";
};

export const getAgeGroupLabel = (group: AgeGroup): string => {
  switch (group) {
    case "early":
      return "Ages 3-6";
    case "middle":
      return "Ages 7-11";
    case "adolescent":
      return "Ages 12-17";
  }
};
