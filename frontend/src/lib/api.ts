import axios, { AxiosError, type AxiosInstance } from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const TOKEN_KEY = "foodvilla_access_token";
const AUTH_PERSIST_KEY = "foodvilla-auth";
const CART_PERSIST_KEY = "foodvilla-cart";

export const api: AxiosInstance = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

/**
 * If any request comes back 401 (typically because the JWT is expired or
 * signed with a rotated secret), nuke the stale local auth + cart and bounce
 * the user to /login. This self-heals after secret rotations and prevents the
 * confusing "Request failed with status code 401" toast loop.
 */
api.interceptors.response.use(
  (resp) => resp,
  (err: AxiosError) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      const path = window.location.pathname;
      // Don't redirect from public pages or the login/signup themselves — that
      // would cause a refresh loop. Also skip if the failed call was the login
      // attempt itself; the page will surface the error to the user.
      const onAuthPage = path === "/login" || path === "/signup";
      const url = err.config?.url ?? "";
      const isAuthCall = url.includes("/auth/login") || url.includes("/auth/signup");
      if (!onAuthPage && !isAuthCall) {
        // Clear stale auth state from both storage keys + the token.
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(AUTH_PERSIST_KEY);
        // Also clear the cart since it was tied to the previous identity.
        localStorage.removeItem(CART_PERSIST_KEY);
        // Send the user to login with a hint about where to come back to.
        window.location.assign(`/login?next=${encodeURIComponent(path)}`);
      }
    }
    return Promise.reject(err);
  },
);

export type ApiError = {
  status: number;
  message: string;
  details?: unknown;
};

export function toApiError(err: unknown): ApiError {
  if (err instanceof AxiosError) {
    return {
      status: err.response?.status ?? 0,
      message:
        (err.response?.data as { error?: string; message?: string })?.error ||
        (err.response?.data as { error?: string; message?: string })?.message ||
        err.message,
      details: err.response?.data,
    };
  }
  return { status: 0, message: (err as Error)?.message ?? "Unknown error" };
}
