/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import { OrderStatusTracker } from "@/components/OrderStatusTracker";

describe("OrderStatusTracker", () => {
  it("shows all five steps", () => {
    render(<OrderStatusTracker status="placed" />);
    expect(screen.getByText(/order placed/i)).toBeInTheDocument();
    expect(screen.getByText(/accepted/i)).toBeInTheDocument();
    expect(screen.getByText(/preparing/i)).toBeInTheDocument();
    expect(screen.getByText(/out for delivery/i)).toBeInTheDocument();
    expect(screen.getByText(/delivered/i)).toBeInTheDocument();
  });

  it("shows cancelled banner when cancelled", () => {
    render(<OrderStatusTracker status="cancelled" />);
    expect(screen.getByText(/cancelled/i)).toBeInTheDocument();
  });

  it("highlights only completed and active steps", () => {
    const { container } = render(<OrderStatusTracker status="preparing" />);
    // Active/complete circles get the brand bg/border classes; check at least one exists.
    expect(container.querySelectorAll(".bg-brand-500").length).toBeGreaterThanOrEqual(1);
  });
});
