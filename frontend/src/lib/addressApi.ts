import { api } from "./api";

export interface Address {
  _id: string;
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export async function listAddresses(): Promise<Address[]> {
  const { data } = await api.get("/users/me/addresses");
  return data.addresses;
}

export async function createAddress(payload: Omit<Address, "_id">): Promise<Address[]> {
  const { data } = await api.post("/users/me/addresses", payload);
  return data.addresses;
}

export async function updateAddress(
  id: string,
  payload: Partial<Omit<Address, "_id">>,
): Promise<Address[]> {
  const { data } = await api.put(`/users/me/addresses/${id}`, payload);
  return data.addresses;
}

export async function deleteAddress(id: string): Promise<Address[]> {
  const { data } = await api.delete(`/users/me/addresses/${id}`);
  return data.addresses;
}
