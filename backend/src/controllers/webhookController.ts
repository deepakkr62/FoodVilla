import { Request, Response } from "express";
import { Order } from "../models/Order";
import { verifyWebhookSignature, stripeConfigured } from "../services/stripeService";

/**
 * POST /api/stripe/webhook
 * Receives Stripe events. The Express router mounts this with a raw-body parser
 * so signature verification works.
 */
export async function stripeWebhook(req: Request, res: Response) {
  if (!stripeConfigured()) {
    return res.status(503).json({ error: "Stripe not configured" });
  }
  const sig = req.headers["stripe-signature"];
  if (!sig || typeof sig !== "string") {
    return res.status(400).json({ error: "Missing signature" });
  }
  let event;
  try {
    event = verifyWebhookSignature(req.body as Buffer, sig);
  } catch (err) {
    return res.status(400).json({ error: "Invalid signature", message: (err as Error).message });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as {
        id: string;
        payment_intent?: string;
        metadata?: { orderId?: string };
      };
      const orderId = session.metadata?.orderId;
      if (orderId) {
        const order = await Order.findById(orderId);
        if (order && order.paymentStatus !== "paid") {
          order.paymentStatus = "paid";
          order.stripePaymentIntentId = session.payment_intent;
          order.status = "accepted";
          order.history.push({ status: "accepted", at: new Date(), note: "Payment confirmed" });
          await order.save();
        }
      }
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object as { metadata?: { orderId?: string } };
      const orderId = session.metadata?.orderId;
      if (orderId) {
        const order = await Order.findById(orderId);
        if (order && order.paymentStatus === "pending") {
          order.paymentStatus = "failed";
          order.status = "cancelled";
          order.history.push({
            status: "cancelled",
            at: new Date(),
            note: "Payment session expired",
          });
          await order.save();
        }
      }
      break;
    }
    default:
      // Acknowledge unhandled events so Stripe doesn't retry.
      break;
  }

  return res.json({ received: true });
}
