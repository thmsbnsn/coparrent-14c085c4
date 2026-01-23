/**
 * RecordMessage - Court-ready message display component
 * 
 * DESIGN SYSTEM ENFORCEMENT:
 * - Removes chat-style bubbles (Risk: informal appearance weakens credibility)
 * - Ensures attribution survives screenshots and printing (Rule: ownership clarity)
 * - Timestamps always visible (Rule: no hidden timestamps)
 * - No color-coded emotional framing (Prohibited pattern)
 * - Messages read like records, not reactions (Required enforcement)
 */

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { resolveSenderName } from "@/lib/displayResolver";

interface ReadReceipt {
  reader_id: string;
  reader_name: string;
  read_at: string;
}

interface RecordMessageProps {
  id: string;
  content: string;
  senderName?: string | null;
  senderRole: string;
  createdAt: string;
  isFromMe: boolean;
  readBy?: ReadReceipt[];
  courtView?: boolean;
}

/**
 * Role labels for attribution clarity
 * RULE: Attribution must survive screenshots and printing
 */
const ROLE_LABELS: Record<string, string> = {
  parent: "Parent",
  guardian: "Guardian", 
  third_party: "Family Member",
};

/**
 * Format timestamp for records
 * RULE: No hidden timestamps - always show full date and time
 */
const formatRecordTimestamp = (dateString: string): string => {
  return format(new Date(dateString), "MMM d, yyyy • h:mm a");
};

/**
 * Format read receipt timestamp
 */
const formatReadTime = (dateString: string): string => {
  return format(new Date(dateString), "MMM d 'at' h:mm a");
};

export const RecordMessage = ({
  id,
  content,
  senderName,
  senderRole,
  createdAt,
  isFromMe,
  readBy,
  courtView = false,
}: RecordMessageProps) => {
  const resolvedName = resolveSenderName(senderName);
  const roleLabel = ROLE_LABELS[senderRole] || "Member";

  return (
    <article
      /**
       * DESIGN: Record-style layout, not chat bubbles
       * RISK MITIGATED: Informal appearance weakens credibility in legal contexts
       */
      className={cn(
        "border-b border-border/50 py-4 first:pt-0 last:border-b-0",
        courtView && "py-3 print:py-2"
      )}
      data-message-id={id}
      data-sender={resolvedName}
      data-timestamp={createdAt}
    >
      {/* Attribution header - ALWAYS visible, never collapsed */}
      <header className="flex items-baseline gap-2 mb-2 flex-wrap">
        {/* 
          RULE: No reliance on color alone for ownership
          Name + Role explicitly stated for legal clarity
        */}
        <span className={cn(
          "font-semibold text-sm",
          courtView && "text-xs print:text-[10pt]"
        )}>
          {resolvedName}
          {isFromMe && <span className="text-muted-foreground font-normal ml-1">(You)</span>}
        </span>
        
        <Badge 
          variant="outline" 
          className={cn(
            "text-[10px] px-1.5 py-0 h-4 font-normal",
            courtView && "print:border-foreground"
          )}
        >
          {roleLabel}
        </Badge>
        
        {/* 
          RULE: Timestamps ALWAYS visible
          RISK MITIGATED: Hidden timestamps create ambiguity in legal review
        */}
        <time 
          dateTime={createdAt}
          className={cn(
            "text-xs text-muted-foreground ml-auto",
            courtView && "text-[10px] print:text-[9pt]"
          )}
        >
          {formatRecordTimestamp(createdAt)}
        </time>
      </header>

      {/* 
        Message content - Plain text, no decorative styling
        RULE: Content is primary, emotion is visually neutralized
      */}
      <div className={cn(
        "pl-0 md:pl-4 text-sm leading-relaxed",
        courtView && "text-xs print:text-[10pt] print:leading-normal"
      )}>
        <p className="whitespace-pre-wrap break-words">{content}</p>
      </div>

      {/* Read receipts - evidentiary value for delivery confirmation */}
      {readBy && readBy.length > 0 && !courtView && (
        <footer className="mt-2 pl-0 md:pl-4">
          <p className="text-[10px] text-muted-foreground">
            Read by: {readBy.map((r, i) => (
              <span key={r.reader_id}>
                {r.reader_name} ({formatReadTime(r.read_at)})
                {i < readBy.length - 1 ? ", " : ""}
              </span>
            ))}
          </p>
        </footer>
      )}
    </article>
  );
};
