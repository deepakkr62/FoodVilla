/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddressFormModal } from "@/components/AddressFormModal";

describe("AddressFormModal", () => {
  it("does not render when closed", () => {
    const { container } = render(
      <AddressFormModal open={false} onClose={() => {}} onSubmit={async () => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders Add address title when no initial", () => {
    render(<AddressFormModal open onClose={() => {}} onSubmit={async () => {}} />);
    expect(screen.getByRole("heading", { name: /add address/i })).toBeInTheDocument();
  });

  it("submits the form values", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<AddressFormModal open onClose={() => {}} onSubmit={onSubmit} />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/address line 1/i), "12 Park Rd");
    await user.type(screen.getByLabelText(/^city$/i), "Pune");
    await user.type(screen.getByLabelText(/postal code/i), "411001");
    fireEvent.click(screen.getByRole("button", { name: /add address/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      line1: "12 Park Rd",
      city: "Pune",
      postalCode: "411001",
    });
  });

  it("shows error when required fields are missing", async () => {
    const onSubmit = jest.fn();
    render(<AddressFormModal open onClose={() => {}} onSubmit={onSubmit} />);
    fireEvent.submit(screen.getByRole("button", { name: /add address/i }).closest("form")!);
    expect(await screen.findByText(/required/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
