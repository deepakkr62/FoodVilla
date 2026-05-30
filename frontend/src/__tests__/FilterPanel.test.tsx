/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { FilterPanel } from "@/components/FilterPanel";

describe("FilterPanel", () => {
  it("emits cuisine selection on click", () => {
    const onChange = jest.fn();
    render(<FilterPanel value={{}} onChange={onChange} onClear={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /^Italian$/i }));
    expect(onChange).toHaveBeenCalledWith({ cuisine: "Italian" });
  });

  it("toggles cuisine off when clicked twice", () => {
    const onChange = jest.fn();
    render(<FilterPanel value={{ cuisine: "Italian" }} onChange={onChange} onClear={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /^Italian$/i }));
    expect(onChange).toHaveBeenCalledWith({ cuisine: undefined });
  });

  it("emits maxPrice on price button click", () => {
    const onChange = jest.fn();
    render(<FilterPanel value={{}} onChange={onChange} onClear={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /under ₹500/i }));
    expect(onChange).toHaveBeenCalledWith({ maxPrice: 2 });
  });

  it("emits minRating on rating button click", () => {
    const onChange = jest.fn();
    render(<FilterPanel value={{}} onChange={onChange} onClear={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "4+" }));
    expect(onChange).toHaveBeenCalledWith({ minRating: 4 });
  });

  it("calls onClear when Clear all is clicked", () => {
    const onClear = jest.fn();
    render(
      <FilterPanel value={{ cuisine: "Indian" }} onChange={() => {}} onClear={onClear} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /clear all/i }));
    expect(onClear).toHaveBeenCalled();
  });
});
