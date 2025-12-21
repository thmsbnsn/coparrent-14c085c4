import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface ScheduleRequest {
  id: string;
  request_type: string;
  original_date: string;
  proposed_date: string | null;
  reason: string | null;
  status: string;
  requester_id: string;
  recipient_id: string;
  message_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useScheduleRequests = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<ScheduleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfileId, setUserProfileId] = useState<string | null>(null);
  const [coParentProfileId, setCoParentProfileId] = useState<string | null>(null);

  // Fetch profile IDs
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, co_parent_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile) {
        setUserProfileId(profile.id);
        setCoParentProfileId(profile.co_parent_id);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  // Fetch schedule requests
  const fetchRequests = useCallback(async () => {
    if (!userProfileId) return;

    const { data, error } = await supabase
      .from("schedule_requests")
      .select("*")
      .or(`requester_id.eq.${userProfileId},recipient_id.eq.${userProfileId}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching schedule requests:", error);
    } else {
      setRequests(data || []);
    }
  }, [userProfileId]);

  useEffect(() => {
    if (userProfileId) {
      fetchRequests();
    }
  }, [userProfileId, fetchRequests]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!userProfileId) return;

    const channel = supabase
      .channel("schedule-requests-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "schedule_requests",
        },
        (payload) => {
          const record = payload.new as ScheduleRequest;
          const oldRecord = payload.old as { id: string };
          
          // Only process if this request involves the current user
          if (payload.eventType === "INSERT") {
            if (record.requester_id === userProfileId || record.recipient_id === userProfileId) {
              setRequests((prev) => [record, ...prev]);
            }
          } else if (payload.eventType === "UPDATE") {
            setRequests((prev) =>
              prev.map((r) => (r.id === record.id ? record : r))
            );
          } else if (payload.eventType === "DELETE") {
            setRequests((prev) => prev.filter((r) => r.id !== oldRecord.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userProfileId]);

  const createRequest = async (data: {
    request_type: string;
    original_date: string;
    proposed_date?: string;
    reason?: string;
  }) => {
    if (!userProfileId || !coParentProfileId) {
      toast({
        title: "Error",
        description: "You must be connected with a co-parent to create requests",
        variant: "destructive",
      });
      return null;
    }

    const { data: newRequest, error } = await supabase
      .from("schedule_requests")
      .insert({
        request_type: data.request_type,
        original_date: data.original_date,
        proposed_date: data.proposed_date || null,
        reason: data.reason || null,
        requester_id: userProfileId,
        recipient_id: coParentProfileId,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating schedule request:", error);
      toast({
        title: "Error",
        description: "Failed to create schedule request",
        variant: "destructive",
      });
      return null;
    }

    toast({
      title: "Request Sent",
      description: "Your schedule change request has been sent to your co-parent.",
    });

    return newRequest;
  };

  const respondToRequest = async (requestId: string, response: "accepted" | "declined") => {
    const { error } = await supabase
      .from("schedule_requests")
      .update({ status: response, updated_at: new Date().toISOString() })
      .eq("id", requestId)
      .eq("recipient_id", userProfileId);

    if (error) {
      console.error("Error updating schedule request:", error);
      toast({
        title: "Error",
        description: "Failed to respond to request",
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: response === "accepted" ? "Request Accepted" : "Request Declined",
      description:
        response === "accepted"
          ? "The schedule change has been approved."
          : "The schedule change has been declined.",
    });

    return true;
  };

  const pendingRequests = requests.filter(
    (r) => r.status === "pending" && r.recipient_id === userProfileId
  );

  const myRequests = requests.filter((r) => r.requester_id === userProfileId);

  return {
    requests,
    pendingRequests,
    myRequests,
    loading,
    createRequest,
    respondToRequest,
    refetch: fetchRequests,
  };
};