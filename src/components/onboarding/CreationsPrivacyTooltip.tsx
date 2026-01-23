/**
 * Creations Privacy Tooltip
 * 
 * One-time onboarding tooltip explaining the private-by-default sharing model
 * for the Creations Library.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Share2, Eye, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "coparrent_creations_privacy_seen";

export function CreationsPrivacyTooltip() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkIfSeen = async () => {
      setIsLoading(true);
      
      // Check localStorage first
      const localSeen = localStorage.getItem(STORAGE_KEY);
      if (localSeen === "true") {
        setIsLoading(false);
        return;
      }

      // If logged in, check database preferences
      if (user) {
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("preferences")
            .eq("user_id", user.id)
            .maybeSingle();

          if (profile?.preferences) {
            const prefs = profile.preferences as Record<string, unknown>;
            if (prefs.creations_privacy_tooltip_seen) {
              localStorage.setItem(STORAGE_KEY, "true");
              setIsLoading(false);
              return;
            }
          }
        } catch (error) {
          console.error("Failed to check tooltip state:", error);
        }
      }

      // Not seen yet - show the tooltip after a short delay
      setTimeout(() => {
        setIsVisible(true);
        setIsLoading(false);
      }, 500);
    };

    checkIfSeen();
  }, [user]);

  const handleDismiss = async () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, "true");

    // Persist to database if logged in
    if (user) {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("preferences")
          .eq("user_id", user.id)
          .maybeSingle();

        const currentPrefs = (profile?.preferences as Record<string, unknown>) || {};
        
        await supabase
          .from("profiles")
          .update({
            preferences: JSON.parse(JSON.stringify({
              ...currentPrefs,
              creations_privacy_tooltip_seen: true,
            })),
          })
          .eq("user_id", user.id);
      } catch (error) {
        console.error("Failed to persist tooltip state:", error);
      }
    }
  };

  if (isLoading || !isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed bottom-6 right-6 z-50 w-[340px] max-w-[calc(100vw-3rem)]"
      >
        <div className="rounded-xl border border-primary/20 bg-card shadow-2xl overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-primary/15 to-primary/5 px-5 py-4 border-b border-border">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-foreground">
                    Private by Default
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Your creations, your control
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 -mr-1 -mt-1"
                onClick={handleDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Everything you create is <span className="text-foreground font-medium">private to you</span> until you choose to share it.
            </p>

            {/* Feature list */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Created privately</p>
                  <p className="text-xs text-muted-foreground">
                    Only you can see new creations
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Explicit sharing</p>
                  <p className="text-xs text-muted-foreground">
                    Share one-by-one with specific family members
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">View &amp; export only</p>
                  <p className="text-xs text-muted-foreground">
                    Shared access is read-only and revocable
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 pb-5">
            <Button 
              onClick={handleDismiss} 
              className="w-full gap-2"
              size="sm"
            >
              Got it
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Accent bar */}
          <div className="h-1 bg-gradient-to-r from-primary via-primary/70 to-primary/40" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
