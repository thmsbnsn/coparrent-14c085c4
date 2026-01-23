/**
 * ThreadSummaryBar - Summary state for message threads
 * 
 * DESIGN SYSTEM ENFORCEMENT:
 * - Summary Before Scroll: Users must never scroll to understand urgency
 * - Surfaces unread count, action-required status at a glance
 * - Court view indicator when enabled
 */

import { AlertCircle, CheckCircle2, Clock, Gavel, Mail, MailOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ThreadSummaryBarProps {
  unreadCount: number;
  totalMessages: number;
  threadType: "family_channel" | "group_chat" | "direct_message";
  courtView: boolean;
  className?: string;
}

export const ThreadSummaryBar = ({
  unreadCount,
  totalMessages,
  threadType,
  courtView,
  className,
}: ThreadSummaryBarProps) => {
  const hasUnread = unreadCount > 0;

  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-2 bg-muted/30 border-b border-border text-xs",
      courtView && "bg-muted/50 print:bg-transparent print:border-foreground",
      className
    )}>
      {/* Thread status summary */}
      <div className="flex items-center gap-2">
        {hasUnread ? (
          <>
            <Mail className="w-3.5 h-3.5 text-primary" />
            <span className="font-medium">
              {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
            </span>
          </>
        ) : (
          <>
            <MailOpen className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">All messages read</span>
          </>
        )}
      </div>

      {/* Separator */}
      <div className="w-px h-3 bg-border" />

      {/* Total messages count - evidentiary context */}
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Clock className="w-3 h-3" />
        <span>{totalMessages} total</span>
      </div>

      {/* Court View indicator - prominent when active */}
      {courtView && (
        <>
          <div className="w-px h-3 bg-border" />
          <Badge 
            variant="outline" 
            className="gap-1 text-[10px] h-5 bg-background print:border-foreground"
          >
            <Gavel className="w-3 h-3" />
            Court View
          </Badge>
        </>
      )}

      {/* Thread type indicator */}
      <div className="ml-auto">
        <Badge variant="secondary" className="text-[10px] h-5">
          {threadType === "family_channel" && "Family Channel"}
          {threadType === "group_chat" && "Group"}
          {threadType === "direct_message" && "Direct"}
        </Badge>
      </div>
    </div>
  );
};
