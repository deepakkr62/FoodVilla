import { api } from "./api";
import type { AuthUser } from "./authStore";

export async function updateProfile(payload: {
  name?: string;
  phone?: string;
  avatarUrl?: string;
}): Promise<AuthUser> {
  const { data } = await api.patch("/users/me", payload);
  return data.user;
}
