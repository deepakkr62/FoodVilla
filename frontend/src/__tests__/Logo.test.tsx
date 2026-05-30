import { render, screen } from "@testing-library/react";
import { Logo } from "@/components/Logo";

describe("Logo", () => {
  it("renders the Food Villa wordmark by default", () => {
    render(<Logo />);
    expect(screen.getByLabelText(/food villa/i)).toBeInTheDocument();
    expect(screen.getByText(/Villa/)).toBeInTheDocument();
    expect(screen.getByText(/Taste the Comfort/i)).toBeInTheDocument();
  });

  it("hides the wordmark when withWordmark=false", () => {
    render(<Logo withWordmark={false} />);
    expect(screen.queryByText(/Taste the Comfort/i)).not.toBeInTheDocument();
  });

  it("respects the size prop", () => {
    const { container } = render(<Logo size={64} withWordmark={false} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "64");
    expect(svg).toHaveAttribute("height", "64");
  });
});
