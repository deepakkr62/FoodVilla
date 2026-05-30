"use client";

import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@/lib/authStore";
import type { Order } from "@/lib/orderApi";

/**
 * Subscribe to live updates for a single order. The handler receives the
 * server's full order document on every change.
 */
export function useOrderSocket(
  orderId: string | undefined,
  onUpdate: (order: Order) => void,
): void {
  const token = useAuth((s) => s.accessToken);

  useEffect(() => {
    if (!orderId || !token) return;
    const sock = getSocket(token);
    if (!sock) return;
    sock.emit("order:subscribe", orderId);
    const handler = (payload: Order) => {
      if (payload && payload._id === orderId) onUpdate(payload);
    };
    sock.on("order:updated", handler);
    return () => {
      sock.off("order:updated", handler);
      sock.emit("order:unsubscribe", orderId);
    };
  }, [orderId, token, onUpdate]);
}

/**
 * Restaurant owner stream: receives `order:new` whenever a customer places
 * an order at this owner's restaurant, and `order:updated` for status
 * changes (so the dashboard reorders on changes too).
 */
export function useOwnerOrderStream(handlers: {
  onNew: (order: Order) => void;
  onUpdate: (order: Order) => void;
}): void {
  const token = useAuth((s) => s.accessToken);

  useEffect(() => {
    if (!token) return;
    const sock = getSocket(token);
    if (!sock) return;
    sock.on("order:new", handlers.onNew);
    sock.on("order:updated", handlers.onUpdate);
    return () => {
      sock.off("order:new", handlers.onNew);
      sock.off("order:updated", handlers.onUpdate);
    };
  }, [token, handlers]);
}
