import { api } from "./api";

export interface Review {
  _id: string;
  customer: { _id: string; name: string; avatarUrl?: string } | string;
  restaurant: string;
  order: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export async function createReview(payload: {
  orderId: string;
  rating: number;
  comment?: string;
}): Promise<Review> {
  const { data } = await api.post("/reviews", payload);
  return data.review;
}

export async function listRestaurantReviews(
  slugOrId: string,
  page = 1,
  limit = 20,
): Promise<{
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
  rating: { average: number; count: number };
}> {
  const { data } = await api.get(
    `/restaurants/${encodeURIComponent(slugOrId)}/reviews?page=${page}&limit=${limit}`,
  );
  return data;
}

export async function getReviewForOrder(orderId: string): Promise<Review | null> {
  const { data } = await api.get(`/orders/${orderId}/review`);
  return data.review;
}
