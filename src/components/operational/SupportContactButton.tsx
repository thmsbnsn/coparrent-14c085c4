/**
 * Support Contact Button
 * 
 * Reusable support CTA for error states and help areas.
 * Calm, non-accusatory design.
 */

import { Link } from "react-router-dom";
import { MessageSquare, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SupportContactButtonProps {
  /** Variant style */
  variant?: "default" | "outline" | "ghost";
  /** Size */
  size?: "sm" | "default" | "lg";
  /** Full width */
  fullWidth?: boolean;
  /** Custom class */
  className?: string;
  /** Context for pre-filling (not exposed to user) */
  context?: {
    page?: string;
    action?: string;
  };
}

export const SupportContactButton = ({
  variant = "default",
  size = "default",
  fullWidth = false,
  className = "",
  context,
}: SupportContactButtonProps) => {
  // Build URL with minimal context (no internal IDs)
  const searchParams = new URLSearchParams();
  if (context?.page) {
    searchParams.set("from", context.page);
  }
  
  const href = `/help/contact${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  return (
    <Button
      asChild
      variant={variant}
      size={size}
      className={`${fullWidth ? "w-full" : ""} ${className}`}
    >
      <Link to={href}>
        <MessageSquare className="h-4 w-4 mr-2" />
        Contact Support
        <ArrowRight className="h-4 w-4 ml-2" />
      </Link>
    </Button>
  );
};
