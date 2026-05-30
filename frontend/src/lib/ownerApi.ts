import { api } from "./api";

export interface OwnerRestaurant {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  cuisines: string[];
  priceRange: 1 | 2 | 3 | 4;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  coverImageUrl?: string;
  bannerImageUrl?: string;
  rating: { average: number; count: number };
  deliveryFee: number;
  minOrder: number;
  prepTimeMinutes: number;
  isOpen: boolean;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OwnerDish {
  _id: string;
  restaurant: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  imageUrl?: string;
  isVeg: boolean;
  isAvailable: boolean;
  isPopular: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export async function getMyRestaurant(): Promise<{
  restaurant: OwnerRestaurant | null;
  dishes?: OwnerDish[];
}> {
  const { data } = await api.get("/owner/restaurant");
  return data;
}

export async function createMyRestaurant(
  payload: Partial<OwnerRestaurant>,
): Promise<OwnerRestaurant> {
  const { data } = await api.post("/owner/restaurant", payload);
  return data.restaurant;
}

export async function updateMyRestaurant(
  payload: Partial<OwnerRestaurant>,
): Promise<OwnerRestaurant> {
  const { data } = await api.put("/owner/restaurant", payload);
  return data.restaurant;
}

export async function listMyDishes(): Promise<OwnerDish[]> {
  const { data } = await api.get("/owner/dishes");
  return data.dishes;
}

export async function createDish(payload: Partial<OwnerDish>): Promise<OwnerDish> {
  const { data } = await api.post("/owner/dishes", payload);
  return data.dish;
}

export async function updateDish(
  id: string,
  payload: Partial<OwnerDish>,
): Promise<OwnerDish> {
  const { data } = await api.put(`/owner/dishes/${id}`, payload);
  return data.dish;
}

export async function deleteDish(id: string): Promise<void> {
  await api.delete(`/owner/dishes/${id}`);
}
