import { useState } from "react";
import { Bell, BellOff, Smartphone, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useNotifications } from "@/hooks/useNotifications";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useToast } from "@/hooks/use-toast";

export const NotificationSettings = () => {
  const { toast } = useToast();
  const {
    preferences,
    loading: prefsLoading,
    updatePreferences,
    toggleAllNotifications,
  } = useNotifications();

  const {
    isSupported,
    isSubscribed,
    permission,
    loading: pushLoading,
    subscribe,
    unsubscribe,
    sendLocalNotification,
  } = usePushNotifications();

  const [saving, setSaving] = useState(false);

  const handleTogglePreference = async (
    key: keyof typeof preferences,
    value: boolean
  ) => {
    setSaving(true);
    const success = await updatePreferences({ [key]: value });
    if (success) {
      toast({
        title: "Preference Updated",
        description: "Your notification settings have been saved.",
      });
    }
    setSaving(false);
  };

  const handleTogglePush = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  const handleTestNotification = async () => {
    const success = await sendLocalNotification("Test Notification", {
      body: "This is a test notification from CoParrent!",
      tag: "test-notification",
    });

    if (!success) {
      toast({
        title: "Test Failed",
        description: "Could not send test notification. Check your browser settings.",
        variant: "destructive",
      });
    }
  };

  if (prefsLoading || pushLoading) {
    return (
      <div className="p-6 rounded-2xl border border-border bg-card">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-2/3" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl border border-border bg-card space-y-6">
      <div>
        <h3 className="text-lg font-display font-semibold flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Settings
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Manage how and when you receive notifications
        </p>
      </div>

      {/* Push Notifications Section */}
      <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium">Push Notifications</p>
              <p className="text-xs text-muted-foreground">
                {isSupported
                  ? isSubscribed
                    ? "Receiving notifications even when app is closed"
                    : "Get notified even when the app is in the background"
                  : "Not supported in this browser"}
              </p>
            </div>
          </div>
          {isSupported && (
            <Switch
              checked={isSubscribed}
              onCheckedChange={handleTogglePush}
              disabled={permission === "denied"}
            />
          )}
        </div>

        {isSupported && permission === "denied" && (
          <p className="text-xs text-destructive">
            Notifications are blocked. Please enable them in your browser settings.
          </p>
        )}

        {isSupported && isSubscribed && (
          <Button variant="outline" size="sm" onClick={handleTestNotification}>
            Send Test Notification
          </Button>
        )}
      </div>

      {/* In-App Notification Preferences */}
      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-border">
          <div>
            <p className="font-medium">All Notifications</p>
            <p className="text-xs text-muted-foreground">
              Master toggle for all notification types
            </p>
          </div>
          <Switch
            checked={preferences.enabled}
            onCheckedChange={(checked) => toggleAllNotifications(checked)}
            disabled={saving}
          />
        </div>

        <div className="space-y-3 pl-4 border-l-2 border-muted">
          <div className="flex items-center justify-between py-2">
            <Label htmlFor="schedule_changes" className="cursor-pointer">
              <p className="font-medium">Schedule Changes</p>
              <p className="text-xs text-muted-foreground">
                When your co-parent requests or makes schedule changes
              </p>
            </Label>
            <Switch
              id="schedule_changes"
              checked={preferences.schedule_changes}
              onCheckedChange={(checked) =>
                handleTogglePreference("schedule_changes", checked)
              }
              disabled={!preferences.enabled || saving}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <Label htmlFor="new_messages" className="cursor-pointer">
              <p className="font-medium">New Messages</p>
              <p className="text-xs text-muted-foreground">
                When you receive a new message from your co-parent
              </p>
            </Label>
            <Switch
              id="new_messages"
              checked={preferences.new_messages}
              onCheckedChange={(checked) =>
                handleTogglePreference("new_messages", checked)
              }
              disabled={!preferences.enabled || saving}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <Label htmlFor="upcoming_exchanges" className="cursor-pointer">
              <p className="font-medium">Upcoming Exchanges</p>
              <p className="text-xs text-muted-foreground">
                Reminders before custody exchanges
              </p>
            </Label>
            <Switch
              id="upcoming_exchanges"
              checked={preferences.upcoming_exchanges}
              onCheckedChange={(checked) =>
                handleTogglePreference("upcoming_exchanges", checked)
              }
              disabled={!preferences.enabled || saving}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <Label htmlFor="document_uploads" className="cursor-pointer">
              <p className="font-medium">Document Uploads</p>
              <p className="text-xs text-muted-foreground">
                When new documents are shared with you
              </p>
            </Label>
            <Switch
              id="document_uploads"
              checked={preferences.document_uploads}
              onCheckedChange={(checked) =>
                handleTogglePreference("document_uploads", checked)
              }
              disabled={!preferences.enabled || saving}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <Label htmlFor="child_info_updates" className="cursor-pointer">
              <p className="font-medium">Child Info Updates</p>
              <p className="text-xs text-muted-foreground">
                When child information is updated
              </p>
            </Label>
            <Switch
              id="child_info_updates"
              checked={preferences.child_info_updates}
              onCheckedChange={(checked) =>
                handleTogglePreference("child_info_updates", checked)
              }
              disabled={!preferences.enabled || saving}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
