/**
 * @jest-environment jsdom
 */
import { act, renderHook } from "@testing-library/react";

// Mock the socket module so we can assert subscribe/emit/off calls without a real server.
const mockSocket = {
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  disconnect: jest.fn(),
};

jest.mock("@/lib/socket", () => ({
  getSocket: jest.fn(() => mockSocket),
  disconnectSocket: jest.fn(),
}));

jest.mock("@/lib/authStore", () => ({
  useAuth: (selector: (s: { accessToken: string | null }) => unknown) =>
    selector({ accessToken: "test-token" }),
}));

import { useOrderSocket } from "@/hooks/useOrderSocket";

describe("useOrderSocket", () => {
  beforeEach(() => {
    mockSocket.emit.mockClear();
    mockSocket.on.mockClear();
    mockSocket.off.mockClear();
  });

  it("subscribes to the order room and registers a listener", () => {
    const onUpdate = jest.fn();
    renderHook(() => useOrderSocket("order-123", onUpdate));
    expect(mockSocket.emit).toHaveBeenCalledWith("order:subscribe", "order-123");
    expect(mockSocket.on).toHaveBeenCalledWith("order:updated", expect.any(Function));
  });

  it("invokes onUpdate when an event matches the order id", () => {
    const onUpdate = jest.fn();
    renderHook(() => useOrderSocket("order-123", onUpdate));
    const handler = mockSocket.on.mock.calls[0][1] as (p: { _id: string }) => void;
    act(() => handler({ _id: "order-123", status: "accepted" } as never));
    expect(onUpdate).toHaveBeenCalledWith({ _id: "order-123", status: "accepted" });
  });

  it("ignores events for other orders", () => {
    const onUpdate = jest.fn();
    renderHook(() => useOrderSocket("order-123", onUpdate));
    const handler = mockSocket.on.mock.calls[0][1] as (p: { _id: string }) => void;
    act(() => handler({ _id: "another", status: "accepted" } as never));
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("unsubscribes on unmount", () => {
    const onUpdate = jest.fn();
    const { unmount } = renderHook(() => useOrderSocket("order-123", onUpdate));
    unmount();
    expect(mockSocket.off).toHaveBeenCalledWith("order:updated", expect.any(Function));
    expect(mockSocket.emit).toHaveBeenCalledWith("order:unsubscribe", "order-123");
  });

  it("does nothing if orderId is missing", () => {
    renderHook(() => useOrderSocket(undefined, jest.fn()));
    expect(mockSocket.emit).not.toHaveBeenCalled();
  });
});
