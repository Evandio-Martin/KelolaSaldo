import PropTypes from "prop-types";
import { useAuthStore } from "@/entities/auth";
import { canAccess } from "@/shared/lib/rbac";

/**
 * RBAC Guard Component
 * Conditionally renders children based on user roles/permissions
 */
export const RBACGuard = ({
  children,
  requiredRoles,
  requiredPermissions,
  fallback = null,
}) => {
  const { user } = useAuthStore();

  const hasAccess = canAccess(user, requiredRoles, requiredPermissions);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

RBACGuard.propTypes = {
  children: PropTypes.node.isRequired,
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
