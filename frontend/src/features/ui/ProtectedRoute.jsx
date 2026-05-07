import { Navigate } from "react-router";
import PropTypes from "prop-types";
import { useAuthStore } from "@/entities/auth";
import { canAccess } from "@/shared/lib/rbac";
import { tokenService } from "@/shared/lib/tokenService";
import { toast } from "sonner";

/**
 * Protected Route Component
 * Checks authentication and RBAC (roles/permissions)
 */
export const ProtectedRoute = ({
  children,
  redirectTo = "/login",
  requiredRoles,
  requiredPermissions,
  fallback,
}) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated()) {
    tokenService.clearTokens();

    toast.dismiss();
    toast.error("Sesi Anda telah berakhir. Silakan login kembali.");

    return <Navigate to={redirectTo} replace />;
  }

  if (requiredRoles || requiredPermissions) {
    const hasAccess = canAccess(user, requiredRoles, requiredPermissions);

    if (!hasAccess) {
      if (fallback) {
        return <>{fallback}</>;
      }

      return <Navigate to="/forbidden" replace />;
    }
  }

  return <>{children}</>;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  redirectTo: PropTypes.string,
  requiredRoles: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  requiredPermissions: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  fallback: PropTypes.node,
};
