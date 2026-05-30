/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import { RestaurantCard } from "@/components/RestaurantCard";
import type { PublicRestaurant } from "@/lib/publicApi";

const restaurant: PublicRestaurant = {
  _id: "r1",
  name: "Spice Villa",
  slug: "spice-villa",
  cuisines: ["Indian", "Tandoor"],
  priceRange: 2,
  address: { line1: "1 St", city: "Pune", postalCode: "411001", country: "IN" },
  rating: { average: 4.5, count: 120 },
  deliveryFee: 30,
  minOrder: 100,
  prepTimeMinutes: 30,
  isOpen: true,
};

describe("RestaurantCard", () => {
  it("renders name, cuisines, city, prep time, rating", () => {
    render(<RestaurantCard restaurant={restaurant} />);
    expect(screen.getByText("Spice Villa")).toBeInTheDocument();
    expect(screen.getByText(/Indian/)).toBeInTheDocument();
    expect(screen.getByText("4.5")).toBeInTheDocument();
    expect(screen.getByText("Pune")).toBeInTheDocument();
    expect(screen.getByText("30m")).toBeInTheDocument();
    expect(screen.getByText("Min ₹100")).toBeInTheDocument();
  });

  it("links to the restaurant detail page", () => {
    render(<RestaurantCard restaurant={restaurant} />);
    expect(screen.getByLabelText(/open spice villa/i)).toHaveAttribute(
      "href",
      "/restaurants/spice-villa",
    );
  });

  it("shows Closed pill when not open", () => {
    render(<RestaurantCard restaurant={{ ...restaurant, isOpen: false }} />);
    expect(screen.getByText("Closed")).toBeInTheDocument();
  });

  it("shows real cost-for-two based on priceRange", () => {
    render(<RestaurantCard restaurant={{ ...restaurant, priceRange: 3 }} />);
    // priceRange 3 → ₹900 for two
    expect(screen.getByText("₹900")).toBeInTheDocument();
    expect(screen.getByText("for two")).toBeInTheDocument();
  });
});
