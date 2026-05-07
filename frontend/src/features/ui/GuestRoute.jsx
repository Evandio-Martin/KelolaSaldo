import { Navigate } from "react-router";
import PropTypes from "prop-types";
import { useAuthStore } from "@/entities/auth";

/**
 * GuestRoute Component
 * Redirects to home if user is already authenticated
 * Used for login/register pages
 */
export const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

GuestRoute.propTypes = {
  children: PropTypes.node.isRequired,
};
