import { api } from "./api";

export type OrderStatus =
  | "placed"
  | "accepted"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "card" | "cod";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderItem {
  dishId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  isVeg: boolean;
}

export interface OrderRestaurantRef {
  _id: string;
  name: string;
  slug: string;
  coverImageUrl?: string;
}

export interface Order {
  _id: string;
  customer: string;
  restaurant: OrderRestaurantRef | string;
  items: OrderItem[];
  pricing: { subtotal: number; taxes: number; deliveryFee: number; total: number };
  deliveryAddress: {
    label?: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  history: { status: OrderStatus; at: string; note?: string }[];
  placedAt: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlaceOrderPayload {
  restaurantId: string;
  items: { dishId: string; quantity: number }[];
  deliveryAddress: Order["deliveryAddress"];
  paymentMethod: PaymentMethod;
}

export interface PlaceOrderResponse {
  order: Order;
  checkoutUrl: string | null;
}

export async function placeOrder(payload: PlaceOrderPayload): Promise<PlaceOrderResponse> {
  const { data } = await api.post("/orders", payload);
  return data;
}

export async function listMyOrders(): Promise<Order[]> {
  const { data } = await api.get("/orders");
  return data.orders;
}

export async function getOrder(id: string): Promise<Order> {
  const { data } = await api.get(`/orders/${id}`);
  return data.order;
}

export async function confirmStripeSession(
  id: string,
  query: { session_id?: string; fake?: string },
): Promise<Order> {
  const params = new URLSearchParams();
  if (query.session_id) params.set("session_id", query.session_id);
  if (query.fake) params.set("fake", query.fake);
  const { data } = await api.post(`/orders/${id}/confirm?${params.toString()}`);
  return data.order;
}

export async function listOwnerOrders(): Promise<Order[]> {
  const { data } = await api.get("/owner/orders");
  return data.orders;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  note?: string,
): Promise<Order> {
  const { data } = await api.put(`/owner/orders/${id}/status`, { status, note });
  return data.order;
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  placed: "Order placed",
  accepted: "Accepted",
  preparing: "Preparing",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const STATUS_STEPS: OrderStatus[] = [
  "placed",
  "accepted",
  "preparing",
  "out_for_delivery",
  "delivered",
];
