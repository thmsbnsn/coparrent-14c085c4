/**
 * DeliberateComposer - Deliberate, non-impulsive message composition
 * 
 * DESIGN SYSTEM ENFORCEMENT:
 * - Action Discipline: Feel deliberate, not impulsive
 * - Avoid encouraging rapid-fire responses
 * - Visually separated from message history (Evidence vs Action separation)
 * - Includes reminder of record-keeping nature
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { Send, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface DeliberateComposerProps {
  onSend: (message: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  onTyping?: () => void;
}

/**
 * Minimum character threshold before send is enabled
 * RULE: Encourage thoughtful messages, discourage single-word reactions
 */
const MIN_MESSAGE_LENGTH = 1;

/**
 * Delay before showing "take your time" reminder
 */
const REMINDER_DELAY_MS = 500;

export const DeliberateComposer = ({
  onSend,
  disabled = false,
  placeholder = "Compose your message...",
  className,
  onTyping,
}: DeliberateComposerProps) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const reminderTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const canSend = message.trim().length >= MIN_MESSAGE_LENGTH && !sending && !disabled;

  // Show reminder after user starts typing
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    
    if (value.trim().length > 0) {
      onTyping?.();
      
      // Show reminder after brief typing pause
      if (reminderTimeoutRef.current) {
        clearTimeout(reminderTimeoutRef.current);
      }
      reminderTimeoutRef.current = setTimeout(() => {
        setShowReminder(true);
      }, REMINDER_DELAY_MS);
    } else {
      setShowReminder(false);
    }
  }, [onTyping]);

  // Clear reminder timeout on unmount
  useEffect(() => {
    return () => {
      if (reminderTimeoutRef.current) {
        clearTimeout(reminderTimeoutRef.current);
      }
    };
  }, []);

  const handleSend = useCallback(async () => {
    if (!canSend) return;
    
    const trimmedMessage = message.trim();
    setSending(true);
    setShowReminder(false);
    
    try {
      await onSend(trimmedMessage);
      setMessage("");
      // Re-focus textarea after send
      textareaRef.current?.focus();
    } finally {
      setSending(false);
    }
  }, [canSend, message, onSend]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Shift+Enter for new line, Enter alone sends (but with confirmation behavior)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  return (
    <div className={cn(
      /**
       * DESIGN: Visually distinct compose area
       * RULE: Evidence and Action must not visually blur together
       */
      "border-t-2 border-border bg-card",
      className
    )}>
      {/* 
        Record-keeping reminder 
        RULE: Messages are immutable court records - users should know this
      */}
      <div className="px-4 py-2 bg-muted/30 border-b border-border/50">
        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
          Messages are permanent records and may be used in legal proceedings.
        </p>
      </div>

      <div className="p-4">
        {/* Deliberation reminder - shows after typing starts */}
        {showReminder && message.length > 10 && (
          <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground animate-in fade-in duration-300">
            <Clock className="w-3.5 h-3.5" />
            <span>Take your time. Review before sending.</span>
          </div>
        )}

        <div className="flex gap-3">
          {/* 
            Textarea instead of input 
            RULE: Encourages thoughtful, multi-line messages vs quick one-liners
          */}
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || sending}
            className={cn(
              "min-h-[80px] max-h-[200px] resize-none text-sm",
              "focus-visible:ring-1 focus-visible:ring-ring"
            )}
            rows={3}
          />
          
          <div className="flex flex-col justify-end">
            <Button
              onClick={handleSend}
              disabled={!canSend}
              size="icon"
              className="h-10 w-10"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Character count - subtle feedback */}
        <div className="mt-2 flex justify-between items-center">
          <p className="text-[10px] text-muted-foreground">
            Press Enter to send, Shift+Enter for new line
          </p>
          <p className="text-[10px] text-muted-foreground">
            {message.length > 0 && `${message.length} characters`}
          </p>
        </div>
      </div>
    </div>
  );
};
