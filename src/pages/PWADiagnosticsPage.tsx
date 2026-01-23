/**
 * PWA Diagnostics Page
 * 
 * Internal QA page for verifying PWA health.
 * Reports SW status, manifest, push support, and subscription state.
 * 
 * Route: /pwa-diagnostics (internal, not in main nav)
 */

import { useState, useEffect, useCallback } from "react";
import { 
  Wifi, WifiOff, RefreshCw, Check, X, AlertTriangle, 
  Smartphone, Bell, BellOff, Download, Shield, Clock,
  Globe, Server, Database, Cpu
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { supabase } from "@/integrations/supabase/client";
import { APP_VERSION } from "@/lib/version";

interface DiagnosticItem {
  label: string;
  value: string | boolean;
  status: "ok" | "warning" | "error" | "info";
  detail?: string;
}

interface ServiceHealth {
  ok: boolean;
  version: string;
  latency_ms: number;
  services: {
    database: string;
    api: string;
  };
}

const StatusIcon = ({ status }: { status: "ok" | "warning" | "error" | "info" }) => {
  switch (status) {
    case "ok":
      return <Check className="h-4 w-4 text-success" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-warning" />;
    case "error":
      return <X className="h-4 w-4 text-destructive" />;
    default:
      return <Globe className="h-4 w-4 text-muted-foreground" />;
  }
};

const DiagnosticRow = ({ item }: { item: DiagnosticItem }) => (
  <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50">
    <div className="flex items-center gap-3">
      <StatusIcon status={item.status} />
      <div>
        <p className="text-sm font-medium">{item.label}</p>
        {item.detail && (
          <p className="text-xs text-muted-foreground">{item.detail}</p>
        )}
      </div>
    </div>
    <Badge variant={item.status === "ok" ? "default" : item.status === "error" ? "destructive" : "secondary"}>
      {typeof item.value === "boolean" ? (item.value ? "Yes" : "No") : item.value}
    </Badge>
  </div>
);

const PWADiagnosticsPage = () => {
  const { user } = useAuth();
  const {
    isSupported,
    isSubscribed,
    permission,
    isiOS,
    isiOSPWA,
    isPWA,
    unsupportedReason,
    subscribe,
    sendLocalNotification,
  } = usePushNotifications();

  const [swStatus, setSwStatus] = useState<string>("checking");
  const [swVersion, setSwVersion] = useState<string>("unknown");
  const [manifestDetected, setManifestDetected] = useState<boolean>(false);
  const [lastPushReceived, setLastPushReceived] = useState<string | null>(null);
  const [serviceHealth, setServiceHealth] = useState<ServiceHealth | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [refreshing, setRefreshing] = useState(false);

  // Check Service Worker status
  const checkSWStatus = useCallback(async () => {
    if (!("serviceWorker" in navigator)) {
      setSwStatus("not_supported");
      return;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        if (registration.active) {
          setSwStatus("active");
        } else if (registration.installing) {
          setSwStatus("installing");
        } else if (registration.waiting) {
          setSwStatus("waiting");
        } else {
          setSwStatus("registered");
        }
      } else {
        setSwStatus("not_registered");
      }
    } catch (error) {
      setSwStatus("error");
    }
  }, []);

  // Check manifest
  const checkManifest = useCallback(() => {
    const manifestLink = document.querySelector('link[rel="manifest"]');
    setManifestDetected(!!manifestLink);
  }, []);

  // Check backend health
  const checkHealth = useCallback(async () => {
    setHealthLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("health");
      if (error) throw error;
      setServiceHealth(data as ServiceHealth);
    } catch (error) {
      console.error("Health check failed:", error);
      setServiceHealth(null);
    } finally {
      setHealthLoading(false);
    }
  }, []);

  // Load last push timestamp from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("coparrent-last-push-received");
    if (stored) {
      setLastPushReceived(new Date(parseInt(stored)).toLocaleString());
    }
  }, []);

  // Online/offline listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Initial checks
  useEffect(() => {
    checkSWStatus();
    checkManifest();
    checkHealth();
  }, [checkSWStatus, checkManifest, checkHealth]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([checkSWStatus(), checkHealth()]);
    checkManifest();
    setRefreshing(false);
  };

  const handleTestNotification = async () => {
    const success = await sendLocalNotification("Test Notification", {
      body: "This is a test notification from PWA Diagnostics",
      tag: "pwa-test",
    });
    if (success) {
      localStorage.setItem("coparrent-last-push-received", Date.now().toString());
      setLastPushReceived(new Date().toLocaleString());
    }
  };

  // Build diagnostic items
  const pwaItems: DiagnosticItem[] = [
    {
      label: "Service Worker",
      value: swStatus === "active" ? "Active" : swStatus,
      status: swStatus === "active" ? "ok" : swStatus === "not_supported" ? "error" : "warning",
      detail: swStatus === "not_supported" ? "Browser does not support Service Workers" : undefined,
    },
    {
      label: "Manifest Detected",
      value: manifestDetected,
      status: manifestDetected ? "ok" : "error",
    },
    {
      label: "Display Mode",
      value: isPWA ? "Standalone (PWA)" : "Browser",
      status: isPWA ? "ok" : "info",
      detail: isPWA ? "Running as installed app" : "Running in browser tab",
    },
    {
      label: "Online Status",
      value: isOnline ? "Online" : "Offline",
      status: isOnline ? "ok" : "warning",
    },
  ];

  const platformItems: DiagnosticItem[] = [
    {
      label: "Platform",
      value: isiOS ? "iOS" : "Other",
      status: "info",
    },
    {
      label: "iOS PWA Mode",
      value: isiOSPWA ? "Yes" : isiOS ? "No (not installed)" : "N/A",
      status: isiOS ? (isiOSPWA ? "ok" : "warning") : "info",
      detail: isiOS && !isiOSPWA ? "Add to Home Screen for full features" : undefined,
    },
    {
      label: "App Version",
      value: APP_VERSION,
      status: "info",
    },
    {
      label: "Backend Version",
      value: serviceHealth?.version || "Unknown",
      status: serviceHealth ? "ok" : "warning",
    },
  ];

  const pushItems: DiagnosticItem[] = [
    {
      label: "Push Supported",
      value: isSupported,
      status: isSupported ? "ok" : "error",
      detail: !isSupported ? unsupportedReason : undefined,
    },
    {
      label: "Notification Permission",
      value: permission,
      status: permission === "granted" ? "ok" : permission === "denied" ? "error" : "warning",
    },
    {
      label: "Push Subscribed",
      value: isSubscribed,
      status: isSubscribed ? "ok" : "warning",
    },
    {
      label: "Last Push Received",
      value: lastPushReceived || "Never",
      status: lastPushReceived ? "ok" : "info",
    },
  ];

  const backendItems: DiagnosticItem[] = [
    {
      label: "API Status",
      value: serviceHealth?.services.api || "Unknown",
      status: serviceHealth?.services.api === "healthy" ? "ok" : "error",
    },
    {
      label: "Database Status",
      value: serviceHealth?.services.database || "Unknown",
      status: serviceHealth?.services.database === "healthy" ? "ok" : "error",
    },
    {
      label: "Latency",
      value: serviceHealth ? `${serviceHealth.latency_ms}ms` : "N/A",
      status: serviceHealth 
        ? (serviceHealth.latency_ms < 500 ? "ok" : serviceHealth.latency_ms < 1000 ? "warning" : "error")
        : "info",
    },
    {
      label: "Auth Status",
      value: user ? "Authenticated" : "Not logged in",
      status: user ? "ok" : "info",
    },
  ];

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Cpu className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">PWA Diagnostics</h1>
                <p className="text-sm text-muted-foreground">Internal QA verification page</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Overall Status Banner */}
          <div className={`rounded-xl p-4 flex items-center gap-3 ${
            serviceHealth?.ok && swStatus === "active" 
              ? "bg-success/10 border border-success/30" 
              : "bg-warning/10 border border-warning/30"
          }`}>
            {serviceHealth?.ok && swStatus === "active" ? (
              <>
                <Check className="h-5 w-5 text-success" />
                <span className="font-medium text-success">All systems operational</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-warning" />
                <span className="font-medium text-warning">Some checks need attention</span>
              </>
            )}
          </div>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* PWA Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Download className="h-4 w-4" />
                PWA Status
              </CardTitle>
              <CardDescription>Service worker and installability</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {pwaItems.map((item) => (
                <DiagnosticRow key={item.label} item={item} />
              ))}
            </CardContent>
          </Card>

          {/* Platform Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Smartphone className="h-4 w-4" />
                Platform
              </CardTitle>
              <CardDescription>Device and version information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {platformItems.map((item) => (
                <DiagnosticRow key={item.label} item={item} />
              ))}
            </CardContent>
          </Card>

          {/* Push Notifications */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-4 w-4" />
                Push Notifications
              </CardTitle>
              <CardDescription>Subscription and permission state</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {pushItems.map((item) => (
                <DiagnosticRow key={item.label} item={item} />
              ))}
              <Separator className="my-3" />
              <div className="flex gap-2">
                {!isSubscribed && isSupported && (
                  <Button size="sm" variant="outline" onClick={subscribe}>
                    Enable Push
                  </Button>
                )}
                {permission === "granted" && (
                  <Button size="sm" variant="outline" onClick={handleTestNotification}>
                    Test Notification
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Backend Health */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Server className="h-4 w-4" />
                Backend Health
              </CardTitle>
              <CardDescription>API and database connectivity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {healthLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                backendItems.map((item) => (
                  <DiagnosticRow key={item.label} item={item} />
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* iOS Installation Guidance */}
        {isiOS && !isPWA && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 p-4 rounded-xl bg-info/10 border border-info/30"
          >
            <h3 className="font-semibold text-info mb-2 flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              iOS Installation Required
            </h3>
            <p className="text-sm text-info/80 mb-3">
              For full PWA functionality including push notifications on iOS:
            </p>
            <ol className="text-sm text-info/80 space-y-1 list-decimal list-inside">
              <li>Tap the Share button in Safari</li>
              <li>Scroll down and tap "Add to Home Screen"</li>
              <li>Tap "Add" to confirm</li>
              <li>Open the app from your Home Screen</li>
            </ol>
          </motion.div>
        )}

        {/* Debug Info */}
        <div className="mt-8 p-4 rounded-xl bg-muted/30 border border-border">
          <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Debug Info</h3>
          <pre className="text-xs text-muted-foreground overflow-auto">
{`User Agent: ${navigator.userAgent}
Display Mode: ${window.matchMedia("(display-mode: standalone)").matches ? "standalone" : "browser"}
Visibility: ${document.visibilityState}
Storage Quota: ${navigator.storage ? "Available" : "Not available"}
Timestamp: ${new Date().toISOString()}`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default PWADiagnosticsPage;
