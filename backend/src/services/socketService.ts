import type { Server as HttpServer } from "http";
import { Server, type Socket } from "socket.io";
import { env } from "../config/env";
import { verifyAccessToken, type JwtPayload } from "./tokenService";
import { Restaurant } from "../models/Restaurant";

let io: Server | null = null;

interface AuthedSocket extends Socket {
  user?: JwtPayload;
}

export function initSocketServer(server: HttpServer): Server {
  io = new Server(server, {
    cors: { origin: env.FRONTEND_URL, credentials: true },
  });

  io.use(async (socket: AuthedSocket, next) => {
    const token = (socket.handshake.auth?.token as string | undefined) ?? "";
    if (!token) return next(new Error("Missing auth token"));
    try {
      socket.user = verifyAccessToken(token);
      return next();
    } catch {
      return next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket: AuthedSocket) => {
    const user = socket.user!;
    // Each user joins their personal room for direct notifications.
    socket.join(`user:${user.sub}`);

    // Restaurant owners also join their restaurant's room for incoming-order alerts.
    if (user.role === "restaurant_owner") {
      const r = await Restaurant.findOne({ owner: user.sub }).select("_id");
      if (r) socket.join(`restaurant:${r._id.toString()}`);
    }

    // Customers can subscribe to specific order rooms for live tracking.
    socket.on("order:subscribe", (orderId: string) => {
      if (typeof orderId === "string" && orderId.length >= 8) {
        socket.join(`order:${orderId}`);
      }
    });
    socket.on("order:unsubscribe", (orderId: string) => {
      if (typeof orderId === "string") {
        socket.leave(`order:${orderId}`);
      }
    });
  });

  return io;
}

export function getIO(): Server | null {
  return io;
}

/** Notify owner room about a freshly placed order. */
export function emitNewOrder(restaurantId: string, order: unknown): void {
  io?.to(`restaurant:${restaurantId}`).emit("order:new", order);
}

/** Notify both the order channel and the owner about a status change. */
export function emitOrderUpdate(
  orderId: string,
  restaurantId: string,
  order: unknown,
): void {
  if (!io) return;
  io.to(`order:${orderId}`).emit("order:updated", order);
  io.to(`restaurant:${restaurantId}`).emit("order:updated", order);
}
