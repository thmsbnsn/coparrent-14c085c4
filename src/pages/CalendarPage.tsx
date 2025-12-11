import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, Printer, Download } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Sample schedule data - alternating weeks pattern
const getParentForDate = (date: Date): "A" | "B" => {
  const weekNumber = Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000));
  return weekNumber % 2 === 0 ? "A" : "B";
};

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"calendar" | "court">("calendar");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold">Parenting Calendar</h1>
            <p className="text-muted-foreground mt-1">View and manage your custody schedule</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Edit Schedule
            </Button>
          </div>
        </motion.div>

        {/* View Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2"
        >
          <Button
            variant={viewMode === "calendar" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("calendar")}
          >
            Calendar View
          </Button>
          <Button
            variant={viewMode === "court" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("court")}
          >
            Court View
          </Button>
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap items-center gap-6"
        >
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-parent-a" />
            <span className="text-sm">Your Time (Parent A)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-parent-b" />
            <span className="text-sm">Co-Parent's Time (Parent B)</span>
          </div>
        </motion.div>

        {viewMode === "calendar" ? (
          /* Calendar View */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-border bg-card overflow-hidden"
          >
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <button
                onClick={prevMonth}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-display font-semibold">
                {MONTHS[month]} {year}
              </h2>
              <button
                onClick={nextMonth}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-border">
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="py-3 text-center text-sm font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {days.map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="aspect-square border-b border-r border-border bg-muted/20" />;
                }

                const parent = getParentForDate(date);
                const isToday = date.getTime() === today.getTime();

                return (
                  <div
                    key={date.toISOString()}
                    className={cn(
                      "aspect-square p-2 border-b border-r border-border relative transition-colors cursor-pointer hover:bg-muted/50",
                      parent === "A" ? "bg-parent-a-light" : "bg-parent-b-light"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium",
                        isToday && "bg-primary text-primary-foreground"
                      )}
                    >
                      {date.getDate()}
                    </span>
                    <div className={cn(
                      "absolute bottom-1 right-1 w-2 h-2 rounded-full",
                      parent === "A" ? "bg-parent-a" : "bg-parent-b"
                    )} />
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          /* Court View */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-xl font-display font-bold mb-2">Parenting Time Schedule</h2>
              <p className="text-sm text-muted-foreground">Court-Ready Summary Document</p>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <h3 className="font-semibold mb-2">Schedule Pattern</h3>
                <p className="text-sm text-muted-foreground">
                  Alternating weeks between Parent A and Parent B, with exchanges occurring on Sundays at 6:00 PM.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <h3 className="font-semibold mb-2">Holiday Schedule</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Thanksgiving: Alternating years (Parent A - Even years)</p>
                  <p>• Christmas Eve/Day: Split (Eve to one parent, Day to other)</p>
                  <p>• Summer Break: Two consecutive weeks each parent</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <h3 className="font-semibold mb-2">Exchange Details</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Primary Location: School pickup/dropoff</p>
                  <p>• Alternate Location: Public library</p>
                  <p>• Standard Time: 6:00 PM</p>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export as PDF
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CalendarPage;
