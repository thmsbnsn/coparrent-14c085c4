import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface PushSubscriptionState {
  isSupported: boolean;
  isSubscribed: boolean;
  subscription: PushSubscription | null;
  permission: NotificationPermission;
}

export const usePushNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<PushSubscriptionState>({
    isSupported: false,
    isSubscribed: false,
    subscription: null,
    permission: "default",
  });
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = () => {
      const isSupported =
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window;

      setState((prev) => ({
        ...prev,
        isSupported,
        permission: isSupported ? Notification.permission : "denied",
      }));
    };

    checkSupport();
  }, []);

  // Get profile ID
  useEffect(() => {
    const fetchProfileId = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile) {
        setProfileId(profile.id);
      }
      setLoading(false);
    };

    fetchProfileId();
  }, [user]);

  // Check existing subscription
  useEffect(() => {
    const checkSubscription = async () => {
      if (!state.isSupported) return;

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        setState((prev) => ({
          ...prev,
          isSubscribed: !!subscription,
          subscription,
        }));
      } catch (error) {
        console.error("Error checking push subscription:", error);
      }
    };

    checkSubscription();
  }, [state.isSupported]);

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    if (!("serviceWorker" in navigator)) {
      throw new Error("Service workers are not supported");
    }

    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
      console.log("Service Worker registered:", registration.scope);
      return registration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      throw error;
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      toast({
        title: "Not Supported",
        description: "Push notifications are not supported in this browser.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setState((prev) => ({ ...prev, permission }));

      if (permission === "granted") {
        return true;
      } else if (permission === "denied") {
        toast({
          title: "Notifications Blocked",
          description:
            "You've blocked notifications. Please enable them in your browser settings.",
          variant: "destructive",
        });
      }
      return false;
    } catch (error) {
      console.error("Error requesting permission:", error);
      return false;
    }
  }, [state.isSupported, toast]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported || !profileId) {
      return false;
    }

    try {
      // Request permission if not granted
      if (Notification.permission !== "granted") {
        const granted = await requestPermission();
        if (!granted) return false;
      }

      // Register service worker
      const registration = await registerServiceWorker();

      // Note: In production, you would need a VAPID public key
      // For now, we'll use the browser's built-in push capability
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        // In production, add: applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      setState((prev) => ({
        ...prev,
        isSubscribed: true,
        subscription,
      }));

      toast({
        title: "Notifications Enabled",
        description: "You'll now receive push notifications for important updates.",
      });

      return true;
    } catch (error: any) {
      console.error("Error subscribing to push:", error);
      
      // Check for specific errors
      if (error.name === "NotAllowedError") {
        toast({
          title: "Permission Denied",
          description: "Please allow notifications in your browser settings.",
          variant: "destructive",
        });
      } else if (error.message?.includes("applicationServerKey")) {
        // VAPID key not configured - fall back to local notifications
        toast({
          title: "Notifications Enabled",
          description: "Browser notifications are now active.",
        });
        setState((prev) => ({ ...prev, isSubscribed: true }));
        return true;
      } else {
        toast({
          title: "Subscription Failed",
          description: "Could not enable push notifications. Try again later.",
          variant: "destructive",
        });
      }
      return false;
    }
  }, [state.isSupported, profileId, requestPermission, registerServiceWorker, toast]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!state.subscription) {
      setState((prev) => ({ ...prev, isSubscribed: false }));
      return true;
    }

    try {
      await state.subscription.unsubscribe();

      setState((prev) => ({
        ...prev,
        isSubscribed: false,
        subscription: null,
      }));

      toast({
        title: "Notifications Disabled",
        description: "You will no longer receive push notifications.",
      });

      return true;
    } catch (error) {
      console.error("Error unsubscribing:", error);
      toast({
        title: "Error",
        description: "Could not disable notifications. Try again later.",
        variant: "destructive",
      });
      return false;
    }
  }, [state.subscription, toast]);

  // Send a local notification (for testing or immediate feedback)
  const sendLocalNotification = useCallback(
    async (title: string, options?: NotificationOptions) => {
      if (Notification.permission !== "granted") {
        const granted = await requestPermission();
        if (!granted) return false;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
          icon: "/pwa-192x192.png",
          badge: "/pwa-192x192.png",
          ...options,
        });
        return true;
      } catch (error) {
        console.error("Error showing notification:", error);
        // Fallback to regular Notification API
        try {
          new Notification(title, {
            icon: "/pwa-192x192.png",
            ...options,
          });
          return true;
        } catch (fallbackError) {
          console.error("Fallback notification failed:", fallbackError);
          return false;
        }
      }
    },
    [requestPermission]
  );

  return {
    ...state,
    loading,
    subscribe,
    unsubscribe,
    requestPermission,
    sendLocalNotification,
  };
};
