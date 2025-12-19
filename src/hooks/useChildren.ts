import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Child {
  id: string;
  name: string;
  date_of_birth: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useChildren = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfileId, setUserProfileId] = useState<string | null>(null);

  // Fetch user's profile ID
  useEffect(() => {
    const fetchProfileId = async () => {
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile) {
        setUserProfileId(profile.id);
      }
    };

    fetchProfileId();
  }, [user]);

  // Fetch children
  useEffect(() => {
    const fetchChildren = async () => {
      if (!userProfileId) {
        setLoading(false);
        return;
      }

      // First get child IDs from parent_children
      const { data: links, error: linksError } = await supabase
        .from("parent_children")
        .select("child_id")
        .eq("parent_id", userProfileId);

      if (linksError) {
        console.error("Error fetching child links:", linksError);
        setLoading(false);
        return;
      }

      if (!links || links.length === 0) {
        setChildren([]);
        setLoading(false);
        return;
      }

      const childIds = links.map((l) => l.child_id);

      const { data, error } = await supabase
        .from("children")
        .select("*")
        .in("id", childIds)
        .order("name");

      if (error) {
        console.error("Error fetching children:", error);
        toast({
          title: "Error",
          description: "Failed to load children",
          variant: "destructive",
        });
      } else {
        setChildren(data || []);
      }
      setLoading(false);
    };

    fetchChildren();
  }, [userProfileId, toast]);

  const addChild = async (name: string, dateOfBirth?: string) => {
    if (!userProfileId) {
      toast({
        title: "Error",
        description: "You must be logged in to add a child",
        variant: "destructive",
      });
      return null;
    }

    // Create the child
    const { data: newChild, error: childError } = await supabase
      .from("children")
      .insert({
        name,
        date_of_birth: dateOfBirth || null,
      })
      .select()
      .single();

    if (childError) {
      console.error("Error creating child:", childError);
      toast({
        title: "Error",
        description: "Failed to add child",
        variant: "destructive",
      });
      return null;
    }

    // Link child to parent
    const { error: linkError } = await supabase.from("parent_children").insert({
      parent_id: userProfileId,
      child_id: newChild.id,
    });

    if (linkError) {
      console.error("Error linking child:", linkError);
      toast({
        title: "Error",
        description: "Failed to link child to your profile",
        variant: "destructive",
      });
      return null;
    }

    // Also link to co-parent if exists
    const { data: profile } = await supabase
      .from("profiles")
      .select("co_parent_id")
      .eq("id", userProfileId)
      .single();

    if (profile?.co_parent_id) {
      await supabase.from("parent_children").insert({
        parent_id: profile.co_parent_id,
        child_id: newChild.id,
      });
    }

    setChildren((prev) => [...prev, newChild]);
    toast({
      title: "Success",
      description: `${name} has been added`,
    });

    return newChild;
  };

  const updateChild = async (
    childId: string,
    updates: Partial<Pick<Child, "name" | "date_of_birth" | "avatar_url">>
  ) => {
    const { error } = await supabase
      .from("children")
      .update(updates)
      .eq("id", childId);

    if (error) {
      console.error("Error updating child:", error);
      toast({
        title: "Error",
        description: "Failed to update child",
        variant: "destructive",
      });
      return false;
    }

    setChildren((prev) =>
      prev.map((c) => (c.id === childId ? { ...c, ...updates } : c))
    );
    toast({
      title: "Success",
      description: "Child information updated",
    });
    return true;
  };

  return {
    children,
    loading,
    addChild,
    updateChild,
  };
};
