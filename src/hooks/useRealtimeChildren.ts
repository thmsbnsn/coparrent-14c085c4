import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Child } from "@/hooks/useChildren";
import { useNotifications } from "@/hooks/useNotifications";

// Helper to delete all files in a storage folder
const deleteStorageFolder = async (bucket: string, folderPath: string): Promise<void> => {
  const { data: files } = await supabase.storage.from(bucket).list(folderPath);
  if (files && files.length > 0) {
    const filePaths = files.map((f) => `${folderPath}/${f.name}`);
    await supabase.storage.from(bucket).remove(filePaths);
  }
};

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

  const deleteChild = async (childId: string): Promise<boolean> => {
    if (!userProfileId) {
      toast({
        title: "Error",
        description: "You must be logged in to delete a child",
        variant: "destructive",
      });
      return false;
    }

    try {
      // First verify the user has access to this child
      const { data: link } = await supabase
        .from("parent_children")
        .select("id")
        .eq("parent_id", userProfileId)
        .eq("child_id", childId)
        .maybeSingle();

      if (!link) {
        toast({
          title: "Error",
          description: "You don't have permission to delete this child",
          variant: "destructive",
        });
        return false;
      }

      // Get child info for cleanup and toast message
      const child = children.find((c) => c.id === childId);
      const childName = child?.name || "Child";

      // 1. Delete storage assets - avatars and photos
      await deleteStorageFolder("child-avatars", childId);
      await deleteStorageFolder("child-photos", childId);

      // 2. Delete child_photos records (if any - should cascade but be explicit)
      await supabase.from("child_photos").delete().eq("child_id", childId);

      // 3. Delete child_activities and related events (events cascade from activities via FK)
      await supabase.from("child_activities").delete().eq("child_id", childId);

      // 4. Delete documents associated with this child
      const { data: docs } = await supabase
        .from("documents")
        .select("id, file_path")
        .eq("child_id", childId);
      
      if (docs && docs.length > 0) {
        // Delete document files from storage
        const docPaths = docs.map((d) => d.file_path);
        await supabase.storage.from("documents").remove(docPaths);
        // Delete document records
        await supabase.from("documents").delete().eq("child_id", childId);
      }

      // 5. Delete journal entries for this child
      await supabase.from("journal_entries").delete().eq("child_id", childId);

      // 6. Delete expenses for this child
      await supabase.from("expenses").delete().eq("child_id", childId);

      // 7. Delete gift lists for this child (gift_items cascade via FK)
      await supabase.from("gift_lists").delete().eq("child_id", childId);

      // 8. Delete parent_children links
      await supabase.from("parent_children").delete().eq("child_id", childId);

      // 9. Finally delete the child record
      const { error } = await supabase.from("children").delete().eq("id", childId);

      if (error) {
        throw error;
      }

      // Update local state
      setChildren((prev) => prev.filter((c) => c.id !== childId));

      toast({
        title: "Child Deleted",
        description: `${childName}'s profile and all associated data have been removed`,
      });

      return true;
    } catch (error) {
      console.error("Error deleting child:", error);
      toast({
        title: "Error",
        description: "Failed to delete child. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    children,
    loading,
    addChild,
    updateChild,
    deleteChild,
    refetch: fetchChildren,
  };
};
