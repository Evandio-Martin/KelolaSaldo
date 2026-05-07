import { tokenService } from "@/shared/lib/tokenService";
import { getUserFromToken } from "@/shared/lib/jwtDecode";
import { readStoredLanguage } from "@/shared/hooks";

const MOCK_USERS_STORAGE_KEY = "money-tracker-mock-users";
const hasApiBaseUrl = Boolean(import.meta.env.VITE_API_BASE_URL);
const isMockAuthForced = import.meta.env.VITE_ENABLE_MOCK_AUTH === "true";

export const mockAuthPreview = {
  username: "demo",
  password: "demo12345",
};

export const isMockAuthEnabled =
  isMockAuthForced || !hasApiBaseUrl;

const defaultMockUsers = [
  {
    id: "mock-user-demo",
    name: "Akun Demo",
    username: mockAuthPreview.username,
    nickname: "Demo",
    password: mockAuthPreview.password,
    role: "USER",
  },
];

const hasBrowserStorage = () => typeof window !== "undefined";

const persistUsers = (users) => {
  if (hasBrowserStorage()) {
    window.localStorage.setItem(MOCK_USERS_STORAGE_KEY, JSON.stringify(users));
  }

  return users;
};

const readUsers = () => {
  if (!hasBrowserStorage()) {
    return defaultMockUsers;
  }

  const serializedUsers = window.localStorage.getItem(MOCK_USERS_STORAGE_KEY);

  if (!serializedUsers) {
    return persistUsers(defaultMockUsers);
  }

  try {
    const parsedUsers = JSON.parse(serializedUsers);

    if (!Array.isArray(parsedUsers) || parsedUsers.length === 0) {
      return persistUsers(defaultMockUsers);
    }

    const hasDemoAccount = parsedUsers.some(
      (user) => user.username === mockAuthPreview.username,
    );

    if (hasDemoAccount) {
      return parsedUsers;
    }

    return persistUsers([...defaultMockUsers, ...parsedUsers]);
  } catch {
    return persistUsers(defaultMockUsers);
  }
};

const createMockError = (message, status = 400) => {
  const error = new Error(message);
  error.response = {
    status,
    data: { message },
  };

  return error;
};

const encodeTokenSegment = (value) => {
  const json = JSON.stringify(value);
  const bytes = new TextEncoder().encode(json);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const createMockToken = (user, expiresInSeconds) => {
  const nowInSeconds = Math.floor(Date.now() / 1000);

  return [
    encodeTokenSegment({ alg: "HS256", typ: "JWT" }),
    encodeTokenSegment({
      sub: user.id,
      user_id: user.id,
      username: user.username,
      name: user.name,
      nickname: user.nickname,
      role: user.role,
      exp: nowInSeconds + expiresInSeconds,
      iat: nowInSeconds,
    }),
    encodeTokenSegment({ sig: "mock-auth" }),
  ].join(".");
};

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  username: user.username,
  nickname: user.nickname,
  role: user.role,
});

const normalizeUsername = (value) => value.trim().toLowerCase();

const getMockAuthCopy = () =>
  readStoredLanguage() === "en"
    ? {
        invalidCredentials: "Invalid username or password",
        loginSuccess: "Signed in successfully.",
        usernameTaken: "That username is already taken",
        registerSuccess: "Account created successfully. You can sign in right away.",
        noActiveSession: "No active session",
        logoutSuccess: "Signed out successfully.",
      }
    : {
        invalidCredentials: "Username atau kata sandi tidak valid",
        loginSuccess: "Berhasil masuk.",
        usernameTaken: "Username tersebut sudah digunakan",
        registerSuccess: "Akun berhasil dibuat. Silakan masuk untuk mulai mencatat.",
        noActiveSession: "Tidak ada sesi aktif",
        logoutSuccess: "Berhasil keluar.",
      };

export const mockAuthApi = {
  login: async (credentials) => {
    const copy = getMockAuthCopy();
    const users = readUsers();
    const username = normalizeUsername(credentials.username || "");
    const password = credentials.password || "";

    const matchedUser = users.find(
      (user) =>
        normalizeUsername(user.username) === username && user.password === password,
    );

    if (!matchedUser) {
      throw createMockError(copy.invalidCredentials, 401);
    }

    return {
      message: copy.loginSuccess,
      data: {
        access_token: createMockToken(matchedUser, 60 * 60),
        refresh_token: createMockToken(matchedUser, 60 * 60 * 24 * 30),
      },
    };
  },

  register: async (userData) => {
    const copy = getMockAuthCopy();
    const users = readUsers();
    const username = normalizeUsername(userData.username || "");

    if (users.some((user) => normalizeUsername(user.username) === username)) {
      throw createMockError(copy.usernameTaken, 409);
    }

    const nextUser = {
      id: `mock-user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: userData.name.trim(),
      username: userData.username.trim(),
      nickname: userData.nickname.trim(),
      password: userData.password,
      role: "USER",
    };

    persistUsers([...users, nextUser]);

    return {
      message: copy.registerSuccess,
      data: sanitizeUser(nextUser),
    };
  },

  getMe: async () => {
    const copy = getMockAuthCopy();
    const token = tokenService.getAccessToken() || tokenService.getRefreshToken();
    const user = getUserFromToken(token);

    if (!user) {
      throw createMockError(copy.noActiveSession, 401);
    }

    return user;
  },

  logout: async () => ({
    message: getMockAuthCopy().logoutSuccess,
  }),
};