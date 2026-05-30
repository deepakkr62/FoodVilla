import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  dishId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  isVeg: boolean;
}

interface CartState {
  restaurantId: string | null;
  restaurantName: string | null;
  restaurantSlug: string | null;
  deliveryFee: number;
  minOrder: number;
  items: CartItem[];

  // Returns true on success, false if user must clear first (different restaurant).
  addItem: (
    restaurant: {
      id: string;
      name: string;
      slug: string;
      deliveryFee: number;
      minOrder: number;
    },
    dish: { _id: string; name: string; price: number; imageUrl?: string; isVeg: boolean },
    qty?: number,
    force?: boolean,
  ) => "added" | "switched" | "needs-confirm";

  setQuantity: (dishId: string, qty: number) => void;
  removeItem: (dishId: string) => void;
  clear: () => void;

  itemCount: () => number;
  subtotal: () => number;
  taxes: () => number;
  total: () => number;
  belowMinimum: () => boolean;
}

const TAX_RATE = 0.05; // 5% GST

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      restaurantId: null,
      restaurantName: null,
      restaurantSlug: null,
      deliveryFee: 0,
      minOrder: 0,
      items: [],

      addItem: (restaurant, dish, qty = 1, force = false) => {
        const state = get();
        const differentRestaurant =
          state.restaurantId !== null && state.restaurantId !== restaurant.id;

        if (differentRestaurant && !force) {
          return "needs-confirm";
        }

        const fresh = differentRestaurant
          ? {
              restaurantId: restaurant.id,
              restaurantName: restaurant.name,
              restaurantSlug: restaurant.slug,
              deliveryFee: restaurant.deliveryFee,
              minOrder: restaurant.minOrder,
              items: [] as CartItem[],
            }
          : state;

        const existing = fresh.items.find((i) => i.dishId === dish._id);
        const items = existing
          ? fresh.items.map((i) =>
              i.dishId === dish._id ? { ...i, quantity: i.quantity + qty } : i,
            )
          : [
              ...fresh.items,
              {
                dishId: dish._id,
                name: dish.name,
                price: dish.price,
                quantity: qty,
                imageUrl: dish.imageUrl,
                isVeg: dish.isVeg,
              },
            ];

        set({
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          restaurantSlug: restaurant.slug,
          deliveryFee: restaurant.deliveryFee,
          minOrder: restaurant.minOrder,
          items,
        });
        return differentRestaurant ? "switched" : "added";
      },

      setQuantity: (dishId, qty) => {
        const items = get().items;
        if (qty <= 0) {
          const next = items.filter((i) => i.dishId !== dishId);
          if (next.length === 0) {
            get().clear();
            return;
          }
          set({ items: next });
          return;
        }
        set({
          items: items.map((i) => (i.dishId === dishId ? { ...i, quantity: qty } : i)),
        });
      },

      removeItem: (dishId) => {
        const items = get().items.filter((i) => i.dishId !== dishId);
        if (items.length === 0) {
          get().clear();
          return;
        }
        set({ items });
      },

      clear: () =>
        set({
          restaurantId: null,
          restaurantName: null,
          restaurantSlug: null,
          deliveryFee: 0,
          minOrder: 0,
          items: [],
        }),

      itemCount: () => get().items.reduce((n, i) => n + i.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      taxes: () => Math.round(get().subtotal() * TAX_RATE),

      total: () => {
        const s = get().subtotal();
        if (s === 0) return 0;
        return s + get().taxes() + get().deliveryFee;
      },

      belowMinimum: () => {
        const s = get().subtotal();
        return s > 0 && s < get().minOrder;
      },
    }),
    { name: "foodvilla-cart" },
  ),
);
