/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignupPage from "@/app/signup/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock("@/lib/authStore", () => {
  const mockSignup = jest.fn();
  return {
    useAuth: (selector?: (s: any) => any) => {
      const state = { signup: mockSignup };
      return selector ? selector(state) : state;
    },
  };
});

describe("SignupPage", () => {
  it("renders name, email, phone and password fields", () => {
    render(<SignupPage />);
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("toggles between customer and restaurant owner roles", async () => {
    render(<SignupPage />);
    const user = userEvent.setup();
    const ownerTab = screen.getByRole("tab", { name: /restaurant owner/i });
    const customerTab = screen.getByRole("tab", { name: /customer/i });
    expect(customerTab).toHaveAttribute("aria-selected", "true");
    await user.click(ownerTab);
    expect(ownerTab).toHaveAttribute("aria-selected", "true");
    expect(customerTab).toHaveAttribute("aria-selected", "false");
  });

  it("shows validation error when password is too short", async () => {
    render(<SignupPage />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/full name/i), "Aria");
    await user.type(screen.getByLabelText(/email/i), "a@x.com");
    await user.type(screen.getByLabelText(/password/i), "short");
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    });
  });
});
