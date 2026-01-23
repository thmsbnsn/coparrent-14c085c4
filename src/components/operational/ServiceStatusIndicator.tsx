/**
 * Service Status Indicator
 * 
 * Lightweight component that shows current service health.
 * Safe endpoint reading, no false positives.
 */

import { useState, useEffect, useCallback } from "react";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface ServiceHealth {
  ok: boolean;
  version: string;
  latency_ms: number;
  services: {
    database: string;
    api: string;
  };
}

interface ServiceStatusIndicatorProps {
  /** Show inline badge or full status */
  variant?: "badge" | "full";
  /** Class name for styling */
  className?: string;
}

export const ServiceStatusIndicator = ({ 
  variant = "badge",
  className = "" 
}: ServiceStatusIndicatorProps) => {
  const [status, setStatus] = useState<"loading" | "healthy" | "degraded" | "error">("loading");
  const [health, setHealth] = useState<ServiceHealth | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("health");
      
      if (error) {
        setStatus("error");
        return;
      }

      const healthData = data as ServiceHealth;
      setHealth(healthData);
      setLastChecked(new Date());

      if (healthData.ok) {
        setStatus("healthy");
      } else if (healthData.services.database === "degraded" || healthData.services.api !== "healthy") {
        setStatus("degraded");
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Health check failed:", error);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    checkHealth();
    
    // Re-check every 5 minutes
    const interval = setInterval(checkHealth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  if (variant === "badge") {
    return (
      <div className={`inline-flex items-center gap-1.5 text-xs ${className}`}>
        {status === "loading" ? (
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        ) : status === "healthy" ? (
          <>
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-muted-foreground">All systems operational</span>
          </>
        ) : status === "degraded" ? (
          <>
            <span className="w-2 h-2 rounded-full bg-warning" />
            <span className="text-warning">Partial outage</span>
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-destructive" />
            <span className="text-destructive">Service disruption</span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-xl border p-4 ${
      status === "healthy" ? "border-success/30 bg-success/5" :
      status === "degraded" ? "border-warning/30 bg-warning/5" :
      status === "error" ? "border-destructive/30 bg-destructive/5" :
      "border-border bg-muted/30"
    } ${className}`}>
      <div className="flex items-center gap-3">
        {status === "loading" ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : status === "healthy" ? (
          <CheckCircle className="h-5 w-5 text-success" />
        ) : (
          <AlertCircle className={`h-5 w-5 ${status === "degraded" ? "text-warning" : "text-destructive"}`} />
        )}
        
        <div className="flex-1">
          <p className="font-medium text-sm">
            {status === "loading" ? "Checking status..." :
             status === "healthy" ? "All systems operational" :
             status === "degraded" ? "Partial service disruption" :
             "Service issues detected"}
          </p>
          {lastChecked && (
            <p className="text-xs text-muted-foreground">
              Last checked: {lastChecked.toLocaleTimeString()}
            </p>
          )}
        </div>

        {health && (
          <div className="text-right text-xs text-muted-foreground">
            <p>v{health.version}</p>
            <p>{health.latency_ms}ms</p>
          </div>
        )}
      </div>
    </div>
  );
};
