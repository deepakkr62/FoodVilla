import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "./api";
import { useCart } from "./cartStore";

export type UserRole = "customer" | "restaurant_owner";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  addresses?: Array<{
    _id: string;
    label?: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    isDefault?: boolean;
  }>;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  hydrated: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  clear: () => void;
  signup: (input: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone?: string;
  }) => Promise<AuthUser>;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<AuthUser | null>;
}

const TOKEN_KEY = "foodvilla_access_token";

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      hydrated: false,

      setAuth: (user, token) => {
        const prev = get().user;
        if (typeof window !== "undefined") {
          localStorage.setItem(TOKEN_KEY, token);
        }
        set({ user, accessToken: token });
        // If a different person just signed in, drop the previous cart so the
        // new user doesn't see leftover items from the previous session.
        if (prev && prev.id !== user.id) {
          useCart.getState().clear();
        }
      },

      clear: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem(TOKEN_KEY);
        }
        set({ user: null, accessToken: null });
        // Logout always wipes the cart — it belonged to the user who left.
        useCart.getState().clear();
      },

      signup: async (input) => {
        const { data } = await api.post("/auth/signup", input);
        get().setAuth(data.user, data.accessToken);
        return data.user;
      },

      login: async (email, password) => {
        const { data } = await api.post("/auth/login", { email, password });
        get().setAuth(data.user, data.accessToken);
        return data.user;
      },

      logout: async () => {
        try {
          await api.post("/auth/logout");
        } catch {
          /* ignore network errors on logout */
        } finally {
          get().clear();
        }
      },

      fetchMe: async () => {
        try {
          const { data } = await api.get("/auth/me");
          set({ user: data.user });
          return data.user;
        } catch {
          get().clear();
          return null;
        }
      },
    }),
    {
      name: "foodvilla-auth",
      partialize: (s) => ({ user: s.user, accessToken: s.accessToken }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
