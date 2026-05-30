/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DishFormModal } from "@/components/owner/DishFormModal";

describe("DishFormModal", () => {
  it("does not render when open is false", () => {
    const { container } = render(
      <DishFormModal open={false} onClose={() => {}} onSubmit={async () => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders the Add dish title when no initial dish", () => {
    render(<DishFormModal open={true} onClose={() => {}} onSubmit={async () => {}} />);
    expect(screen.getByRole("heading", { name: /add dish/i })).toBeInTheDocument();
  });

  it("submits new dish values via onSubmit", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const onClose = jest.fn();
    render(<DishFormModal open={true} onClose={onClose} onSubmit={onSubmit} />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/^name$/i), "Margherita");
    const priceInput = screen.getByLabelText(/price/i) as HTMLInputElement;
    fireEvent.change(priceInput, { target: { value: "350" } });

    fireEvent.click(screen.getByRole("button", { name: /add dish/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    expect(onSubmit.mock.calls[0][0].name).toBe("Margherita");
    expect(onSubmit.mock.calls[0][0].price).toBe(350);
  });

  it("shows validation error for short name", async () => {
    const onSubmit = jest.fn();
    render(<DishFormModal open={true} onClose={() => {}} onSubmit={onSubmit} />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/^name$/i), "A");
    fireEvent.click(screen.getByRole("button", { name: /add dish/i }));
    expect(await screen.findByText(/at least 2 characters/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
