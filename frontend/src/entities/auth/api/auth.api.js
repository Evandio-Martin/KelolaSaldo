import { axiosInstance } from "@/shared/api";

export const authApi = {
  login: async (credentials) => {
    const response = await axiosInstance.post("/auth/login", {
      username: credentials.username,
      password: credentials.password,
    });
    return response.data;
  },

  register: async (userData) => {
    const response = await axiosInstance.post("/auth/register", {
      name: userData.name,
      username: userData.username,
      nickname: userData.nickname,
      password: userData.password,
    });
    return response.data;
  },

  logout: async () => {
    const response = await axiosInstance.post("/auth/logout");
    return response.data;
  },

  getMe: async () => {
    const response = await axiosInstance.get("/auth/me");
    return response.data.data;
  },

  refreshToken: async (refreshToken) => {
    const response = await axiosInstance.post("/auth/refresh-token", {
      refresh_token: refreshToken,
    });
    return response.data;
  },
};
