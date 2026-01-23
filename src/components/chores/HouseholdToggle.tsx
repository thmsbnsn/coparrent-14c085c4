/**
 * HouseholdToggle - Switch between parent households
 * 
 * Shows both households' chore charts in a tab-style interface,
 * clearly labeled to avoid confusion for children.
 */

import { Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Household } from "@/hooks/useChoreCharts";

interface HouseholdToggleProps {
  value: Household | "all";
  onChange: (value: Household | "all") => void;
  parentALabel?: string;
  parentBLabel?: string;
  showAllOption?: boolean;
  className?: string;
}

export const HouseholdToggle = ({
  value,
  onChange,
  parentALabel = "Parent A's House",
  parentBLabel = "Parent B's House",
  showAllOption = false,
  className,
}: HouseholdToggleProps) => {
  return (
    <Tabs
      value={value}
      onValueChange={(v) => onChange(v as Household | "all")}
      className={className}
    >
      <TabsList className="grid w-full" style={{ gridTemplateColumns: showAllOption ? "repeat(3, 1fr)" : "repeat(2, 1fr)" }}>
        {showAllOption && (
          <TabsTrigger value="all" className="gap-2">
            <Home className="h-4 w-4" />
            All
          </TabsTrigger>
        )}
        <TabsTrigger value="parent_a" className="gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
          {parentALabel}
        </TabsTrigger>
        <TabsTrigger value="parent_b" className="gap-2">
          <div className="h-2 w-2 rounded-full bg-purple-500" />
          {parentBLabel}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default HouseholdToggle;
