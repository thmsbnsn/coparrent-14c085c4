import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { sanitizeErrorForUser } from "@/lib/errorMessages";
import { acquireMutationLock, releaseMutationLock } from "@/lib/mutations";

export interface NurseNancyMessage {
  id: string;
  thread_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

export interface NurseNancyThread {
  id: string;
  user_id: string;
  profile_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

const WELCOME_MESSAGE = `👋 Hi there! I'm **Nurse Nancy**.

I'm here to offer **general, educational support** and help you think through health concerns about your children.

**Important things to know:**
• I don't provide medical advice, diagnosis, treatment plans, or legal advice
• For specific medical guidance, please contact a licensed healthcare professional
• **For emergencies, call 911 (US) or your local emergency number immediately**

Now, how can I help you today? 💜`;

export function useNurseNancy() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [threads, setThreads] = useState<NurseNancyThread[]>([]);
  const [currentThread, setCurrentThread] = useState<NurseNancyThread | null>(null);
  const [messages, setMessages] = useState<NurseNancyMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Fetch user's profile ID
  const getProfileId = useCallback(async () => {
    if (!user) return null;
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    return data?.id || null;
  }, [user]);

  // Fetch all threads
  const fetchThreads = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("nurse_nancy_threads")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching threads:", error);
      return;
    }

    setThreads((data as NurseNancyThread[]) || []);
  }, [user]);

  // Fetch messages for a thread
  const fetchMessages = useCallback(async (threadId: string) => {
    const { data, error } = await supabase
      .from("nurse_nancy_messages")
      .select("*")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return;
    }

    setMessages((data as NurseNancyMessage[]) || []);
  }, []);

  // Create a new thread
  const createThread = useCallback(async () => {
    if (!user) return null;
    
    const lockKey = `nurse-nancy-create-${user.id}`;
    if (!acquireMutationLock(lockKey)) {
      return null;
    }

    try {
      const profileId = await getProfileId();
      if (!profileId) {
        toast({
          title: "Error",
          description: "Could not find your profile",
          variant: "destructive",
        });
        return null;
      }

      const { data: thread, error } = await supabase
        .from("nurse_nancy_threads")
        .insert({
          user_id: user.id,
          profile_id: profileId,
          title: "Health Chat",
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Insert welcome message
      await supabase.from("nurse_nancy_messages").insert({
        thread_id: thread.id,
        role: "system",
        content: WELCOME_MESSAGE,
      });

      await fetchThreads();
      return thread as NurseNancyThread;
    } catch (error) {
      console.error("Error creating thread:", error);
      toast({
        title: "Error",
        description: sanitizeErrorForUser(error),
        variant: "destructive",
      });
      return null;
    } finally {
      releaseMutationLock(lockKey);
    }
  }, [user, getProfileId, fetchThreads, toast]);

  // Select a thread and load its messages
  const selectThread = useCallback(async (thread: NurseNancyThread) => {
    setCurrentThread(thread);
    await fetchMessages(thread.id);
  }, [fetchMessages]);

  // Start a new chat
  const startNewChat = useCallback(async () => {
    const thread = await createThread();
    if (thread) {
      setCurrentThread(thread);
      // Set the welcome message locally
      setMessages([{
        id: crypto.randomUUID(),
        thread_id: thread.id,
        role: "system",
        content: WELCOME_MESSAGE,
        created_at: new Date().toISOString(),
      }]);
    }
    return thread;
  }, [createThread]);

  // Send a message
  const sendMessage = useCallback(async (content: string) => {
    if (!currentThread || !user || sending) return;

    const lockKey = `nurse-nancy-send-${currentThread.id}-${content.slice(0, 20)}`;
    if (!acquireMutationLock(lockKey)) {
      return;
    }

    setSending(true);

    // Optimistically add user message
    const tempUserMessage: NurseNancyMessage = {
      id: crypto.randomUUID(),
      thread_id: currentThread.id,
      role: "user",
      content,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMessage]);

    try {
      // Get message history for context (excluding system messages)
      const historyForAI = messages
        .filter(m => m.role !== "system")
        .map(m => ({ role: m.role, content: m.content }));

      const { data, error } = await supabase.functions.invoke("nurse-nancy-chat", {
        body: {
          threadId: currentThread.id,
          message: content,
          messageHistory: historyForAI,
        },
      });

      if (error) {
        throw error;
      }

      // Add assistant response
      const assistantMessage: NurseNancyMessage = {
        id: crypto.randomUUID(),
        thread_id: currentThread.id,
        role: "assistant",
        content: data.response,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Update threads list to reflect activity
      await fetchThreads();
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempUserMessage.id));
      toast({
        title: "Message not sent",
        description: sanitizeErrorForUser(error),
        variant: "destructive",
      });
    } finally {
      setSending(false);
      releaseMutationLock(lockKey);
    }
  }, [currentThread, user, sending, messages, fetchThreads, toast]);

  // Delete a thread
  const deleteThread = useCallback(async (threadId: string) => {
    if (!user) return;

    const lockKey = `nurse-nancy-delete-${threadId}`;
    if (!acquireMutationLock(lockKey)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("nurse_nancy_threads")
        .delete()
        .eq("id", threadId);

      if (error) throw error;

      // If we deleted the current thread, clear it
      if (currentThread?.id === threadId) {
        setCurrentThread(null);
        setMessages([]);
      }

      await fetchThreads();
      toast({
        title: "Chat deleted",
        description: "The conversation has been removed.",
      });
    } catch (error) {
      console.error("Error deleting thread:", error);
      toast({
        title: "Error",
        description: sanitizeErrorForUser(error),
        variant: "destructive",
      });
    } finally {
      releaseMutationLock(lockKey);
    }
  }, [user, currentThread, fetchThreads, toast]);

  // Initialize: fetch threads on mount
  useEffect(() => {
    const init = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      await fetchThreads();
      setLoading(false);
    };

    init();
  }, [user, fetchThreads]);

  return {
    threads,
    currentThread,
    messages,
    loading,
    sending,
    createThread,
    selectThread,
    startNewChat,
    sendMessage,
    deleteThread,
    fetchThreads,
  };
}
