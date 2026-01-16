import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, MessageSquare, Smile, Sun, Moon, Cloud, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useChildAccount } from "@/hooks/useChildAccount";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";

const MOODS = [
  { emoji: "😊", label: "Happy", color: "bg-green-100 text-green-700 border-green-200" },
  { emoji: "😌", label: "Calm", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { emoji: "😔", label: "Sad", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { emoji: "😤", label: "Frustrated", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { emoji: "😴", label: "Tired", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { emoji: "🤗", label: "Loved", color: "bg-pink-100 text-pink-700 border-pink-200" },
];

const TodayScheduleCard = () => {
  const [events, setEvents] = useState<Array<{ title: string; time: string; type: string }>>([]);
  const { permissions } = useChildAccount();

  // In a real implementation, fetch today's events from the schedule
  useEffect(() => {
    // Mock data for demonstration
    setEvents([
      { title: "School pickup", time: "3:00 PM", type: "exchange" },
      { title: "Soccer practice", time: "5:00 PM", type: "activity" },
    ]);
  }, []);

  return (
    <Card className="overflow-hidden border-2 border-primary/20">
      <CardHeader className="bg-primary/5 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="w-5 h-5 text-primary" />
          Today's Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {events.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No events today</p>
        ) : (
          events.map((event, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                {event.type === "exchange" ? (
                  <Sun className="w-5 h-5 text-primary" />
                ) : (
                  <Heart className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  {permissions.show_full_event_details ? event.title : "Event"}
                </p>
                <p className="text-sm text-muted-foreground">{event.time}</p>
              </div>
            </motion.div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

const MoodCheckIn = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { permissions } = useChildAccount();

  if (!permissions.allow_mood_checkins) {
    return null;
  }

  const handleMoodSelect = async (mood: string) => {
    setSelectedMood(mood);
    setIsSaving(true);

    // In a real implementation, save the mood check-in
    await new Promise((resolve) => setTimeout(resolve, 500));

    toast({
      title: "Mood saved! 🎉",
      description: `You're feeling ${mood.toLowerCase()} today.`,
    });
    setIsSaving(false);
  };

  return (
    <Card className="overflow-hidden border-2 border-accent/20">
      <CardHeader className="bg-accent/5 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Smile className="w-5 h-5 text-accent-foreground" />
          How are you feeling?
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-3 gap-3">
          {MOODS.map((mood, index) => (
            <motion.button
              key={mood.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleMoodSelect(mood.label)}
              disabled={isSaving}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedMood === mood.label
                  ? `${mood.color} scale-105 shadow-md`
                  : "bg-muted/30 hover:bg-muted/50 border-transparent hover:border-border"
              }`}
            >
              <span className="text-3xl block mb-1">{mood.emoji}</span>
              <span className="text-xs font-medium">{mood.label}</span>
            </motion.button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const MessagesCard = () => {
  const navigate = useNavigate();
  const { permissions } = useChildAccount();
  const [unreadCount, setUnreadCount] = useState(0);

  if (!permissions.allow_parent_messaging && !permissions.allow_family_chat) {
    return null;
  }

  return (
    <Card
      className="overflow-hidden border-2 border-secondary/20 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate("/dashboard/messages")}
    >
      <CardHeader className="bg-secondary/5 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="w-5 h-5 text-secondary-foreground" />
          Messages
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-muted-foreground text-center py-4">
          Tap to see messages from your family
        </p>
      </CardContent>
    </Card>
  );
};

export default function KidsDashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const { isChildAccount, permissions, loading: permLoading, linkedChildId } = useChildAccount();
  const [childName, setChildName] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchChildName = async () => {
      if (!linkedChildId) return;

      const { data } = await supabase
        .from("children")
        .select("name")
        .eq("id", linkedChildId)
        .maybeSingle();

      if (data) {
        setChildName(data.name);
      }
    };

    if (linkedChildId) {
      fetchChildName();
    }
  }, [linkedChildId]);

  // Redirect parent accounts to normal dashboard
  useEffect(() => {
    if (!authLoading && !permLoading && !isChildAccount && user) {
      navigate("/dashboard");
    }
  }, [authLoading, permLoading, isChildAccount, user, navigate]);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "See you later! 👋",
    });
    navigate("/");
  };

  if (authLoading || permLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading..." />
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-background to-muted/30"
      style={{ paddingTop: "env(safe-area-inset-top, 0)" }}
    >
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold">
            Hi, {childName || "there"}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">Here's what's happening today</p>
        </motion.div>

        {/* Today's Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <TodayScheduleCard />
        </motion.div>

        {/* Mood Check-in */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <MoodCheckIn />
        </motion.div>

        {/* Messages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <MessagesCard />
        </motion.div>
      </main>

      {/* Safe area bottom padding */}
      <div style={{ paddingBottom: "env(safe-area-inset-bottom, 1rem)" }} />
    </div>
  );
}
