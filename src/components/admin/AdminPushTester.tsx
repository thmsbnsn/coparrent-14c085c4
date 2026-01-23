/**
 * Admin Push Tester
 * 
 * Admin-only tool for sending a test push notification to the current admin.
 * - Uses existing push infrastructure
 * - Rate-limited server-side
 * - Audit-logged as TEST_PUSH_SENT
 * - Does not expose subscription data, endpoints, or keys
 */

import { useState } from "react";
import { Bell, Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TestResult {
  success: boolean;
  message: string;
  sent?: number;
  failed?: number;
}

export const AdminPushTester = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    isSupported,
    isSubscribed,
    permission,
    isiOS,
    isPWA,
    sendLocalNotification,
  } = usePushNotifications();

  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState<TestResult | null>(null);

  const handleSendTestPush = async () => {
    if (!user) {
      toast({
        title: "Not Authenticated",
        description: "You must be logged in to send a test push.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    setLastResult(null);

    try {
      // Get admin's profile ID
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError || !profile) {
        throw new Error("Could not fetch profile");
      }

      // Call send-push edge function (server-side rate-limited + audit-logged)
      const { data, error } = await supabase.functions.invoke("send-push", {
        body: {
          profile_id: profile.id,
          title: "Test Push Notification",
          body: "This is a test push from the Admin Dashboard.",
          url: "/admin",
          tag: "admin-test-push",
        },
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        setLastResult({
          success: true,
          message: data.sent > 0 
            ? `Push sent to ${data.sent} device(s)` 
            : "No active subscriptions found",
          sent: data.sent,
          failed: data.failed,
        });

        // Also send a local notification as fallback for immediate feedback
        if (data.sent === 0) {
          await sendLocalNotification("Test Notification (Local)", {
            body: "Your browser received this local notification.",
            tag: "admin-test-local",
          });
        }

        toast({
          title: "Test Push Sent",
          description: data.sent > 0 
            ? `Notification sent to ${data.sent} device(s).`
            : "No push subscriptions found. A local notification was shown instead.",
        });
      } else {
        setLastResult({
          success: false,
          message: data?.error || "Push failed",
        });

        toast({
          title: "Push Failed",
          description: data?.error || "Could not send test push.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Test push error:", error);
      
      setLastResult({
        success: false,
        message: error.message || "Network error",
      });

      toast({
        title: "Error",
        description: "Failed to send test push. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleLocalNotification = async () => {
    const success = await sendLocalNotification("Local Test Notification", {
      body: "This notification was triggered locally from Admin Dashboard.",
      tag: "admin-local-test",
    });

    if (success) {
      toast({
        title: "Local Notification Sent",
        description: "Check your notification tray.",
      });
    } else {
      toast({
        title: "Failed",
        description: "Could not send local notification. Check browser permissions.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notification Tester
        </CardTitle>
        <CardDescription>
          Send a test push notification to your own devices to verify the push infrastructure.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Indicators */}
        <div className="flex flex-wrap gap-2">
          <Badge variant={isSupported ? "default" : "secondary"}>
            Push: {isSupported ? "Supported" : "Not Supported"}
          </Badge>
          <Badge variant={isSubscribed ? "default" : "secondary"}>
            Subscribed: {isSubscribed ? "Yes" : "No"}
          </Badge>
          <Badge variant={permission === "granted" ? "default" : "secondary"}>
            Permission: {permission}
          </Badge>
          {isiOS && (
            <Badge variant={isPWA ? "default" : "outline"}>
              iOS PWA: {isPWA ? "Yes" : "No (Install Required)"}
            </Badge>
          )}
        </div>

        {/* iOS PWA Warning */}
        {isiOS && !isPWA && (
          <div className="p-3 rounded-lg bg-muted text-sm text-muted-foreground">
            <strong>iOS Note:</strong> Push notifications require the app to be installed 
            to the Home Screen. Add to Home Screen first to enable push.
          </div>
        )}

        {/* Permission Denied Warning */}
        {permission === "denied" && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            <strong>Blocked:</strong> Notification permission was denied. 
            Enable notifications in your browser/system settings.
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleSendTestPush}
            disabled={sending || !isSupported || permission === "denied"}
          >
            {sending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send Server Push
          </Button>

          <Button
            variant="outline"
            onClick={handleLocalNotification}
            disabled={permission === "denied"}
          >
            <Bell className="h-4 w-4 mr-2" />
            Send Local Notification
          </Button>
        </div>

        {/* Last Result */}
        {lastResult && (
          <div
            className={`p-3 rounded-lg flex items-start gap-2 ${
              lastResult.success
                ? "bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400"
                : "bg-destructive/10 border border-destructive/20 text-destructive"
            }`}
          >
            {lastResult.success ? (
              <CheckCircle className="h-4 w-4 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 mt-0.5" />
            )}
            <div className="text-sm">
              <p className="font-medium">{lastResult.success ? "Success" : "Failed"}</p>
              <p>{lastResult.message}</p>
              {lastResult.sent !== undefined && lastResult.failed !== undefined && (
                <p className="text-xs mt-1 opacity-80">
                  Sent: {lastResult.sent}, Failed: {lastResult.failed}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Help Text */}
        <p className="text-xs text-muted-foreground">
          This tool sends a real push notification through the server infrastructure. 
          It is rate-limited and audit-logged. No subscription data is exposed.
        </p>
      </CardContent>
    </Card>
  );
};
