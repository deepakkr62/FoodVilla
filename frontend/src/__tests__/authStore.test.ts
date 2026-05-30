/**
 * @jest-environment jsdom
 */
import { act } from "@testing-library/react";
import { useAuth } from "@/lib/authStore";
import { useCart } from "@/lib/cartStore";

const restaurantA = {
  id: "rA",
  name: "Spice Villa",
  slug: "spice-villa",
  deliveryFee: 30,
  minOrder: 100,
};
const dish = { _id: "d1", name: "Paneer Tikka", price: 280, imageUrl: "", isVeg: true };

describe("auth store", () => {
  beforeEach(() => {
    localStorage.clear();
    act(() => {
      useAuth.getState().clear();
      useCart.getState().clear();
    });
  });

  it("starts logged out", () => {
    const { user, accessToken } = useAuth.getState();
    expect(user).toBeNull();
    expect(accessToken).toBeNull();
  });

  it("setAuth stores user and persists token to localStorage", () => {
    act(() => {
      useAuth.getState().setAuth(
        {
          id: "u1",
          name: "Aria",
          email: "a@x.com",
          role: "customer",
        },
        "token-abc",
      );
    });
    const { user, accessToken } = useAuth.getState();
    expect(user?.email).toBe("a@x.com");
    expect(accessToken).toBe("token-abc");
    expect(localStorage.getItem("foodvilla_access_token")).toBe("token-abc");
  });

  it("clear removes user and token", () => {
    act(() => {
      useAuth
        .getState()
        .setAuth(
          { id: "u1", name: "A", email: "a@x.com", role: "customer" },
          "t",
        );
      useAuth.getState().clear();
    });
    expect(useAuth.getState().user).toBeNull();
    expect(useAuth.getState().accessToken).toBeNull();
    expect(localStorage.getItem("foodvilla_access_token")).toBeNull();
  });

  it("logout/clear also clears the cart", () => {
    act(() => {
      useAuth
        .getState()
        .setAuth(
          { id: "u1", name: "A", email: "a@x.com", role: "customer" },
          "t",
        );
      useCart.getState().addItem(restaurantA, dish, 2);
    });
    expect(useCart.getState().items.length).toBe(1);
    act(() => {
      useAuth.getState().clear();
    });
    expect(useCart.getState().items.length).toBe(0);
  });

  it("setAuth as a different user wipes the previous user's cart", () => {
    act(() => {
      useAuth
        .getState()
        .setAuth(
          { id: "u1", name: "A", email: "a@x.com", role: "customer" },
          "t",
        );
      useCart.getState().addItem(restaurantA, dish, 1);
    });
    expect(useCart.getState().items.length).toBe(1);
    // Different user logs in → cart resets.
    act(() => {
      useAuth
        .getState()
        .setAuth(
          { id: "u2", name: "B", email: "b@x.com", role: "customer" },
          "t2",
        );
    });
    expect(useCart.getState().items.length).toBe(0);
  });
});
