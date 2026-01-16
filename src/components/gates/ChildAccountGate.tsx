import { Navigate, useLocation } from "react-router-dom";
import { useChildAccount } from "@/hooks/useChildAccount";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface ChildAccountGateProps {
  children: React.ReactNode;
  requireParent?: boolean;
  fallback?: React.ReactNode;
}

// Routes that children can access
const CHILD_ALLOWED_ROUTES = [
  "/kids",
  "/dashboard/messages",
  "/dashboard/calendar", // Read-only
];

// Routes that are strictly parent-only
const PARENT_ONLY_ROUTES = [
  "/dashboard/settings",
  "/dashboard/audit",
  "/dashboard/children",
  "/dashboard/documents",
  "/dashboard/expenses",
  "/dashboard/law-library",
  "/admin",
];

export const ChildAccountGate = ({
  children,
  requireParent = false,
  fallback,
}: ChildAccountGateProps) => {
  const { isChildAccount, permissions, loading } = useChildAccount();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  // If this route requires parent access and user is a child
  if (requireParent && isChildAccount) {
    return fallback ? <>{fallback}</> : <Navigate to="/kids" replace />;
  }

  // Check if child is trying to access parent-only routes
  if (isChildAccount) {
    const isParentOnly = PARENT_ONLY_ROUTES.some(
      (route) => location.pathname === route || location.pathname.startsWith(route + "/")
    );

    if (isParentOnly) {
      return <Navigate to="/kids" replace />;
    }
  }

  // Check if login is disabled for child account
  if (isChildAccount && !permissions.login_enabled) {
    // Redirect to login - session should be invalidated
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// HOC for easy use with route definitions
export function withParentOnly<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P> {
  return function ParentOnlyComponent(props: P) {
    return (
      <ChildAccountGate requireParent>
        <WrappedComponent {...props} />
      </ChildAccountGate>
    );
  };
}
