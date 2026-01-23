/**
 * ProtectedRoute - Authentication and role-based route protection
 * 
 * CRITICAL: Role enforcement is per-family, NOT global.
 * A user's access to routes depends on their role in the ACTIVE family.
 * 
 * @see src/contexts/FamilyContext.tsx for role source of truth
 */

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useFamilyRole } from "@/hooks/useFamilyRole";
import { useChildAccount } from "@/hooks/useChildAccount";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireParent?: boolean;
}

// Routes that Third-Party members and Child accounts cannot access
const PARENT_ONLY_ROUTES = [
  "/dashboard/children",
  "/dashboard/documents",
  "/dashboard/expenses",
  "/dashboard/settings",
  "/dashboard/audit",
  "/dashboard/law-library",
  "/dashboard/kids-hub",
  "/admin",
];

// Routes that Third-Party can access (calendar is read-only)
const THIRD_PARTY_ALLOWED_ROUTES = [
  "/dashboard",
  "/dashboard/messages",
  "/dashboard/calendar",
  "/dashboard/journal",
  "/dashboard/blog",
  "/dashboard/notifications",
  "/onboarding",
];

// Routes that Child accounts can access
const CHILD_ALLOWED_ROUTES = [
  "/kids",
  "/dashboard/messages",
  "/dashboard/calendar",
  "/dashboard/notifications",
];

/**
 * ProtectedRoute enforces authentication and per-family role-based access.
 * 
 * Role is determined by the user's membership in the ACTIVE family:
 * - Parent/Guardian in active family → full access
 * - Third-party in active family → limited routes
 * - Child in active family → minimal routes
 * 
 * Switching families changes available routes immediately.
 */
export const ProtectedRoute = ({ children, requireParent }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  // Role is scoped to active family via useFamilyRole
  const { isThirdParty, isChild, loading: roleLoading, activeFamilyId } = useFamilyRole();
  const { isChildAccount, loading: childLoading } = useChildAccount();
  const location = useLocation();

  if (authLoading || roleLoading || childLoading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Child accounts get redirected to /kids for parent-only routes
  if (isChildAccount || isChild) {
    const currentPath = location.pathname;
    const isChildAllowed = CHILD_ALLOWED_ROUTES.some(route => 
      currentPath === route || currentPath.startsWith(route + "/")
    );
    
    if (!isChildAllowed) {
      return <Navigate to="/kids" replace />;
    }
  }

  // Check if this route requires parent role in ACTIVE FAMILY
  if (requireParent && (isThirdParty || isChildAccount || isChild)) {
    return <Navigate to={isChildAccount || isChild ? "/kids" : "/dashboard"} replace />;
  }

  // For Third-Party users in ACTIVE FAMILY, check if they're trying to access restricted routes
  if (isThirdParty && !isChildAccount && !isChild) {
    const currentPath = location.pathname;
    const isAllowed = THIRD_PARTY_ALLOWED_ROUTES.some(route => 
      currentPath === route || currentPath.startsWith(route + "/")
    );
    const isRestricted = PARENT_ONLY_ROUTES.some(route => 
      currentPath === route || currentPath.startsWith(route + "/")
    );

    if (isRestricted && !isAllowed) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};
