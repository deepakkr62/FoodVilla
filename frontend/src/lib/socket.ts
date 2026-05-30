"use client";

import { io, type Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

let socket: Socket | null = null;
let currentToken: string | null = null;

/**
 * Get-or-create the singleton socket for the current access token. When the
 * token changes (login / logout), the existing socket is torn down and a
 * fresh one is created.
 */
export function getSocket(token: string | null): Socket | null {
  if (!token) {
    if (socket) {
      socket.disconnect();
      socket = null;
      currentToken = null;
    }
    return null;
  }
  if (socket && currentToken === token) return socket;
  if (socket) socket.disconnect();
  currentToken = token;
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 8,
  });
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentToken = null;
  }
}
