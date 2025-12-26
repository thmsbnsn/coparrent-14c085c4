import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useFamilyRole } from "@/hooks/useFamilyRole";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireParent?: boolean;
}

// Routes that Third-Party members cannot access
const PARENT_ONLY_ROUTES = [
  "/dashboard/calendar",
  "/dashboard/children",
  "/dashboard/documents",
  "/dashboard/expenses",
  "/dashboard/settings",
  "/admin",
];

// Routes that Third-Party can access (read-only calendar is separate)
const THIRD_PARTY_ALLOWED_ROUTES = [
  "/dashboard",
  "/dashboard/messages",
  "/dashboard/journal",
  "/dashboard/law-library",
  "/dashboard/blog",
  "/dashboard/notifications",
  "/onboarding",
];

export const ProtectedRoute = ({ children, requireParent }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { isThirdParty, loading: roleLoading } = useFamilyRole();
  const location = useLocation();

  if (authLoading || roleLoading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if this route requires parent role
  if (requireParent && isThirdParty) {
    return <Navigate to="/dashboard" replace />;
  }

  // For Third-Party users, check if they're trying to access restricted routes
  if (isThirdParty) {
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
