import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Child } from "@/hooks/useChildren";
import { useNotifications } from "@/hooks/useNotifications";

export const useRealtimeChildren = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { sendNotification } = useNotifications();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfileId, setUserProfileId] = useState<string | null>(null);

  // Fetch user's profile ID
  useEffect(() => {
    const fetchProfileId = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching profile:", error);
        }

        if (profile) {
          setUserProfileId(profile.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchProfileId();
    }
  }, [user, authLoading]);

  // Fetch children
  const fetchChildren = useCallback(async () => {
    if (!userProfileId) {
      setLoading(false);
      return;
    }

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
      setChildren((data as Child[]) || []);
    }
    setLoading(false);
  }, [userProfileId, toast]);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  // Set up realtime subscriptions
  useEffect(() => {
    if (!userProfileId) return;

    // Subscribe to children table changes
    const childrenChannel = supabase
      .channel('children-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'children'
        },
        (payload) => {
          console.log('Children change:', payload);
          
          if (payload.eventType === 'UPDATE') {
            setChildren(prev => prev.map(child => 
              child.id === payload.new.id ? { ...child, ...payload.new } as Child : child
            ));
            sendNotification('child_info_updates', 'Child Info Updated', `${(payload.new as any).name}'s information has been updated`);
          } else if (payload.eventType === 'DELETE') {
            setChildren(prev => prev.filter(child => child.id !== payload.old.id));
          } else if (payload.eventType === 'INSERT') {
            // Refetch to check if this child is linked to us
            fetchChildren();
          }
        }
      )
      .subscribe();

    // Subscribe to parent_children link changes
    const linksChannel = supabase
      .channel('parent-children-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'parent_children',
          filter: `parent_id=eq.${userProfileId}`
        },
        (payload) => {
          console.log('Parent-children link change:', payload);
          // Refetch children when links change
          fetchChildren();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(childrenChannel);
      supabase.removeChannel(linksChannel);
    };
  }, [userProfileId, fetchChildren, sendNotification]);

  const addChild = async (name: string, dateOfBirth?: string) => {
    if (!userProfileId) {
      toast({
        title: "Error",
        description: "You must be logged in to add a child",
        variant: "destructive",
      });
      return null;
    }

    // Use the secure database function to create child with proper links
    const { data, error } = await supabase.rpc("create_child_with_link", {
      _name: name,
      _date_of_birth: dateOfBirth || null,
    });

    if (error) {
      console.error("Error creating child:", error);
      toast({
        title: "Error",
        description: "Failed to add child",
        variant: "destructive",
      });
      return null;
    }

    const result = data as unknown as { success: boolean; error?: string; child?: Child };

    if (!result.success) {
      toast({
        title: "Error",
        description: result.error || "Failed to add child",
        variant: "destructive",
      });
      return null;
    }

    toast({
      title: "Success",
      description: `${name} has been added`,
    });

    // Refetch to get the updated list
    await fetchChildren();

    return result.child || null;
  };

  const updateChild = async (
    childId: string,
    updates: Partial<Omit<Child, "id" | "created_at" | "updated_at">>
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
    refetch: fetchChildren,
  };
};
