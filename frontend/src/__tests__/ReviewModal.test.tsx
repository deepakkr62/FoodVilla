/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("@/lib/reviewApi", () => ({
  createReview: jest.fn().mockResolvedValue({ _id: "rev1", rating: 5 }),
}));

import { ReviewModal } from "@/components/ReviewModal";
import { createReview } from "@/lib/reviewApi";

describe("ReviewModal", () => {
  beforeEach(() => (createReview as jest.Mock).mockClear());

  it("does not render when closed", () => {
    const { container } = render(
      <ReviewModal
        open={false}
        orderId="o1"
        restaurantName="Spice Villa"
        onClose={() => {}}
        onSubmitted={() => {}}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("requires a rating before submission", async () => {
    render(
      <ReviewModal
        open
        orderId="o1"
        restaurantName="Spice Villa"
        onClose={() => {}}
        onSubmitted={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));
    expect(await screen.findByText(/pick a rating/i)).toBeInTheDocument();
    expect(createReview).not.toHaveBeenCalled();
  });

  it("submits the chosen rating and comment", async () => {
    const onClose = jest.fn();
    const onSubmitted = jest.fn();
    render(
      <ReviewModal
        open
        orderId="o1"
        restaurantName="Spice Villa"
        onClose={onClose}
        onSubmitted={onSubmitted}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /4 stars/i }));
    fireEvent.change(screen.getByPlaceholderText(/tell others/i), {
      target: { value: "Loved it" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));
    await waitFor(() => {
      expect(createReview).toHaveBeenCalledWith({
        orderId: "o1",
        rating: 4,
        comment: "Loved it",
      });
    });
    expect(onSubmitted).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
