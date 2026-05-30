import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

router.get("/health", (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const states: Record<number, string> = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  res.status(200).json({
    status: "ok",
    service: "foodvilla-api",
    timestamp: new Date().toISOString(),
    db: states[dbState] ?? "unknown",
    uptime: process.uptime(),
  });
});

export default router;
