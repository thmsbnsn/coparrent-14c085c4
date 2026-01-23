/**
 * EvidencePanel - Message history display panel
 * 
 * DESIGN SYSTEM ENFORCEMENT:
 * - Clear separation between Evidence (history) and Action (compose)
 * - Messages displayed as records, not chat reactions
 * - Print-ready and screenshot-safe layout
 */

import { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RecordMessage } from "./RecordMessage";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReadReceipt {
  reader_id: string;
  reader_name: string;
  read_at: string;
}

interface Message {
  id: string;
  content: string;
  sender_name?: string | null;
  sender_role: string;
  created_at: string;
  is_from_me: boolean;
  read_by?: ReadReceipt[];
}

interface EvidencePanelProps {
  messages: Message[];
  courtView: boolean;
  className?: string;
}

export const EvidencePanel = ({
  messages,
  courtView,
  className,
}: EvidencePanelProps) => {
  const endRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className={cn(
        "flex-1 flex flex-col items-center justify-center text-center py-12",
        className
      )}>
        <MessageSquare className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground font-medium">No messages in this thread</p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Start the conversation below.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className={cn("flex-1", className)}>
      <div className={cn(
        "p-4 md:p-6",
        courtView && "p-4 print:p-0"
      )}>
        {/* 
          Court View Header - Print identification
          RULE: Attribution must survive printing
        */}
        {courtView && (
          <header className="mb-6 pb-4 border-b-2 border-foreground print:block hidden">
            <h2 className="font-bold text-lg">Message Record</h2>
            <p className="text-sm text-muted-foreground">
              Printed: {new Date().toLocaleString()}
            </p>
          </header>
        )}

        {/* 
          Messages as records 
          RULE: No chat bubbles, no emotional framing
        */}
        <div className={cn(
          courtView && "divide-y divide-border"
        )}>
          {messages.map((message) => (
            <RecordMessage
              key={message.id}
              id={message.id}
              content={message.content}
              senderName={message.sender_name}
              senderRole={message.sender_role}
              createdAt={message.created_at}
              isFromMe={message.is_from_me}
              readBy={message.read_by}
              courtView={courtView}
            />
          ))}
        </div>
        
        <div ref={endRef} />
      </div>
    </ScrollArea>
  );
};
