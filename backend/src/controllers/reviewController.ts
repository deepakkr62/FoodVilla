import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { Order } from "../models/Order";
import { Restaurant } from "../models/Restaurant";
import { Review } from "../models/Review";
import { AppError } from "../middleware/errorHandler";

const createSchema = z.object({
  orderId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(500).optional(),
});

async function recalcRestaurantRating(restaurantId: mongoose.Types.ObjectId | string) {
  const [agg] = await Review.aggregate<{ avg: number; count: number }>([
    { $match: { restaurant: new mongoose.Types.ObjectId(String(restaurantId)) } },
    {
      $group: {
        _id: null,
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);
  await Restaurant.updateOne(
    { _id: restaurantId },
    {
      $set: {
        "rating.average": agg ? Math.round(agg.avg * 10) / 10 : 0,
        "rating.count": agg ? agg.count : 0,
      },
    },
  );
}

/** POST /api/reviews — customer reviews a delivered order. */
export async function createReview(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createSchema.parse(req.body);
    const customerId = req.user!.sub;

    const order = await Order.findById(data.orderId);
    if (!order) throw new AppError("Order not found", 404);
    if (order.customer.toString() !== customerId) throw new AppError("Forbidden", 403);
    if (order.status !== "delivered") {
      throw new AppError("You can only review delivered orders", 400);
    }

    const existing = await Review.findOne({ customer: customerId, order: order._id });
    if (existing) {
      throw new AppError("You've already reviewed this order", 409);
    }

    const review = await Review.create({
      customer: customerId,
      restaurant: order.restaurant,
      order: order._id,
      rating: data.rating,
      comment: data.comment,
    });

    await recalcRestaurantRating(order.restaurant);

    return res.status(201).json({ review });
  } catch (err) {
    return next(err);
  }
}

/** GET /api/restaurants/:id/reviews — public list of reviews for a restaurant. */
export async function listRestaurantReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id;
    const restaurant = await Restaurant.findOne({
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { slug: id },
      ],
    });
    if (!restaurant) throw new AppError("Restaurant not found", 404);

    const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10));
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit ?? "20"), 10)));
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ restaurant: restaurant._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("customer", "name avatarUrl"),
      Review.countDocuments({ restaurant: restaurant._id }),
    ]);

    return res.json({
      reviews,
      total,
      page,
      limit,
      rating: restaurant.rating,
    });
  } catch (err) {
    return next(err);
  }
}

/** GET /api/orders/:id/review — returns existing review for this order if any. */
export async function getReviewForOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) throw new AppError("Order not found", 404);
    if (order.customer.toString() !== req.user!.sub) {
      throw new AppError("Forbidden", 403);
    }
    const review = await Review.findOne({ customer: req.user!.sub, order: order._id });
    return res.json({ review });
  } catch (err) {
    return next(err);
  }
}
