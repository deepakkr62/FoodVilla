import { Router, raw } from "express";
import {
  confirmStripeSession,
  getOrderById,
  listMyOrders,
  listOwnerOrders,
  placeOrder,
  updateOrderStatus,
} from "../controllers/orderController";
import { stripeWebhook } from "../controllers/webhookController";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

// Customer endpoints
router.get("/orders", requireAuth, requireRole("customer"), listMyOrders);
router.post("/orders", requireAuth, requireRole("customer"), placeOrder);
router.get("/orders/:id", requireAuth, getOrderById);
router.post("/orders/:id/confirm", requireAuth, requireRole("customer"), confirmStripeSession);

// Restaurant owner endpoints
router.get("/owner/orders", requireAuth, requireRole("restaurant_owner"), listOwnerOrders);
router.put(
  "/owner/orders/:id/status",
  requireAuth,
  requireRole("restaurant_owner"),
  updateOrderStatus,
);

// Stripe webhook (raw body needed for signature verification — see app.ts wiring)
router.post("/stripe/webhook", raw({ type: "application/json" }), stripeWebhook);

export default router;
