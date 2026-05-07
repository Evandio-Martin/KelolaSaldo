/**
 * Get user role from user object
 * @param user - User object
 * @returns Role name or null
 */
const getUserRole = (user) => {
  if (!user) return null;
  
  // Direct role property (from JWT decode)
  if (user.role) {
    return user.role.toUpperCase();
  }
  
  return null;
};

/**
 * Check if user has specific role(s)
 * @param user - User object with role
 * @param roles - Role or array of roles to check
 * @returns True if user has the role(s)
 */
export const hasRole = (user, roles) => {
  const userRole = getUserRole(user);
  
  if (!userRole) {
    return false;
  }
  
  const rolesToCheck = Array.isArray(roles) ? roles : [roles];
  const normalizedRolesToCheck = rolesToCheck.map((role) => role.toUpperCase());
  
  return normalizedRolesToCheck.includes(userRole);
};

/**
 * Check if user has specific permission(s)
 * @param user - User object with permissions
 * @param permissions - Permission or array of permissions to check
 * @returns True if user has the permission(s)
 */
export const hasPermission = (user, permissions) => {
  if (!user || !user.permissions || user.permissions.length === 0) {
    return false;
  }
  
  const permissionsToCheck = Array.isArray(permissions) ? permissions : [permissions];
  
  return permissionsToCheck.some((permission) =>
    user.permissions?.includes(permission)
  );
};

/**
 * Check if user has specific role(s) OR permission(s)
 * @param user - User object
 * @param roles - Role or array of roles to check
 * @param permissions - Permission or array of permissions to check
 * @returns True if user has any of the roles or permissions
 */
export const hasRoleOrPermission = (user, roles, permissions) => {
  if (!user) {
    return false;
  }
  
  const hasRequiredRole = roles ? hasRole(user, roles) : false;
  const hasRequiredPermission = permissions ? hasPermission(user, permissions) : false;
  
  return hasRequiredRole || hasRequiredPermission;
};

/**
 * Check if user is super admin
 * @param user - User object
 * @returns True if user is super admin
 */
export const isSuperAdmin = (user) => {
  return hasRole(user, "SUPERADMIN");
};

/**
 * Check if user is admin (ADMIN or SUPERADMIN)
 * @param user - User object
 * @returns True if user is admin
 */
export const isAdmin = (user) => {
  return hasRole(user, ["ADMIN", "SUPERADMIN"]);
};

/**
 * Get user role
 * @param user - User object
 * @returns Role name
 */
export const getUserRoles = (user) => {
  const role = getUserRole(user);
  return role ? [role] : [];
};

/**
 * Get all user permissions
 * @param user - User object
 * @returns Array of permissions
 */
export const getUserPermissions = (user) => {
  return user?.permissions || [];
};

/**
 * Check if user can access resource
 * Combines role and permission checks with OR logic
 * @param user - User object
 * @param requiredRoles - Required roles
 * @param requiredPermissions - Required permissions
 * @returns True if user can access
 */
export const canAccess = (user, requiredRoles, requiredPermissions) => {
  if (!user) {
    return false;
  }
  
  // Super admin has access to everything
  if (isSuperAdmin(user)) {
    return true;
  }
  
  // If no requirements, allow access
  if (!requiredRoles && !requiredPermissions) {
    return true;
  }
  
  // Check if user has required roles or permissions
  return hasRoleOrPermission(user, requiredRoles, requiredPermissions);
};
