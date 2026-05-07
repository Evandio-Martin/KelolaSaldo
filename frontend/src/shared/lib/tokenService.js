import Cookies from "js-cookie";
import { encryption } from "./encryption";
import { decodeJWT } from "./jwtDecode";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

const ENCRYPTED_ACCESS_KEY = encryption.encryptCookieName(ACCESS_TOKEN_KEY);
const ENCRYPTED_REFRESH_KEY = encryption.encryptCookieName(REFRESH_TOKEN_KEY);

export const tokenService = {
  getAccessToken: () => {
    const encrypted = Cookies.get(ENCRYPTED_ACCESS_KEY);
    return encrypted ? encryption.decrypt(encrypted) : null;
  },

  getRefreshToken: () => {
    const encrypted = Cookies.get(ENCRYPTED_REFRESH_KEY);
    return encrypted ? encryption.decrypt(encrypted) : null;
  },

  setTokens: (accessToken, refreshToken) => {
    if (accessToken) {
      const encryptedAccess = encryption.encrypt(accessToken);
      Cookies.set(ENCRYPTED_ACCESS_KEY, encryptedAccess, {
        expires: 7,
        sameSite: "lax",
      });
    }
    if (refreshToken) {
      const encryptedRefresh = encryption.encrypt(refreshToken);
      Cookies.set(ENCRYPTED_REFRESH_KEY, encryptedRefresh, {
        expires: 30,
        sameSite: "lax",
      });
    }
  },

  clearTokens: () => {
    Cookies.remove(ENCRYPTED_ACCESS_KEY);
    Cookies.remove(ENCRYPTED_REFRESH_KEY);
  },

  isTokenExpired: (token) => {
    if (!token) return true;
    const payload = decodeJWT(token);

    if (!payload?.exp) {
      return true;
    }

    return payload.exp * 1000 < Date.now();
  },

  hasValidAccessToken: () => {
    const token = tokenService.getAccessToken();
    return !!token && !tokenService.isTokenExpired(token);
  },
};
