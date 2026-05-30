/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { StarRating } from "@/components/StarRating";

describe("StarRating", () => {
  it("renders 5 buttons", () => {
    render(<StarRating value={3} onChange={() => {}} />);
    expect(screen.getAllByRole("button").length).toBe(5);
  });

  it("calls onChange with the clicked star value", () => {
    const onChange = jest.fn();
    render(<StarRating value={0} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /4 stars/i }));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("disables interaction in readOnly mode", () => {
    const onChange = jest.fn();
    render(<StarRating value={5} onChange={onChange} readOnly />);
    fireEvent.click(screen.getByRole("button", { name: /3 stars/i }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
