/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { LocationButton } from "@/components/LocationButton";

describe("LocationButton", () => {
  const realGeo = global.navigator.geolocation;

  afterEach(() => {
    Object.defineProperty(global.navigator, "geolocation", { value: realGeo, configurable: true });
  });

  it("shows 'Near you' chip when coords are set", () => {
    render(<LocationButton coords={{ lat: 18.5, lng: 73.8 }} onSet={() => {}} onClear={() => {}} />);
    expect(screen.getByText(/near you/i)).toBeInTheDocument();
  });

  it("calls onClear when X is clicked", () => {
    const onClear = jest.fn();
    render(<LocationButton coords={{ lat: 18.5, lng: 73.8 }} onSet={() => {}} onClear={onClear} />);
    fireEvent.click(screen.getByLabelText(/clear location/i));
    expect(onClear).toHaveBeenCalled();
  });

  it("requests browser geolocation and calls onSet on success", async () => {
    const onSet = jest.fn();
    const getCurrentPosition = jest.fn((success) => {
      success({ coords: { latitude: 18.52, longitude: 73.85 } });
    });
    Object.defineProperty(global.navigator, "geolocation", {
      value: { getCurrentPosition },
      configurable: true,
    });
    render(<LocationButton onSet={onSet} onClear={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /near me/i }));
    await waitFor(() => {
      expect(onSet).toHaveBeenCalledWith({ lat: 18.52, lng: 73.85 });
    });
  });

  it("shows error message when permission denied", async () => {
    const getCurrentPosition = jest.fn((_success, error) => {
      error({ code: 1, PERMISSION_DENIED: 1 });
    });
    Object.defineProperty(global.navigator, "geolocation", {
      value: { getCurrentPosition },
      configurable: true,
    });
    render(<LocationButton onSet={() => {}} onClear={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /near me/i }));
    expect(await screen.findByText(/permission denied/i)).toBeInTheDocument();
  });
});
