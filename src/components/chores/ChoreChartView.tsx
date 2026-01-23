/**
 * ChoreChartView - Display a chore chart with completion tracking
 * 
 * Age-based UX:
 * - Early (3-6): Large targets, visual shapes, no dates
 * - Middle (7-11): Clear weekly structure, descriptions
 * - Adolescent (12-17): Compact list, history visible
 */

import { useMemo } from "react";
import { format, startOfWeek, addDays, isToday, isBefore } from "date-fns";
import { Check, Square, Circle, Star, Heart, Home, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Chore, ChoreCompletion, ChoreList, CompletionStyle, AgeGroup } from "@/hooks/useChoreCharts";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface Child {
  id: string;
  name: string;
  date_of_birth: string | null;
}

interface ChoreChartViewProps {
  choreList: ChoreList;
  chores: Chore[];
  completions: ChoreCompletion[];
  children: Child[];
  selectedChildId: string | null;
  ageGroup: AgeGroup;
  weekStart: Date;
  isOwner: boolean;
  onToggleCompletion: (choreId: string, childId: string, date: Date, isComplete: boolean) => void;
  onEdit?: () => void;
  readOnly?: boolean;
}

const SHAPE_ICONS: Record<CompletionStyle, React.ElementType> = {
  box: Square,
  circle: Circle,
  star: Star,
  heart: Heart,
};

const COLOR_CLASSES: Record<string, { bg: string; border: string; text: string }> = {
  blue: { bg: "bg-blue-100 dark:bg-blue-950", border: "border-blue-300 dark:border-blue-700", text: "text-blue-600 dark:text-blue-400" },
  purple: { bg: "bg-purple-100 dark:bg-purple-950", border: "border-purple-300 dark:border-purple-700", text: "text-purple-600 dark:text-purple-400" },
  green: { bg: "bg-green-100 dark:bg-green-950", border: "border-green-300 dark:border-green-700", text: "text-green-600 dark:text-green-400" },
  orange: { bg: "bg-orange-100 dark:bg-orange-950", border: "border-orange-300 dark:border-orange-700", text: "text-orange-600 dark:text-orange-400" },
  pink: { bg: "bg-pink-100 dark:bg-pink-950", border: "border-pink-300 dark:border-pink-700", text: "text-pink-600 dark:text-pink-400" },
};

export const ChoreChartView = ({
  choreList,
  chores,
  completions,
  children,
  selectedChildId,
  ageGroup,
  weekStart,
  isOwner,
  onToggleCompletion,
  onEdit,
  readOnly = false,
}: ChoreChartViewProps) => {
  const colors = COLOR_CLASSES[choreList.color_scheme] || COLOR_CLASSES.blue;

  // Generate dates for the week
  const weekDates = useMemo(() => {
    return DAYS.map((_, i) => addDays(weekStart, i));
  }, [weekStart]);

  // Filter chores for selected child
  const filteredChores = useMemo(() => {
    if (!selectedChildId) return chores;
    return chores.filter((chore) => {
      const assignments = chore.assignments || [];
      // Include if assigned to all children (null) or specifically to this child
      return assignments.some((a) => a.child_id === null || a.child_id === selectedChildId);
    });
  }, [chores, selectedChildId]);

  // Check if a chore is complete for a child on a date
  const isComplete = (choreId: string, childId: string, date: Date): boolean => {
    const dateStr = format(date, "yyyy-MM-dd");
    return completions.some(
      (c) => c.chore_id === choreId && c.child_id === childId && c.completion_date === dateStr
    );
  };

  // Handle toggle - check if allowed
  const handleToggle = (choreId: string, childId: string, date: Date) => {
    if (readOnly) return;
    // Don't allow toggling future dates
    if (isBefore(new Date(), date) && !isToday(date)) return;
    const complete = isComplete(choreId, childId, date);
    onToggleCompletion(choreId, childId, date, !complete);
  };

  // Calculate completion percentage for today
  const todayIndex = weekDates.findIndex((d) => isToday(d));
  const todayCompletions = todayIndex >= 0 && selectedChildId
    ? filteredChores.filter((chore) => {
        if (!chore.days_active[todayIndex]) return false;
        return isComplete(chore.id, selectedChildId, weekDates[todayIndex]);
      }).length
    : 0;
  const todayTotal = todayIndex >= 0
    ? filteredChores.filter((c) => c.days_active[todayIndex]).length
    : 0;

  // Render based on age group
  if (ageGroup === "early") {
    return (
      <EarlyChildhoodView
        choreList={choreList}
        chores={filteredChores}
        selectedChildId={selectedChildId}
        todayIndex={todayIndex}
        weekDates={weekDates}
        colors={colors}
        isComplete={isComplete}
        onToggle={handleToggle}
        todayCompletions={todayCompletions}
        todayTotal={todayTotal}
        readOnly={readOnly}
      />
    );
  }

  return (
    <Card className={cn("border-2", colors.border)}>
      <CardHeader className={cn("flex-row items-center justify-between", colors.bg)}>
        <div className="flex items-center gap-3">
          <Home className={cn("h-5 w-5", colors.text)} />
          <div>
            <CardTitle className="text-base">
              {choreList.household_label || (choreList.household === "parent_a" ? "Parent A's House" : "Parent B's House")}
            </CardTitle>
            {selectedChildId && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {children.find((c) => c.id === selectedChildId)?.name}'s Chores
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {todayTotal > 0 && (
            <Badge variant="secondary">
              {todayCompletions}/{todayTotal} today
            </Badge>
          )}
          {isOwner && onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Chore</th>
                {weekDates.map((date, i) => (
                  <th
                    key={i}
                    className={cn(
                      "text-center py-3 px-2 font-medium w-14",
                      isToday(date) && "bg-primary/10"
                    )}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-muted-foreground">{DAYS[i]}</span>
                      <span className={cn("text-sm", isToday(date) && "font-bold text-primary")}>
                        {format(date, "d")}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredChores.map((chore) => {
                const Icon = SHAPE_ICONS[chore.completion_style];
                return (
                  <tr key={chore.id} className="border-b hover:bg-muted/30">
                    <td className="py-3 px-4">
                      <div className="font-medium">{chore.title}</div>
                      {ageGroup === "middle" && chore.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{chore.description}</p>
                      )}
                    </td>
                    {weekDates.map((date, i) => {
                      const active = chore.days_active[i];
                      const completed = selectedChildId ? isComplete(chore.id, selectedChildId, date) : false;
                      const canToggle = active && !readOnly && selectedChildId && !isBefore(new Date(), date);

                      return (
                        <td
                          key={i}
                          className={cn(
                            "text-center py-3 px-2",
                            isToday(date) && "bg-primary/10"
                          )}
                        >
                          {active ? (
                            <motion.button
                              whileHover={canToggle ? { scale: 1.1 } : {}}
                              whileTap={canToggle ? { scale: 0.9 } : {}}
                              onClick={() => selectedChildId && handleToggle(chore.id, selectedChildId, date)}
                              disabled={!canToggle}
                              className={cn(
                                "mx-auto w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                completed
                                  ? cn(colors.bg, colors.text)
                                  : "border-2 border-muted-foreground/30 text-muted-foreground/30",
                                canToggle && "cursor-pointer hover:border-primary"
                              )}
                            >
                              {completed ? (
                                <Check className="h-5 w-5" />
                              ) : (
                                <Icon className="h-5 w-5" />
                              )}
                            </motion.button>
                          ) : (
                            <span className="text-muted-foreground/30">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredChores.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No chores assigned yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Early Childhood View (Ages 3-6)
const EarlyChildhoodView = ({
  choreList,
  chores,
  selectedChildId,
  todayIndex,
  weekDates,
  colors,
  isComplete,
  onToggle,
  todayCompletions,
  todayTotal,
  readOnly,
}: {
  choreList: ChoreList;
  chores: Chore[];
  selectedChildId: string | null;
  todayIndex: number;
  weekDates: Date[];
  colors: { bg: string; border: string; text: string };
  isComplete: (choreId: string, childId: string, date: Date) => boolean;
  onToggle: (choreId: string, childId: string, date: Date) => void;
  todayCompletions: number;
  todayTotal: number;
  readOnly: boolean;
}) => {
  // For early childhood, focus on TODAY only
  const todaysChores = todayIndex >= 0 
    ? chores.filter((c) => c.days_active[todayIndex])
    : [];

  return (
    <Card className={cn("border-4", colors.border)}>
      <CardHeader className={cn("text-center", colors.bg)}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Home className={cn("h-6 w-6", colors.text)} />
        </div>
        <CardTitle className="text-xl">
          {choreList.household_label || "My Chores Today"}
        </CardTitle>
        {todayTotal > 0 && (
          <div className="flex items-center justify-center gap-2 mt-2">
            {Array.from({ length: todayTotal }).map((_, i) => (
              <motion.div
                key={i}
                initial={false}
                animate={{ scale: i < todayCompletions ? 1.1 : 1 }}
                className={cn(
                  "w-4 h-4 rounded-full",
                  i < todayCompletions ? colors.text.replace("text-", "bg-") : "bg-muted"
                )}
              />
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {todaysChores.map((chore) => {
              const Icon = SHAPE_ICONS[chore.completion_style];
              const completed = selectedChildId && todayIndex >= 0
                ? isComplete(chore.id, selectedChildId, weekDates[todayIndex])
                : false;

              return (
                <motion.div
                  key={chore.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <motion.button
                    whileHover={!readOnly && selectedChildId ? { scale: 1.03 } : {}}
                    whileTap={!readOnly && selectedChildId ? { scale: 0.97 } : {}}
                    onClick={() => {
                      if (selectedChildId && todayIndex >= 0 && !readOnly) {
                        onToggle(chore.id, selectedChildId, weekDates[todayIndex]);
                      }
                    }}
                    disabled={readOnly || !selectedChildId}
                    className={cn(
                      "w-full p-6 rounded-2xl border-4 flex flex-col items-center gap-3 transition-all",
                      completed
                        ? cn(colors.bg, colors.border, "shadow-lg")
                        : "border-muted bg-background hover:border-primary/50"
                    )}
                  >
                    <div
                      className={cn(
                        "w-16 h-16 rounded-xl flex items-center justify-center",
                        completed ? colors.text : "text-muted-foreground"
                      )}
                    >
                      {completed ? (
                        <Check className="h-10 w-10" strokeWidth={3} />
                      ) : (
                        <Icon className="h-10 w-10" />
                      )}
                    </div>
                    <span className="text-lg font-semibold text-center">{chore.title}</span>
                  </motion.button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {todaysChores.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-lg">
            No chores for today! 🎉
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChoreChartView;
