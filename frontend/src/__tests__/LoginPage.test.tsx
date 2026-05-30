/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "@/app/login/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock("@/lib/authStore", () => {
  const mockLogin = jest.fn();
  return {
    useAuth: (selector?: (s: any) => any) => {
      const state = { login: mockLogin };
      return selector ? selector(state) : state;
    },
    __mockLogin: mockLogin,
  };
});

describe("LoginPage", () => {
  it("renders email and password fields", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows validation error for invalid email", async () => {
    render(<LoginPage />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/email/i), "not-an-email");
    await user.type(screen.getByLabelText(/password/i), "anything");
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    });
  });

  it("shows the create-an-account link", () => {
    render(<LoginPage />);
    expect(screen.getByRole("link", { name: /create an account/i })).toHaveAttribute(
      "href",
      "/signup",
    );
  });
});
