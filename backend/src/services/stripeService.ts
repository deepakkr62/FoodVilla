import Stripe from "stripe";
import { env, isTest } from "../config/env";
import type { IOrderDocument } from "../models/Order";

// Lazy-init: don't error at import time if keys are missing.
let cached: Stripe | null = null;
function client(): Stripe {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error(
      "STRIPE_SECRET_KEY is not configured. Set it in .env to enable card payments.",
    );
  }
  if (!cached) {
    cached = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2024-12-18.acacia" as Stripe.LatestApiVersion });
  }
  return cached;
}

export function stripeConfigured(): boolean {
  return Boolean(env.STRIPE_SECRET_KEY) && env.STRIPE_SECRET_KEY !== "sk_test_replace_me";
}

export async function createCheckoutSession(
  order: IOrderDocument,
  options: { successUrl: string; cancelUrl: string },
): Promise<{ id: string; url: string }> {
  // Test/dev fallback: when no real key is configured, return a fake session
  // so the UI flow still works end-to-end in demos.
  if (!stripeConfigured() || isTest) {
    const fakeId = `cs_test_fake_${order._id}`;
    return { id: fakeId, url: `${options.successUrl}&fake=1&session_id=${fakeId}` };
  }

  const session = await client().checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      ...order.items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "inr",
          unit_amount: item.price * 100,
          product_data: {
            name: item.name,
            images: item.imageUrl ? [item.imageUrl] : undefined,
          },
        },
      })),
      ...(order.pricing.deliveryFee > 0
        ? [
            {
              quantity: 1,
              price_data: {
                currency: "inr",
                unit_amount: order.pricing.deliveryFee * 100,
                product_data: { name: "Delivery fee" },
              },
            },
          ]
        : []),
      ...(order.pricing.taxes > 0
        ? [
            {
              quantity: 1,
              price_data: {
                currency: "inr",
                unit_amount: order.pricing.taxes * 100,
                product_data: { name: "Taxes & fees" },
              },
            },
          ]
        : []),
    ],
    metadata: { orderId: order._id.toString() },
    success_url: options.successUrl,
    cancel_url: options.cancelUrl,
  });

  return { id: session.id, url: session.url ?? options.cancelUrl };
}

export function verifyWebhookSignature(
  payload: Buffer,
  signature: string,
): Stripe.Event {
  if (!env.STRIPE_WEBHOOK_SECRET || env.STRIPE_WEBHOOK_SECRET === "whsec_replace_me") {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }
  return client().webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
}
