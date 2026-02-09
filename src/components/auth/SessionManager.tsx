import { useEffect, useState } from "react";
import { Monitor, Smartphone, Globe, Loader2, LogOut, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface SessionView {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActiveLabel: string;
}

const parseUserAgent = (ua: string): { device: string; browser: string } => {
  let device = "Unknown Device";
  let browser = "Unknown Browser";

  if (/iPhone|iPad|iPod/.test(ua)) {
    device = /iPad/.test(ua) ? "iPad" : "iPhone";
  } else if (/Android/.test(ua)) {
    device = /Mobile/.test(ua) ? "Android Phone" : "Android Tablet";
  } else if (/Windows/.test(ua)) {
    device = "Windows PC";
  } else if (/Mac/.test(ua)) {
    device = "Mac";
  } else if (/Linux/.test(ua)) {
    device = "Linux PC";
  }

  if (/Chrome/.test(ua) && !/Edge|Edg/.test(ua)) {
    browser = "Chrome";
  } else if (/Safari/.test(ua) && !/Chrome/.test(ua)) {
    browser = "Safari";
  } else if (/Firefox/.test(ua)) {
    browser = "Firefox";
  } else if (/Edge|Edg/.test(ua)) {
    browser = "Edge";
  }

  return { device, browser };
};

const getDeviceIcon = (device: string) => {
  if (/iPhone|Android Phone|Mobile/.test(device)) {
    return Smartphone;
  }
  return Monitor;
};

export const SessionManager = () => {
  const { toast } = useToast();
  const { session: currentSession, signOut } = useAuth();
  const [currentSessionView, setCurrentSessionView] = useState<SessionView | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    setLoading(true);
    try {
      const { device, browser } = parseUserAgent(navigator.userAgent);
      setCurrentSessionView({
        id: currentSession?.access_token?.slice(-8) || "current",
        device,
        browser,
        location: "Current location",
        lastActiveLabel: "Active now",
      });
    } finally {
      setLoading(false);
    }
  }, [currentSession]);

  const handleSignOutCurrentDevice = async () => {
    setSigningOut(true);
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "This device session has been closed.",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Please try again.";
      toast({
        title: "Failed to sign out",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSigningOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading session details...</span>
      </div>
    );
  }

  if (!currentSessionView) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No active session found.
      </div>
    );
  }

  const DeviceIcon = getDeviceIcon(currentSessionView.device);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <Globe className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Current Session</p>
            <p className="text-sm text-muted-foreground">
              Device-wide session history is not available yet.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOutCurrentDevice}
          disabled={signingOut}
        >
          {signingOut ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4 mr-2" />
          )}
          Sign out
        </Button>
      </div>

      <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center border border-border">
            <DeviceIcon className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{currentSessionView.device}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">{currentSessionView.browser}</span>
              <Badge variant="secondary" className="text-xs">
                Current
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {currentSessionView.location}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {currentSessionView.lastActiveLabel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
