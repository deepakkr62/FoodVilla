/**
 * @jest-environment jsdom
 */
import { act } from "@testing-library/react";
import { useCart } from "@/lib/cartStore";

const restaurantA = {
  id: "rA",
  name: "Spice Villa",
  slug: "spice-villa",
  deliveryFee: 30,
  minOrder: 100,
};
const restaurantB = {
  id: "rB",
  name: "Sushi Spot",
  slug: "sushi-spot",
  deliveryFee: 40,
  minOrder: 150,
};
const dish = {
  _id: "d1",
  name: "Paneer Tikka",
  price: 280,
  imageUrl: "",
  isVeg: true,
};
const dish2 = {
  _id: "d2",
  name: "Naan",
  price: 60,
  imageUrl: "",
  isVeg: true,
};

beforeEach(() => {
  localStorage.clear();
  act(() => useCart.getState().clear());
});

describe("cartStore", () => {
  it("starts empty", () => {
    const s = useCart.getState();
    expect(s.items.length).toBe(0);
    expect(s.itemCount()).toBe(0);
    expect(s.subtotal()).toBe(0);
    expect(s.total()).toBe(0);
  });

  it("adds an item from a restaurant", () => {
    act(() => {
      useCart.getState().addItem(restaurantA, dish, 1);
    });
    const s = useCart.getState();
    expect(s.items.length).toBe(1);
    expect(s.itemCount()).toBe(1);
    expect(s.subtotal()).toBe(280);
    expect(s.restaurantId).toBe("rA");
    expect(s.deliveryFee).toBe(30);
  });

  it("increments quantity for the same dish", () => {
    act(() => {
      useCart.getState().addItem(restaurantA, dish, 1);
      useCart.getState().addItem(restaurantA, dish, 2);
    });
    const s = useCart.getState();
    expect(s.items.length).toBe(1);
    expect(s.items[0].quantity).toBe(3);
    expect(s.itemCount()).toBe(3);
    expect(s.subtotal()).toBe(840);
  });

  it("computes taxes (5%) and total (subtotal + tax + delivery)", () => {
    act(() => {
      useCart.getState().addItem(restaurantA, dish, 1);
    });
    const s = useCart.getState();
    expect(s.taxes()).toBe(14); // 5% of 280 = 14
    expect(s.total()).toBe(280 + 14 + 30);
  });

  it("flags belowMinimum when subtotal < minOrder", () => {
    act(() => {
      useCart.getState().addItem(restaurantB, { ...dish, price: 100 }, 1);
    });
    expect(useCart.getState().belowMinimum()).toBe(true);
    act(() => {
      useCart.getState().setQuantity(dish._id, 2);
    });
    expect(useCart.getState().belowMinimum()).toBe(false);
  });

  it("prompts before switching restaurants without force", () => {
    act(() => {
      useCart.getState().addItem(restaurantA, dish, 1);
    });
    let result: string = "added";
    act(() => {
      result = useCart.getState().addItem(restaurantB, dish2, 1);
    });
    expect(result).toBe("needs-confirm");
    // Cart still belongs to restaurant A
    expect(useCart.getState().restaurantId).toBe("rA");
  });

  it("switches restaurants when force=true", () => {
    act(() => {
      useCart.getState().addItem(restaurantA, dish, 1);
    });
    act(() => {
      useCart.getState().addItem(restaurantB, dish2, 1, true);
    });
    const s = useCart.getState();
    expect(s.restaurantId).toBe("rB");
    expect(s.items.length).toBe(1);
    expect(s.items[0].dishId).toBe("d2");
  });

  it("setQuantity to 0 removes the item", () => {
    act(() => {
      useCart.getState().addItem(restaurantA, dish, 1);
      useCart.getState().addItem(restaurantA, dish2, 1);
      useCart.getState().setQuantity(dish._id, 0);
    });
    const s = useCart.getState();
    expect(s.items.length).toBe(1);
    expect(s.items[0].dishId).toBe("d2");
  });

  it("removing last item clears restaurant context", () => {
    act(() => {
      useCart.getState().addItem(restaurantA, dish, 1);
      useCart.getState().removeItem(dish._id);
    });
    const s = useCart.getState();
    expect(s.items.length).toBe(0);
    expect(s.restaurantId).toBeNull();
    expect(s.deliveryFee).toBe(0);
  });

  it("clear empties the cart", () => {
    act(() => {
      useCart.getState().addItem(restaurantA, dish, 1);
      useCart.getState().clear();
    });
    const s = useCart.getState();
    expect(s.items.length).toBe(0);
    expect(s.restaurantId).toBeNull();
  });
});
