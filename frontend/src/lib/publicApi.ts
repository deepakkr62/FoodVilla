import { api } from "./api";

export interface PublicRestaurant {
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
}

export interface PublicDish {
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
}

export interface RestaurantListResponse {
  items: PublicRestaurant[];
  total: number;
  page: number;
  limit: number;
}

export interface ListRestaurantsFilters {
  q?: string;
  cuisine?: string;
  city?: string;
  minRating?: number;
  maxPrice?: 1 | 2 | 3 | 4;
  lat?: number;
  lng?: number;
  radius?: number;
  sort?: "rating" | "newest";
  page?: number;
  limit?: number;
}

export async function listRestaurants(
  filters: ListRestaurantsFilters = {},
): Promise<RestaurantListResponse> {
  const params: Record<string, string> = {};
  if (filters.q) params.q = filters.q;
  if (filters.cuisine) params.cuisine = filters.cuisine;
  if (filters.city) params.city = filters.city;
  if (filters.minRating !== undefined) params.minRating = String(filters.minRating);
  if (filters.maxPrice !== undefined) params.maxPrice = String(filters.maxPrice);
  if (filters.lat !== undefined) params.lat = String(filters.lat);
  if (filters.lng !== undefined) params.lng = String(filters.lng);
  if (filters.radius !== undefined) params.radius = String(filters.radius);
  if (filters.sort) params.sort = filters.sort;
  if (filters.page !== undefined) params.page = String(filters.page);
  if (filters.limit !== undefined) params.limit = String(filters.limit);
  const { data } = await api.get<RestaurantListResponse>("/restaurants", { params });
  return data;
}

export async function getRestaurantBySlug(
  slugOrId: string,
): Promise<{ restaurant: PublicRestaurant; dishes: PublicDish[] }> {
  const { data } = await api.get(`/restaurants/${encodeURIComponent(slugOrId)}`);
  return data;
}

export const COMMON_CUISINES = [
  "Indian",
  "Italian",
  "Chinese",
  "Japanese",
  "Mexican",
  "Thai",
  "American",
  "Mediterranean",
  "Continental",
  "South Indian",
  "Tandoor",
  "Biryani",
] as const;
