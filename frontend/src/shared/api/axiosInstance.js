import axios from "axios";
import { toast } from "sonner";
import { tokenService } from "@/shared/lib/tokenService";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = tokenService.getAccessToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes("/auth/refresh-token")) {
      tokenService.clearTokens();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = tokenService.getRefreshToken();

      const response = await axios.post(
        `${BASE_URL}/auth/refresh-token`,
        { refresh_token: refreshToken },
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      const { access_token } = response.data.data;
      tokenService.setTokens(access_token, undefined);

      axiosInstance.defaults.headers.common["Authorization"] =
        `Bearer ${access_token}`;
      originalRequest.headers["Authorization"] = `Bearer ${access_token}`;

      processQueue(null, access_token);
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      tokenService.clearTokens();
      toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
