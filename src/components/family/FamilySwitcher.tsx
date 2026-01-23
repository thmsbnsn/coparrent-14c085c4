/**
 * FamilySwitcher - Workspace-style family selector
 * 
 * MULTI-FAMILY ISOLATION:
 * - Always visible in dashboard context
 * - Shows which family is currently active
 * - Never defaults silently to a different family
 * - Behaves like a "workspace switcher"
 * 
 * @see docs/SECURITY_MODEL.md
 */

import { useState } from "react";
import { Check, ChevronsUpDown, Plus, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFamily } from "@/contexts/FamilyContext";
import { useToast } from "@/hooks/use-toast";

interface FamilySwitcherProps {
  collapsed?: boolean;
  className?: string;
}

export const FamilySwitcher = ({ collapsed = false, className }: FamilySwitcherProps) => {
  const { 
    families, 
    activeFamily, 
    activeFamilyId, 
    setActiveFamilyId, 
    createFamily,
    hasMultipleFamilies,
    loading 
  } = useFamily();
  const { toast } = useToast();
  
  const [open, setOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Don't render if no families or still loading
  if (loading) {
    return (
      <div className={cn("flex items-center gap-2 px-2 py-1.5", className)}>
        <div className="h-8 w-8 rounded-md bg-muted animate-pulse" />
        {!collapsed && <div className="h-4 w-24 bg-muted rounded animate-pulse" />}
      </div>
    );
  }

  // If no families exist, show prompt to create one
  if (families.length === 0) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setCreateDialogOpen(true)}
        className={cn("justify-start gap-2", className)}
      >
        <Plus className="h-4 w-4" />
        {!collapsed && "Create Family"}
      </Button>
    );
  }

  const handleSelectFamily = (familyId: string) => {
    setActiveFamilyId(familyId);
    setOpen(false);
    toast({
      title: "Family switched",
      description: `Now viewing ${families.find(f => f.id === familyId)?.display_name || "Family"}`,
    });
  };

  const handleCreateFamily = async () => {
    setIsCreating(true);
    try {
      const newFamilyId = await createFamily(newFamilyName.trim() || undefined);
      if (newFamilyId) {
        setActiveFamilyId(newFamilyId);
        toast({
          title: "Family created",
          description: "Your new family has been created successfully.",
        });
        setCreateDialogOpen(false);
        setNewFamilyName("");
      } else {
        toast({
          title: "Error",
          description: "Failed to create family. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsCreating(false);
    }
  };

  const getFamilyDisplayName = (family: typeof families[0], index: number) => {
    return family.display_name || `Family ${index + 1}`;
  };

  // If only one family and collapsed, just show icon
  if (collapsed) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={cn("h-9 w-9", className)}
            title={activeFamily ? getFamilyDisplayName(activeFamily, families.indexOf(activeFamily)) : "Select family"}
          >
            <Users className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px] p-0" align="start" side="right">
          <Command>
            <CommandInput placeholder="Search families..." />
            <CommandList>
              <CommandEmpty>No family found.</CommandEmpty>
              <CommandGroup heading="Your Families">
                {families.map((family, index) => (
                  <CommandItem
                    key={family.id}
                    value={family.id}
                    onSelect={() => handleSelectFamily(family.id)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        activeFamilyId === family.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                    {getFamilyDisplayName(family, index)}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    setCreateDialogOpen(true);
                  }}
                  className="cursor-pointer"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Another Family
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a family"
            className={cn("w-full justify-between", className)}
          >
            <div className="flex items-center gap-2 truncate">
              <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">
                {activeFamily 
                  ? getFamilyDisplayName(activeFamily, families.indexOf(activeFamily))
                  : "Select family"
                }
              </span>
            </div>
            {hasMultipleFamilies && (
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search families..." />
            <CommandList>
              <CommandEmpty>No family found.</CommandEmpty>
              <CommandGroup heading="Your Families">
                {families.map((family, index) => (
                  <CommandItem
                    key={family.id}
                    value={family.id}
                    onSelect={() => handleSelectFamily(family.id)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        activeFamilyId === family.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                    {getFamilyDisplayName(family, index)}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    setCreateDialogOpen(true);
                  }}
                  className="cursor-pointer"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Another Family
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Create Family Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Family</DialogTitle>
            <DialogDescription>
              Create a new co-parenting family. You can invite a co-parent and add children after creation.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="family-name">Family Name (optional)</Label>
              <Input
                id="family-name"
                placeholder="e.g., Smith-Johnson Family"
                value={newFamilyName}
                onChange={(e) => setNewFamilyName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                A neutral name to identify this family. Leave blank for an auto-generated name.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateFamily} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Family"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
