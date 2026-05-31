// api.ts
import axios from "axios";
import { getAccess, getRefresh, setTokens, clearTokens } from "./authStorage";
import { API_BASE_URL } from "./env";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const access = await getAccess();
  if (access) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refresh = await getRefresh();
      if (!refresh) throw new Error("No refresh token");

      const res = await axios.post(`${API_BASE_URL}/api/auth/token/refresh/`, { refresh });
      const newAccess = res.data.access as string;

      await setTokens(newAccess, refresh);
      return newAccess;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

// Obsługa 401 + ponowienie requestu
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const newAccess = await refreshAccessToken();
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      } catch (e) {
        await clearTokens();
      }
    }
    throw error;
  }
);
