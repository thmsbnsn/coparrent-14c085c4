import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useFamilyRole } from "./useFamilyRole";
import { useToast } from "./use-toast";

export interface ThreadMessage {
  id: string;
  thread_id: string;
  sender_id: string;
  sender_role: string;
  content: string;
  created_at: string;
  sender_name?: string;
  is_from_me: boolean;
}

export interface MessageThread {
  id: string;
  primary_parent_id: string;
  thread_type: "family_channel" | "direct_message";
  participant_a_id: string | null;
  participant_b_id: string | null;
  name: string | null;
  created_at: string;
  other_participant?: {
    id: string;
    full_name: string | null;
    email: string | null;
    role?: string;
  };
  last_message?: ThreadMessage;
  unread_count?: number;
}

export interface FamilyMember {
  id: string;
  profile_id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  avatar_url: string | null;
}

export const useMessagingHub = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { profileId, primaryParentId, role, loading: roleLoading } = useFamilyRole();
  
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [familyChannel, setFamilyChannel] = useState<MessageThread | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [activeThread, setActiveThread] = useState<MessageThread | null>(null);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch family members
  const fetchFamilyMembers = useCallback(async () => {
    if (!primaryParentId || !profileId) return;

    try {
      // Get parents (primary parent and co-parent)
      const { data: primaryProfile } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url, co_parent_id")
        .eq("id", primaryParentId)
        .single();

      const members: FamilyMember[] = [];

      if (primaryProfile) {
        members.push({
          id: primaryProfile.id,
          profile_id: primaryProfile.id,
          full_name: primaryProfile.full_name,
          email: primaryProfile.email,
          role: "parent",
          avatar_url: primaryProfile.avatar_url,
        });

        // Get co-parent
        if (primaryProfile.co_parent_id) {
          const { data: coParent } = await supabase
            .from("profiles")
            .select("id, full_name, email, avatar_url")
            .eq("id", primaryProfile.co_parent_id)
            .single();

          if (coParent) {
            members.push({
              id: coParent.id,
              profile_id: coParent.id,
              full_name: coParent.full_name,
              email: coParent.email,
              role: "parent",
              avatar_url: coParent.avatar_url,
            });
          }
        }
      }

      // Get third-party members
      const { data: thirdParties } = await supabase
        .from("family_members")
        .select(`
          id,
          profile_id,
          role,
          profiles!family_members_profile_id_fkey (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq("primary_parent_id", primaryParentId)
        .eq("status", "active");

      if (thirdParties) {
        thirdParties.forEach((tp: any) => {
          if (tp.profiles) {
            members.push({
              id: tp.id,
              profile_id: tp.profile_id,
              full_name: tp.profiles.full_name,
              email: tp.profiles.email,
              role: tp.role,
              avatar_url: tp.profiles.avatar_url,
            });
          }
        });
      }

      setFamilyMembers(members);
    } catch (error) {
      console.error("Error fetching family members:", error);
    }
  }, [primaryParentId, profileId]);

  // Fetch threads
  const fetchThreads = useCallback(async () => {
    if (!primaryParentId || !profileId) return;

    try {
      const { data: threadData, error } = await supabase
        .from("message_threads")
        .select("*")
        .eq("primary_parent_id", primaryParentId)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      const formattedThreads: MessageThread[] = [];
      let channel: MessageThread | null = null;

      for (const thread of threadData || []) {
        if (thread.thread_type === "family_channel") {
          channel = thread;
        } else {
          // For DMs, only include if user is a participant
          if (thread.participant_a_id === profileId || thread.participant_b_id === profileId) {
            const otherParticipantId = 
              thread.participant_a_id === profileId 
                ? thread.participant_b_id 
                : thread.participant_a_id;

            if (otherParticipantId) {
              const { data: otherProfile } = await supabase
                .from("profiles")
                .select("id, full_name, email")
                .eq("id", otherParticipantId)
                .single();

              formattedThreads.push({
                ...thread,
                other_participant: otherProfile || undefined,
              });
            }
          }
        }
      }

      setFamilyChannel(channel);
      setThreads(formattedThreads);
    } catch (error) {
      console.error("Error fetching threads:", error);
    }
  }, [primaryParentId, profileId]);

  // Fetch messages for active thread
  const fetchMessages = useCallback(async (threadId: string) => {
    if (!profileId) return;

    try {
      const { data, error } = await supabase
        .from("thread_messages")
        .select("*")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch sender names
      const senderIds = [...new Set((data || []).map(m => m.sender_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", senderIds);

      const profileMap = new Map(
        (profiles || []).map(p => [p.id, p.full_name || p.email || "Unknown"])
      );

      const formattedMessages: ThreadMessage[] = (data || []).map(msg => ({
        ...msg,
        sender_name: profileMap.get(msg.sender_id) || "Unknown",
        is_from_me: msg.sender_id === profileId,
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [profileId]);

  // Send message
  const sendMessage = async (content: string) => {
    if (!activeThread || !profileId || !role) {
      toast({
        title: "Cannot send message",
        description: "Please select a conversation first",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase.from("thread_messages").insert({
        thread_id: activeThread.id,
        sender_id: profileId,
        sender_role: role,
        content,
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      return false;
    }
  };

  // Create or get DM thread
  const getOrCreateDMThread = async (otherProfileId: string) => {
    if (!primaryParentId || !profileId) return null;

    // Sort IDs to ensure consistent ordering
    const [participantA, participantB] = 
      profileId < otherProfileId 
        ? [profileId, otherProfileId] 
        : [otherProfileId, profileId];

    try {
      // Check if thread exists
      const { data: existingThread } = await supabase
        .from("message_threads")
        .select("*")
        .eq("primary_parent_id", primaryParentId)
        .eq("thread_type", "direct_message")
        .eq("participant_a_id", participantA)
        .eq("participant_b_id", participantB)
        .single();

      if (existingThread) {
        return existingThread;
      }

      // Create new thread
      const { data: newThread, error } = await supabase
        .from("message_threads")
        .insert({
          primary_parent_id: primaryParentId,
          thread_type: "direct_message",
          participant_a_id: participantA,
          participant_b_id: participantB,
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchThreads();
      return newThread;
    } catch (error) {
      console.error("Error creating DM thread:", error);
      return null;
    }
  };

  // Create family channel if doesn't exist
  const ensureFamilyChannel = async () => {
    if (!primaryParentId || familyChannel) return familyChannel;

    try {
      const { data: existingChannel } = await supabase
        .from("message_threads")
        .select("*")
        .eq("primary_parent_id", primaryParentId)
        .eq("thread_type", "family_channel")
        .single();

      if (existingChannel) {
        setFamilyChannel(existingChannel);
        return existingChannel;
      }

      // Create new family channel
      const { data: newChannel, error } = await supabase
        .from("message_threads")
        .insert({
          primary_parent_id: primaryParentId,
          thread_type: "family_channel",
          name: "Family Chat",
        })
        .select()
        .single();

      if (error) throw error;
      
      setFamilyChannel(newChannel);
      return newChannel;
    } catch (error) {
      console.error("Error creating family channel:", error);
      return null;
    }
  };

  // Initialize
  useEffect(() => {
    const initialize = async () => {
      if (roleLoading || !primaryParentId) return;
      
      setLoading(true);
      await Promise.all([fetchFamilyMembers(), fetchThreads()]);
      setLoading(false);
    };

    initialize();
  }, [roleLoading, primaryParentId, fetchFamilyMembers, fetchThreads]);

  // Fetch messages when active thread changes
  useEffect(() => {
    if (activeThread) {
      fetchMessages(activeThread.id);
    }
  }, [activeThread, fetchMessages]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!activeThread) return;

    const channel = supabase
      .channel(`thread-messages-${activeThread.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "thread_messages",
          filter: `thread_id=eq.${activeThread.id}`,
        },
        async (payload) => {
          const newMsg = payload.new as ThreadMessage;
          
          // Fetch sender name
          const { data: senderProfile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", newMsg.sender_id)
            .single();

          setMessages(prev => [
            ...prev,
            {
              ...newMsg,
              sender_name: senderProfile?.full_name || senderProfile?.email || "Unknown",
              is_from_me: newMsg.sender_id === profileId,
            },
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeThread, profileId]);

  return {
    threads,
    familyChannel,
    familyMembers,
    activeThread,
    messages,
    loading,
    role,
    profileId,
    setActiveThread,
    sendMessage,
    getOrCreateDMThread,
    ensureFamilyChannel,
    fetchThreads,
  };
};
