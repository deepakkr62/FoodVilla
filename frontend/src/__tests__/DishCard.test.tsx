/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { DishCard } from "@/components/owner/DishCard";
import type { OwnerDish } from "@/lib/ownerApi";

const sample: OwnerDish = {
  _id: "d1",
  restaurant: "r1",
  name: "Paneer Tikka",
  description: "Char-grilled cottage cheese",
  category: "Starters",
  price: 280,
  imageUrl: "",
  isVeg: true,
  isAvailable: true,
  isPopular: true,
  tags: ["spicy"],
  createdAt: "",
  updatedAt: "",
};

describe("DishCard", () => {
  it("renders dish name, price, and category", () => {
    render(<DishCard dish={sample} onEdit={() => {}} onDelete={() => {}} onToggleAvailable={() => {}} />);
    expect(screen.getByText("Paneer Tikka")).toBeInTheDocument();
    expect(screen.getByText("Starters")).toBeInTheDocument();
    expect(screen.getByText("₹280")).toBeInTheDocument();
    expect(screen.getByText(/popular/i)).toBeInTheDocument();
    expect(screen.getByText("spicy")).toBeInTheDocument();
  });

  it("calls onEdit when edit button is clicked", () => {
    const onEdit = jest.fn();
    render(<DishCard dish={sample} onEdit={onEdit} onDelete={() => {}} onToggleAvailable={() => {}} />);
    fireEvent.click(screen.getByLabelText(/edit dish/i));
    expect(onEdit).toHaveBeenCalledWith(sample);
  });

  it("calls onDelete when delete button is clicked", () => {
    const onDelete = jest.fn();
    render(<DishCard dish={sample} onEdit={() => {}} onDelete={onDelete} onToggleAvailable={() => {}} />);
    fireEvent.click(screen.getByLabelText(/delete dish/i));
    expect(onDelete).toHaveBeenCalledWith(sample);
  });

  it("calls onToggleAvailable when availability checkbox is changed", () => {
    const onToggle = jest.fn();
    render(<DishCard dish={sample} onEdit={() => {}} onDelete={() => {}} onToggleAvailable={onToggle} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onToggle).toHaveBeenCalledWith(sample);
  });
});
