import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { Dish } from "../models/Dish";
import {
  Order,
  VALID_STATUS_TRANSITIONS,
  type IOrderItem,
  type OrderStatus,
} from "../models/Order";
import { Restaurant } from "../models/Restaurant";
import { AppError } from "../middleware/errorHandler";
import { env } from "../config/env";
import { createCheckoutSession } from "../services/stripeService";
import { emitNewOrder, emitOrderUpdate } from "../services/socketService";

const TAX_RATE = 0.05;

const placeOrderSchema = z.object({
  restaurantId: z.string().min(1),
  items: z
    .array(
      z.object({
        dishId: z.string().min(1),
        quantity: z.number().int().min(1).max(50),
      }),
    )
    .min(1),
  deliveryAddress: z.object({
    label: z.string().optional(),
    line1: z.string().min(2),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().optional(),
    postalCode: z.string().min(1),
    country: z.string().default("IN"),
  }),
  paymentMethod: z.enum(["card", "cod"]),
});

/**
 * POST /api/orders — place an order. Re-computes pricing from the DB so users
 * can't tamper with prices. For card payments, returns a Stripe checkout URL.
 */
export async function placeOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const customerId = req.user!.sub;
    const data = placeOrderSchema.parse(req.body);

    const restaurant = await Restaurant.findById(data.restaurantId);
    if (!restaurant) throw new AppError("Restaurant not found", 404);
    if (!restaurant.isOpen) throw new AppError("Restaurant is closed", 400);

    const dishIds = data.items.map((i) => i.dishId);
    const dishes = await Dish.find({
      _id: { $in: dishIds },
      restaurant: restaurant._id,
      isAvailable: true,
    });
    if (dishes.length !== dishIds.length) {
      throw new AppError("One or more items are unavailable", 400);
    }
    const dishById = new Map(dishes.map((d) => [d._id.toString(), d]));

    const items: IOrderItem[] = data.items.map((it) => {
      const dish = dishById.get(it.dishId)!;
      return {
        dishId: dish._id,
        name: dish.name,
        price: dish.price,
        quantity: it.quantity,
        imageUrl: dish.imageUrl,
        isVeg: dish.isVeg,
      };
    });

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    if (subtotal < restaurant.minOrder) {
      throw new AppError(`Order is below the ₹${restaurant.minOrder} minimum`, 400);
    }
    const taxes = Math.round(subtotal * TAX_RATE);
    const deliveryFee = restaurant.deliveryFee;
    const total = subtotal + taxes + deliveryFee;

    const order = await Order.create({
      customer: customerId,
      restaurant: restaurant._id,
      items,
      pricing: { subtotal, taxes, deliveryFee, total },
      deliveryAddress: data.deliveryAddress,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentMethod === "cod" ? "pending" : "pending",
      status: "placed",
      history: [{ status: "placed", at: new Date() }],
    });

    if (data.paymentMethod === "cod") {
      emitNewOrder(restaurant._id.toString(), order);
      return res.status(201).json({ order, checkoutUrl: null });
    }

    // Card payment — create a Stripe Checkout session and return its URL.
    const success = `${env.FRONTEND_URL}/orders/${order._id}?status=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancel = `${env.FRONTEND_URL}/orders/${order._id}?status=cancelled`;
    const session = await createCheckoutSession(order, {
      successUrl: success,
      cancelUrl: cancel,
    });
    order.stripeSessionId = session.id;
    await order.save();
    emitNewOrder(restaurant._id.toString(), order);
    return res.status(201).json({ order, checkoutUrl: session.url });
  } catch (err) {
    return next(err);
  }
}

/** GET /api/orders — list current customer's orders. */
export async function listMyOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const orders = await Order.find({ customer: req.user!.sub })
      .sort({ createdAt: -1 })
      .populate("restaurant", "name slug coverImageUrl");
    return res.json({ orders });
  } catch (err) {
    return next(err);
  }
}

/** GET /api/orders/:id — order detail (must own it or be the restaurant's owner). */
export async function getOrderById(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await Order.findById(req.params.id).populate(
      "restaurant",
      "name slug coverImageUrl owner",
    );
    if (!order) throw new AppError("Order not found", 404);

    const userId = req.user!.sub;
    const ownsAsCustomer = order.customer.toString() === userId;
    const ownsAsRestaurant =
      req.user!.role === "restaurant_owner" &&
      (order.restaurant as unknown as { owner?: { toString(): string } }).owner?.toString() === userId;
    if (!ownsAsCustomer && !ownsAsRestaurant) {
      throw new AppError("Forbidden", 403);
    }
    return res.json({ order });
  } catch (err) {
    return next(err);
  }
}

/**
 * Confirm a Stripe Checkout session post-redirect. The frontend hits this
 * with ?session_id=... after the user returns from Stripe — handy when
 * webhooks aren't reachable in dev. Idempotent.
 */
export async function confirmStripeSession(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) throw new AppError("Order not found", 404);
    if (order.customer.toString() !== req.user!.sub) throw new AppError("Forbidden", 403);
    if (order.paymentStatus === "paid") return res.json({ order });

    // Dev fallback: when using the fake session, just mark it paid.
    if ((req.query.fake === "1") || (req.query.session_id as string)?.startsWith("cs_test_fake_")) {
      order.paymentStatus = "paid";
      order.status = "accepted";
      order.history.push({ status: "accepted", at: new Date() });
      await order.save();
      emitOrderUpdate(order._id.toString(), order.restaurant.toString(), order);
      return res.json({ order });
    }

    // Real Stripe: verify session — left for full Stripe SDK call in production.
    // Webhooks remain the source of truth; this is best-effort.
    return res.json({ order });
  } catch (err) {
    return next(err);
  }
}

/** GET /api/owner/orders — restaurant owner's incoming orders. */
export async function listOwnerOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user!.sub });
    if (!restaurant) return res.json({ orders: [] });
    const orders = await Order.find({ restaurant: restaurant._id })
      .sort({ createdAt: -1 })
      .populate("customer", "name email");
    return res.json({ orders });
  } catch (err) {
    return next(err);
  }
}

const updateStatusSchema = z.object({
  status: z.enum([
    "placed",
    "accepted",
    "preparing",
    "out_for_delivery",
    "delivered",
    "cancelled",
  ]),
  note: z.string().max(200).optional(),
});

/** PUT /api/owner/orders/:id/status — transition an order's status. */
export async function updateOrderStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const data = updateStatusSchema.parse(req.body);
    const restaurant = await Restaurant.findOne({ owner: req.user!.sub });
    if (!restaurant) throw new AppError("Create your restaurant first", 404);

    const order = await Order.findOne({
      _id: req.params.id,
      restaurant: restaurant._id,
    });
    if (!order) throw new AppError("Order not found or not yours", 404);

    const allowed = VALID_STATUS_TRANSITIONS[order.status as OrderStatus];
    if (!allowed.includes(data.status)) {
      throw new AppError(
        `Cannot move order from ${order.status} → ${data.status}`,
        400,
      );
    }

    order.status = data.status;
    order.history.push({ status: data.status, at: new Date(), note: data.note });
    if (data.status === "delivered") {
      order.deliveredAt = new Date();
      if (order.paymentMethod === "cod") order.paymentStatus = "paid";
    }
    if (data.status === "cancelled" && order.paymentStatus === "paid") {
      order.paymentStatus = "refunded";
    }
    await order.save();
    emitOrderUpdate(order._id.toString(), restaurant._id.toString(), order);
    return res.json({ order });
  } catch (err) {
    return next(err);
  }
}
