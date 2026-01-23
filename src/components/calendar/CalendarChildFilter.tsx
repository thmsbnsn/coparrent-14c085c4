/**
 * CalendarChildFilter - Multi-calendar child selector
 * 
 * MULTI-CALENDAR SUPPORT:
 * - Shows "All children in this family" option
 * - Individual child calendars selectable
 * - Clear visual indication of current selection
 * - Mobile-friendly dropdown
 * 
 * @see Part C.5 of MULTI-FAMILY spec
 */

import { useState } from "react";
import { Check, ChevronsUpDown, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export interface Child {
  id: string;
  name: string;
  avatar_url?: string | null;
}

interface CalendarChildFilterProps {
  children: Child[];
  selectedChildIds: string[];
  onSelectionChange: (childIds: string[]) => void;
  className?: string;
}

export const CalendarChildFilter = ({
  children,
  selectedChildIds,
  onSelectionChange,
  className,
}: CalendarChildFilterProps) => {
  const [open, setOpen] = useState(false);

  // Check if "all children" is selected (empty array = all)
  const allSelected = selectedChildIds.length === 0;

  const handleSelectAll = () => {
    onSelectionChange([]);
    setOpen(false);
  };

  const handleSelectChild = (childId: string) => {
    if (selectedChildIds.includes(childId)) {
      // Deselect this child
      const newSelection = selectedChildIds.filter(id => id !== childId);
      onSelectionChange(newSelection);
    } else {
      // Select this child (add to existing selection)
      onSelectionChange([...selectedChildIds, childId]);
    }
  };

  const getDisplayText = () => {
    if (allSelected || selectedChildIds.length === 0) {
      return "All Children";
    }
    if (selectedChildIds.length === 1) {
      const child = children.find(c => c.id === selectedChildIds[0]);
      return child?.name || "1 child";
    }
    return `${selectedChildIds.length} children`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Filter by child"
          className={cn("justify-between gap-2", className)}
        >
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{getDisplayText()}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0" align="start">
        <Command>
          <CommandList>
            <CommandEmpty>No children found.</CommandEmpty>
            <CommandGroup heading="Filter Calendar">
              {/* All children option */}
              <CommandItem
                value="all"
                onSelect={handleSelectAll}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    allSelected ? "opacity-100" : "opacity-0"
                  )}
                />
                <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                All Children
                <Badge variant="secondary" className="ml-auto text-xs">
                  {children.length}
                </Badge>
              </CommandItem>

              {/* Individual children */}
              {children.map((child) => {
                const isSelected = selectedChildIds.includes(child.id);
                return (
                  <CommandItem
                    key={child.id}
                    value={child.id}
                    onSelect={() => handleSelectChild(child.id)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex items-center gap-2">
                      {child.avatar_url ? (
                        <img
                          src={child.avatar_url}
                          alt=""
                          className="h-5 w-5 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-[10px] font-medium text-primary">
                            {child.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="truncate">{child.name}</span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
