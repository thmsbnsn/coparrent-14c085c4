/**
 * ChoreListEditor - Create/Edit a chore list
 * 
 * Only the owning parent can edit their household's list.
 * Used for creating new lists or modifying existing ones.
 */

import { useState } from "react";
import { Plus, Trash2, GripVertical, Square, Circle, Star, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Chore, ChoreList, CompletionStyle } from "@/hooks/useChoreCharts";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const COMPLETION_STYLES: { value: CompletionStyle; icon: React.ElementType; label: string }[] = [
  { value: "box", icon: Square, label: "Checkbox" },
  { value: "circle", icon: Circle, label: "Circle" },
  { value: "star", icon: Star, label: "Star" },
  { value: "heart", icon: Heart, label: "Heart" },
];

interface LocalChore {
  id: string;
  title: string;
  description: string;
  completion_style: CompletionStyle;
  days_active: boolean[];
  assigned_child_ids: (string | null)[];
}

interface ChoreListEditorProps {
  choreList?: ChoreList | null;
  existingChores?: Chore[];
  children: { id: string; name: string }[];
  onSave: (data: {
    householdLabel: string;
    colorScheme: string;
    allowChildCompletion: boolean;
    requireParentConfirm: boolean;
    chores: LocalChore[];
  }) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export const ChoreListEditor = ({
  choreList,
  existingChores = [],
  children,
  onSave,
  onCancel,
  isSaving,
}: ChoreListEditorProps) => {
  const [householdLabel, setHouseholdLabel] = useState(choreList?.household_label || "");
  const [colorScheme, setColorScheme] = useState(choreList?.color_scheme || "blue");
  const [allowChildCompletion, setAllowChildCompletion] = useState(
    choreList?.allow_child_completion ?? true
  );
  const [requireParentConfirm, setRequireParentConfirm] = useState(
    choreList?.require_parent_confirm ?? false
  );

  const [chores, setChores] = useState<LocalChore[]>(() =>
    existingChores.length > 0
      ? existingChores.map((c) => ({
          id: c.id,
          title: c.title,
          description: c.description || "",
          completion_style: c.completion_style,
          days_active: c.days_active,
          assigned_child_ids: c.assignments?.map((a) => a.child_id) || [null],
        }))
      : []
  );

  const [newChoreTitle, setNewChoreTitle] = useState("");

  const addChore = () => {
    if (!newChoreTitle.trim()) return;
    setChores([
      ...chores,
      {
        id: `new-${Date.now()}`,
        title: newChoreTitle.trim(),
        description: "",
        completion_style: "box",
        days_active: [true, true, true, true, true, true, true],
        assigned_child_ids: [null], // All children by default
      },
    ]);
    setNewChoreTitle("");
  };

  const removeChore = (id: string) => {
    setChores(chores.filter((c) => c.id !== id));
  };

  const updateChore = (id: string, updates: Partial<LocalChore>) => {
    setChores(chores.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const toggleDay = (choreId: string, dayIndex: number) => {
    setChores(
      chores.map((c) =>
        c.id === choreId
          ? { ...c, days_active: c.days_active.map((d, i) => (i === dayIndex ? !d : d)) }
          : c
      )
    );
  };

  const handleSave = () => {
    onSave({
      householdLabel,
      colorScheme,
      allowChildCompletion,
      requireParentConfirm,
      chores,
    });
  };

  return (
    <div className="space-y-6">
      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Chart Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="household-label">Household Name</Label>
              <Input
                id="household-label"
                value={householdLabel}
                onChange={(e) => setHouseholdLabel(e.target.value)}
                placeholder="e.g., Mom's House, Dad's House"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="color-scheme">Color Theme</Label>
              <Select value={colorScheme} onValueChange={setColorScheme}>
                <SelectTrigger id="color-scheme" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="purple">Purple</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="orange">Orange</SelectItem>
                  <SelectItem value="pink">Pink</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allow-child">Children can mark chores complete</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Allow children to check off their own chores
                </p>
              </div>
              <Switch
                id="allow-child"
                checked={allowChildCompletion}
                onCheckedChange={setAllowChildCompletion}
              />
            </div>

            {allowChildCompletion && (
              <div className="flex items-center justify-between pl-4 border-l-2 border-muted">
                <div>
                  <Label htmlFor="require-confirm">Require parent confirmation</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Child completions need your approval
                  </p>
                </div>
                <Switch
                  id="require-confirm"
                  checked={requireParentConfirm}
                  onCheckedChange={setRequireParentConfirm}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chores */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base">Chores</CardTitle>
          <Badge variant="secondary">{chores.length} chores</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add chore */}
          <div className="flex gap-2">
            <Input
              value={newChoreTitle}
              onChange={(e) => setNewChoreTitle(e.target.value)}
              placeholder="Add a chore..."
              onKeyDown={(e) => e.key === "Enter" && addChore()}
            />
            <Button onClick={addChore} disabled={!newChoreTitle.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Chores table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 font-medium">Chore</th>
                  <th className="text-center py-2 px-1 font-medium w-16">Style</th>
                  {children.length > 1 && (
                    <th className="text-center py-2 px-1 font-medium w-24">Assigned</th>
                  )}
                  {DAYS.map((day) => (
                    <th key={day} className="text-center py-2 px-1 font-medium w-10">
                      {day}
                    </th>
                  ))}
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {chores.map((chore) => (
                    <motion.tr
                      key={chore.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="border-b hover:bg-muted/50"
                    >
                      <td className="py-2 px-2">
                        <Input
                          value={chore.title}
                          onChange={(e) => updateChore(chore.id, { title: e.target.value })}
                          className="h-8"
                        />
                      </td>
                      <td className="text-center py-2 px-1">
                        <Select
                          value={chore.completion_style}
                          onValueChange={(v) =>
                            updateChore(chore.id, { completion_style: v as CompletionStyle })
                          }
                        >
                          <SelectTrigger className="h-8 w-14">
                            <SelectValue>
                              {(() => {
                                const style = COMPLETION_STYLES.find(
                                  (s) => s.value === chore.completion_style
                                );
                                const Icon = style?.icon || Square;
                                return <Icon className="h-4 w-4" />;
                              })()}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {COMPLETION_STYLES.map((style) => (
                              <SelectItem key={style.value} value={style.value}>
                                <div className="flex items-center gap-2">
                                  <style.icon className="h-4 w-4" />
                                  {style.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      {children.length > 1 && (
                        <td className="text-center py-2 px-1">
                          <Select
                            value={
                              chore.assigned_child_ids.includes(null)
                                ? "all"
                                : chore.assigned_child_ids[0] || "all"
                            }
                            onValueChange={(v) =>
                              updateChore(chore.id, {
                                assigned_child_ids: v === "all" ? [null] : [v],
                              })
                            }
                          >
                            <SelectTrigger className="h-8 w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              {children.map((child) => (
                                <SelectItem key={child.id} value={child.id}>
                                  {child.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                      )}
                      {chore.days_active.map((active, i) => (
                        <td key={i} className="text-center py-2 px-1">
                          <Checkbox
                            checked={active}
                            onCheckedChange={() => toggleDay(chore.id, i)}
                          />
                        </td>
                      ))}
                      <td className="py-2 px-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeChore(chore.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>

            {chores.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No chores added yet. Add some above!
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving || chores.length === 0}>
          {isSaving ? "Saving..." : choreList ? "Save Changes" : "Create Chore Chart"}
        </Button>
      </div>
    </div>
  );
};

export default ChoreListEditor;
