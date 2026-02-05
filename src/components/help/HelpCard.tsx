/**
 * HelpCard - Reusable styled card for help article content
 */

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface HelpCardProps {
  icon?: LucideIcon;
  title: string;
  children: ReactNode;
  variant?: "default" | "primary" | "warning" | "tip" | "numbered";
  number?: number;
  className?: string;
}

export const HelpCard = ({
  icon: Icon,
  title,
  children,
  variant = "default",
  number,
  className,
}: HelpCardProps) => {
  const variantStyles = {
    default: "bg-card border-border",
    primary: "bg-primary/5 border-primary/20",
    warning: "bg-amber-500/5 border-amber-500/20",
    tip: "bg-emerald-500/5 border-emerald-500/20",
    numbered: "bg-muted/30 border-border",
  };

  return (
    <div className={cn("rounded-xl border p-5 transition-colors", variantStyles[variant], className)}>
      <div className="flex items-start gap-4">
        {(Icon || variant === "numbered") && (
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            {variant === "numbered" && number ? (
              <span className="text-sm font-bold text-primary">{number}</span>
            ) : Icon ? (
              <Icon className="w-5 h-5 text-primary" />
            ) : null}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground mb-2">{title}</h3>
          <div className="text-sm text-muted-foreground">{children}</div>
        </div>
      </div>
    </div>
  );
};

interface HelpDisclaimerProps {
  type: "safety" | "legal" | "info" | "important";
  children: ReactNode;
  className?: string;
}

export const HelpDisclaimer = ({ type, children, className }: HelpDisclaimerProps) => {
  const styles = {
    safety: { bg: "bg-rose-500/5 border-rose-500/20", icon: "⚠️", title: "Safety Notice" },
    legal: { bg: "bg-slate-500/5 border-slate-500/20", icon: "⚖️", title: "Legal Disclaimer" },
    info: { bg: "bg-blue-500/5 border-blue-500/20", icon: "ℹ️", title: "Important Information" },
    important: { bg: "bg-amber-500/5 border-amber-500/20", icon: "📌", title: "Please Note" },
  };
  const { bg, icon, title } = styles[type];

  return (
    <div className={cn("rounded-xl border p-5", bg, className)}>
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0">{icon}</span>
        <div>
          <h4 className="font-semibold text-sm mb-1">{title}</h4>
          <p className="text-sm text-muted-foreground">{children}</p>
        </div>
      </div>
    </div>
  );
};

interface HelpFeatureGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}

export const HelpFeatureGrid = ({ children, columns = 2, className }: HelpFeatureGridProps) => {
  const gridCols = { 1: "grid-cols-1", 2: "grid-cols-1 sm:grid-cols-2", 3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" };
  return <div className={cn("grid gap-4", gridCols[columns], className)}>{children}</div>;
};

interface HelpStepProps {
  number: number;
  title: string;
  children: ReactNode;
}

export const HelpStep = ({ number, title, children }: HelpStepProps) => (
  <div className="flex items-start gap-4">
    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
      <span className="text-sm font-bold text-primary">{number}</span>
    </div>
    <div className="flex-1 pt-0.5">
      <h4 className="font-semibold mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  </div>
);

interface HelpCalloutProps {
  variant?: "primary" | "success" | "warning";
  children: ReactNode;
  className?: string;
}

export const HelpCallout = ({ variant = "primary", children, className }: HelpCalloutProps) => {
  const styles = {
    primary: "bg-primary/5 border-primary/20 text-primary",
    success: "bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-400",
    warning: "bg-amber-500/5 border-amber-500/20 text-amber-700 dark:text-amber-400",
  };
  return <div className={cn("rounded-xl border p-5 text-sm font-medium", styles[variant], className)}>{children}</div>;
};
