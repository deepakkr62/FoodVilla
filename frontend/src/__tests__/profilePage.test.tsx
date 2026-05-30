/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const mockUpdate = jest.fn().mockResolvedValue({
  id: "u1",
  name: "Aria Patel",
  email: "aria@x.com",
  role: "customer",
  phone: "+91",
});
const mockListAddresses = jest.fn().mockResolvedValue([]);
const mockSetAuth = jest.fn();

jest.mock("@/lib/profileApi", () => ({
  updateProfile: (...args: unknown[]) => mockUpdate(...args),
}));
jest.mock("@/lib/addressApi", () => ({
  listAddresses: () => mockListAddresses(),
  createAddress: jest.fn(),
  updateAddress: jest.fn(),
  deleteAddress: jest.fn(),
}));
const stableUser = {
  id: "u1",
  name: "Aria",
  email: "aria@x.com",
  role: "customer" as const,
};
const stableState = {
  user: stableUser,
  accessToken: "tok",
  hydrated: true,
  setAuth: mockSetAuth,
};
jest.mock("@/lib/authStore", () => ({
  useAuth: (selector?: (s: typeof stableState) => unknown) =>
    selector ? selector(stableState) : stableState,
}));
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

import ProfilePage from "@/app/profile/page";

describe("ProfilePage", () => {
  beforeEach(() => {
    mockUpdate.mockClear();
    mockListAddresses.mockClear();
    mockSetAuth.mockClear();
  });

  it("renders the user's email and current name", async () => {
    render(<ProfilePage />);
    expect(await screen.findByDisplayValue("Aria")).toBeInTheDocument();
    expect(screen.getByText("aria@x.com")).toBeInTheDocument();
  });

  it("submits an updated name", async () => {
    render(<ProfilePage />);
    const nameInput = (await screen.findByDisplayValue("Aria")) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "Aria Patel" } });
    await waitFor(() => expect(nameInput.value).toBe("Aria Patel"));
    fireEvent.click(screen.getByRole("button", { name: /save profile/i }));
    await waitFor(() => expect(mockUpdate).toHaveBeenCalled());
    expect(mockUpdate.mock.calls[0][0]).toEqual(
      expect.objectContaining({ name: "Aria Patel" }),
    );
    expect(mockSetAuth).toHaveBeenCalled();
  });

  it("shows success message after save", async () => {
    render(<ProfilePage />);
    fireEvent.click(screen.getByRole("button", { name: /save profile/i }));
    expect(await screen.findByText(/profile saved/i)).toBeInTheDocument();
  });
});
