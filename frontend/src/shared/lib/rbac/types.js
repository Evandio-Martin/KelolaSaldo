/**
 * Common role constants
 */
export const ROLES = {
  SUPERADMIN: "SUPERADMIN",
  ADMIN: "ADMIN",
  USER: "USER",
};

/**
 * Common permission constants
 */
export const PERMISSIONS = {
  // User permissions
  USER_CREATE: "user:create",
  USER_READ: "user:read",
  USER_UPDATE: "user:update",
  USER_DELETE: "user:delete",

  // Post permissions
  POST_CREATE: "post:create",
  POST_READ: "post:read",
  POST_UPDATE: "post:update",
  POST_DELETE: "post:delete",

  // Settings permissions
  SETTINGS_READ: "settings:read",
  SETTINGS_UPDATE: "settings:update",
};
