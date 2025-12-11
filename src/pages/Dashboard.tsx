import { motion } from "framer-motion";
import { Calendar, MessageSquare, Users, ArrowRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const upcomingExchanges = [
  { date: "Today", time: "5:00 PM", type: "pickup", child: "Emma", location: "School" },
  { date: "Friday", time: "6:00 PM", type: "dropoff", child: "Both", location: "Home" },
];

const recentMessages = [
  { from: "Sarah", time: "2h ago", preview: "Can we discuss the holiday schedule?" },
  { from: "Sarah", time: "Yesterday", preview: "Emma has a dentist appointment next week" },
];

const children = [
  { name: "Emma", age: 8, avatar: "E" },
  { name: "Lucas", age: 5, avatar: "L" },
];

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold">Good afternoon, John</h1>
            <p className="text-muted-foreground mt-1">Here's what's happening with your co-parenting schedule</p>
          </div>
          <Button asChild>
            <Link to="/dashboard/calendar">
              View Full Calendar
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </motion.div>

        {/* Today's Schedule Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border bg-card p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display font-semibold">Today's Parenting Time</h2>
              <p className="text-sm text-muted-foreground">Wednesday, December 11, 2024</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-parent-a-light border border-parent-a">
              <p className="text-sm font-medium text-parent-a mb-1">Your time with children</p>
              <p className="text-2xl font-display font-bold text-parent-a">Until 5:00 PM</p>
              <p className="text-sm text-parent-a/70 mt-2">Exchange at School</p>
            </div>
            <div className="p-4 rounded-xl bg-muted border border-border">
              <p className="text-sm font-medium text-muted-foreground mb-1">After exchange</p>
              <p className="text-lg font-display font-semibold">Sarah's parenting time</p>
              <p className="text-sm text-muted-foreground mt-2">Until Friday 6:00 PM</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Upcoming Exchanges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold">Upcoming Exchanges</h3>
              <Clock className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {upcomingExchanges.map((exchange, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    exchange.type === "pickup" ? "bg-parent-a" : "bg-parent-b"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{exchange.date} at {exchange.time}</p>
                    <p className="text-xs text-muted-foreground">{exchange.child} • {exchange.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Messages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold">Recent Messages</h3>
              <MessageSquare className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {recentMessages.map((msg, i) => (
                <Link
                  key={i}
                  to="/dashboard/messages"
                  className="block p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">{msg.from}</p>
                    <span className="text-xs text-muted-foreground">{msg.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{msg.preview}</p>
                </Link>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-3" asChild>
              <Link to="/dashboard/messages">View All Messages</Link>
            </Button>
          </motion.div>

          {/* Children Quick Access */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold">Your Children</h3>
              <Users className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {children.map((child) => (
                <Link
                  key={child.name}
                  to={`/dashboard/children`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {child.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{child.name}</p>
                    <p className="text-xs text-muted-foreground">{child.age} years old</p>
                  </div>
                </Link>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-3" asChild>
              <Link to="/dashboard/children">Manage Child Info</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
