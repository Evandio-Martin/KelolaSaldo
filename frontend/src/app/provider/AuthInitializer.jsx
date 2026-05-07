import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useAuthStore } from "@/entities/auth";
import { useFinanceStore } from "@/entities/finance";

export const AuthInitializer = ({ children }) => {
  const { initializeAuth, isInitialized, user } = useAuthStore();
  const { initializeFinance, resetFinance } = useFinanceStore();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      initializeAuth();
    }
  }, [initializeAuth]);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (user) {
      initializeFinance();
      return;
    }

    resetFinance();
  }, [initializeFinance, isInitialized, resetFinance, user]);

  return <>{children}</>;
};

AuthInitializer.propTypes = {
  children: PropTypes.node.isRequired,
};
