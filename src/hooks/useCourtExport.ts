import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface ExportProfile {
  id: string;
  full_name: string | null;
  email: string | null;
}

export interface ExportMessage {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  recipient_id: string;
  read_at: string | null;
}

export interface ExportExpense {
  id: string;
  amount: number;
  description: string;
  category: string;
  expense_date: string;
  split_percentage: number | null;
  notes: string | null;
  created_by: string;
  child?: { name: string } | null;
}

export interface ExportScheduleRequest {
  id: string;
  request_type: string;
  original_date: string;
  proposed_date: string | null;
  reason: string | null;
  status: string;
  requester_id: string;
  recipient_id: string;
  created_at: string;
  updated_at: string;
}

export interface ExportExchangeCheckin {
  id: string;
  exchange_date: string;
  checked_in_at: string;
  note: string | null;
  user_id: string;
}

export interface ExportSchedule {
  id: string;
  pattern: string;
  start_date: string;
  exchange_time: string | null;
  exchange_location: string | null;
  holidays: unknown;
}

export interface CourtExportData {
  userProfile: ExportProfile | null;
  coParent: ExportProfile | null;
  messages: ExportMessage[];
  expenses: ExportExpense[];
  scheduleRequests: ExportScheduleRequest[];
  exchangeCheckins: ExportExchangeCheckin[];
  schedule: ExportSchedule | null;
  dateRange: { start: Date; end: Date };
  children: { id: string; name: string }[];
}

export const useCourtExport = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const fetchExportData = useCallback(async (
    dateRange: { start: Date; end: Date }
  ): Promise<CourtExportData | null> => {
    if (!user) {
      toast.error("You must be logged in to export data");
      return null;
    }

    setLoading(true);

    try {
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, email, co_parent_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError || !profile) {
        throw new Error("Failed to fetch user profile");
      }

      // Fetch co-parent profile
      let coParent: ExportProfile | null = null;
      if (profile.co_parent_id) {
        const { data: coParentData } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .eq("id", profile.co_parent_id)
          .maybeSingle();
        coParent = coParentData;
      }

      const startStr = dateRange.start.toISOString();
      const endStr = dateRange.end.toISOString();

      // Fetch all data in parallel
      const [
        messagesRes,
        expensesRes,
        scheduleRequestsRes,
        exchangeCheckinsRes,
        scheduleRes,
        childrenRes,
      ] = await Promise.all([
        // Messages
        supabase
          .from("messages")
          .select("id, content, created_at, sender_id, recipient_id, read_at")
          .or(`sender_id.eq.${profile.id},recipient_id.eq.${profile.id}`)
          .gte("created_at", startStr)
          .lte("created_at", endStr)
          .order("created_at", { ascending: true }),

        // Expenses
        supabase
          .from("expenses")
          .select("id, amount, description, category, expense_date, split_percentage, notes, created_by, child:children(name)")
          .eq("created_by", profile.id)
          .gte("expense_date", dateRange.start.toISOString().split('T')[0])
          .lte("expense_date", dateRange.end.toISOString().split('T')[0])
          .order("expense_date", { ascending: true }),

        // Schedule Requests
        supabase
          .from("schedule_requests")
          .select("*")
          .or(`requester_id.eq.${profile.id},recipient_id.eq.${profile.id}`)
          .gte("created_at", startStr)
          .lte("created_at", endStr)
          .order("created_at", { ascending: true }),

        // Exchange Checkins
        supabase
          .from("exchange_checkins")
          .select("id, exchange_date, checked_in_at, note, user_id")
          .eq("user_id", profile.id)
          .gte("exchange_date", dateRange.start.toISOString().split('T')[0])
          .lte("exchange_date", dateRange.end.toISOString().split('T')[0])
          .order("exchange_date", { ascending: true }),

        // Custody Schedule
        supabase
          .from("custody_schedules")
          .select("id, pattern, start_date, exchange_time, exchange_location, holidays")
          .or(`parent_a_id.eq.${profile.id},parent_b_id.eq.${profile.id}`)
          .maybeSingle(),

        // Children
        supabase
          .from("parent_children")
          .select("child:children(id, name)")
          .eq("parent_id", profile.id),
      ]);

      const messages = messagesRes.data || [];
      const expenses = expensesRes.data || [];
      const scheduleRequests = scheduleRequestsRes.data || [];
      const exchangeCheckins = exchangeCheckinsRes.data || [];
      const schedule = scheduleRes.data;
      const children = (childrenRes.data || [])
        .filter(pc => pc.child)
        .map(pc => pc.child as { id: string; name: string });

      return {
        userProfile: { id: profile.id, full_name: profile.full_name, email: profile.email },
        coParent,
        messages,
        expenses: expenses.map(e => ({
          ...e,
          child: e.child ? { name: (e.child as { name: string }).name } : null
        })),
        scheduleRequests,
        exchangeCheckins,
        schedule,
        dateRange,
        children,
      };
    } catch (error) {
      console.error("Error fetching export data:", error);
      toast.error("Failed to fetch export data");
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    loading,
    fetchExportData,
  };
};
