/**
 * CourtViewToggle - First-class court view control
 * 
 * DESIGN SYSTEM ENFORCEMENT:
 * - Court View is not a toggle buried in settings (Rule: discoverable and intentional)
 * - Must be prominent and accessible at all times
 * - Provides clear indication of mode and purpose
 */

import { Gavel, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface CourtViewToggleProps {
  enabled: boolean;
  onToggle: () => void;
  className?: string;
  compact?: boolean;
}

export const CourtViewToggle = ({
  enabled,
  onToggle,
  className,
  compact = false,
}: CourtViewToggleProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={enabled ? "default" : "outline"}
          size={compact ? "icon" : "sm"}
          onClick={onToggle}
          className={cn(
            "gap-2 transition-all",
            enabled && "bg-foreground text-background hover:bg-foreground/90",
            className
          )}
          aria-pressed={enabled}
          aria-label={enabled ? "Exit court view" : "Enter court view"}
        >
          <Gavel className="w-4 h-4" />
          {!compact && (
            <span className="hidden sm:inline">
              {enabled ? "Exit Court View" : "Court View"}
            </span>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs">
        <p className="font-medium mb-1">
          {enabled ? "Court View Active" : "Enable Court View"}
        </p>
        <p className="text-xs text-muted-foreground">
          {enabled 
            ? "Showing simplified, print-ready format optimized for legal documentation."
            : "Switch to a simplified layout that removes decorative UI and is optimized for printing and legal review."
          }
        </p>
      </TooltipContent>
    </Tooltip>
  );
};
