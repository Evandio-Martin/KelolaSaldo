import { create } from "zustand";
import { authApi } from "../api/auth.api";
import { isMockAuthEnabled, mockAuthApi } from "../api/mock-auth.api";
import { readStoredLanguage } from "@/shared/hooks";
import { tokenService } from "@/shared/lib/tokenService";
import { getUserFromToken } from "@/shared/lib/jwtDecode";
import { toast } from "sonner";

const authClient = isMockAuthEnabled ? mockAuthApi : authApi;

const getAuthCopy = () =>
  readStoredLanguage() === "en"
    ? {
        loginSuccess: "Signed in successfully.",
        loginFailed: "Sign in failed",
        registerSuccess: "Registration successful.",
        registerFailed: "Registration failed",
        fetchUserFailed: "Failed to load user data",
      }
    : {
        loginSuccess: "Berhasil masuk.",
        loginFailed: "Gagal masuk",
        registerSuccess: "Pendaftaran berhasil.",
        registerFailed: "Pendaftaran gagal",
        fetchUserFailed: "Gagal memuat data pengguna",
      };

export const useAuthStore = create((set) => ({
  user: null,
  isLoading: false,
  isLoadingAction: false,
  isInitialized: false,
  error: null,

  login: async (credentials) => {
    set({ isLoadingAction: true, error: null });
    try {
      const copy = getAuthCopy();
      const response = await authClient.login(credentials);
      const { data } = response;

      tokenService.setTokens(data.access_token, data.refresh_token);

      const user = getUserFromToken(data.access_token);
      set({ user, isLoadingAction: false });
      toast.success(response.message || copy.loginSuccess);

      return data;
    } catch (error) {
      const copy = getAuthCopy();
      const message = error.response?.data?.message || copy.loginFailed;
      set({ error: message, isLoadingAction: false });
      throw error;
    }
  },

  register: async (userData) => {
    set({ isLoadingAction: true, error: null });
    try {
      const copy = getAuthCopy();
      const response = await authClient.register(userData);
      set({ isLoadingAction: false });
      toast.success(response.message || copy.registerSuccess);
      return response.data;
    } catch (error) {
      const copy = getAuthCopy();
      const message = error.response?.data?.message || copy.registerFailed;
      set({ error: message, isLoadingAction: false });
      throw error;
    }
  },

  getMe: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await authClient.getMe();
      set({ user: data, isLoading: false });
      return data;
    } catch (error) {
      const copy = getAuthCopy();
      const message = error.response?.data?.message || copy.fetchUserFailed;
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  initializeAuth: async () => {
    const accessToken = tokenService.getAccessToken();
    const refreshToken = tokenService.getRefreshToken();

    if (!accessToken && !refreshToken) {
      set({ isInitialized: true });
      return;
    }

    try {
      const user = getUserFromToken(accessToken || refreshToken);

      if (!user) {
        tokenService.clearTokens();
        set({ user: null, isInitialized: true });
        return;
      }

      set({ user, isInitialized: true });
    } catch (error) {
      console.error("Failed to initialize auth:", error);
      tokenService.clearTokens();
      set({ user: null, isInitialized: true });
    }
  },

  logout: async () => {
    try {
      await authClient.logout();
      tokenService.clearTokens();
      set({ user: null, error: null });
    } catch {
      tokenService.clearTokens();
      set({ user: null, error: null });
    }
  },

  clearError: () => set({ error: null }),

  isAuthenticated: () => tokenService.hasValidAccessToken(),
}));
