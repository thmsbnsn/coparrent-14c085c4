import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ERROR_MESSAGES } from "@/lib/errorMessages";

export interface AuditLog {
  id: string;
  created_at: string;
  actor_user_id: string;
  actor_profile_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  child_id: string | null;
  family_context: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  // Joined fields
  actor_name?: string;
  actor_email?: string;
  child_name?: string;
}

interface UseAuditLogsOptions {
  childId?: string | null;
  action?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  limit?: number;
}

export const useAuditLogs = (options: UseAuditLogsOptions = {}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { childId, action, startDate, endDate, limit = 100 } = options;

  const fetchLogs = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("audit_logs")
        .select(`
          *,
          actor:profiles!audit_logs_actor_profile_id_fkey(full_name, email),
          child:children(name)
        `)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (childId) {
        query = query.eq("child_id", childId);
      }

      if (action) {
        query = query.eq("action", action);
      }

      if (startDate) {
        query = query.gte("created_at", startDate.toISOString());
      }

      if (endDate) {
        query = query.lte("created_at", endDate.toISOString());
      }

      const { data, error: queryError } = await query;

      if (queryError) {
        console.error("Error fetching audit logs:", queryError);
        setError("Failed to load audit logs");
        toast({
          title: "Error",
          description: "Failed to load audit logs",
          variant: "destructive",
        });
        return;
      }

      // Transform the data to flatten the joins
      const transformedLogs: AuditLog[] = (data || []).map((log: any) => ({
        ...log,
        actor_name: log.actor?.full_name || null,
        actor_email: log.actor?.email || null,
        child_name: log.child?.name || null,
      }));

      setLogs(transformedLogs);
    } catch (err) {
      console.error("Unexpected error fetching audit logs:", err);
      setError(ERROR_MESSAGES.GENERIC);
    } finally {
      setLoading(false);
    }
  }, [user, childId, action, startDate, endDate, limit, toast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("audit-logs-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "audit_logs",
        },
        (payload) => {
          // Refetch to get joined data
          fetchLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchLogs]);

  return {
    logs,
    loading,
    error,
    refetch: fetchLogs,
  };
};

// Helper to get human-readable action names
export const getActionLabel = (action: string): string => {
  const labels: Record<string, string> = {
    CHILD_VIEW: "Viewed",
    CHILD_INSERT: "Created",
    CHILD_UPDATE: "Updated",
    CHILD_DELETE: "Deleted",
  };
  return labels[action] || action;
};

// Helper to get action color/variant
export const getActionVariant = (action: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (action) {
    case "CHILD_DELETE":
      return "destructive";
    case "CHILD_INSERT":
      return "default";
    case "CHILD_UPDATE":
      return "secondary";
    case "CHILD_VIEW":
      return "outline";
    default:
      return "outline";
  }
};
