import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { Dish } from "../models/Dish";
import { Restaurant } from "../models/Restaurant";
import { AppError } from "../middleware/errorHandler";

const dishSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional(),
  category: z.string().trim().min(1).default("Main"),
  price: z.number().min(0),
  imageUrl: z.string().url().optional(),
  isVeg: z.boolean().default(true),
  isAvailable: z.boolean().default(true),
  isPopular: z.boolean().default(false),
  tags: z.array(z.string().trim().min(1)).max(10).default([]),
});

async function ownedRestaurantOrThrow(ownerId: string) {
  const restaurant = await Restaurant.findOne({ owner: ownerId });
  if (!restaurant) throw new AppError("Create your restaurant first", 404);
  return restaurant;
}

/** POST /api/owner/dishes */
export async function createDish(req: Request, res: Response, next: NextFunction) {
  try {
    const ownerId = req.user!.sub;
    const restaurant = await ownedRestaurantOrThrow(ownerId);
    const data = dishSchema.parse(req.body);
    const dish = await Dish.create({ ...data, restaurant: restaurant._id });
    return res.status(201).json({ dish });
  } catch (err) {
    return next(err);
  }
}

/** PUT /api/owner/dishes/:id */
export async function updateDish(req: Request, res: Response, next: NextFunction) {
  try {
    const ownerId = req.user!.sub;
    const restaurant = await ownedRestaurantOrThrow(ownerId);
    const dish = await Dish.findOne({ _id: req.params.id, restaurant: restaurant._id });
    if (!dish) throw new AppError("Dish not found or not yours", 404);
    const data = dishSchema.partial().parse(req.body);
    Object.assign(dish, data);
    await dish.save();
    return res.json({ dish });
  } catch (err) {
    return next(err);
  }
}

/** DELETE /api/owner/dishes/:id */
export async function deleteDish(req: Request, res: Response, next: NextFunction) {
  try {
    const ownerId = req.user!.sub;
    const restaurant = await ownedRestaurantOrThrow(ownerId);
    const dish = await Dish.findOneAndDelete({
      _id: req.params.id,
      restaurant: restaurant._id,
    });
    if (!dish) throw new AppError("Dish not found or not yours", 404);
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
}

/** GET /api/owner/dishes — list owner's dishes */
export async function listMyDishes(req: Request, res: Response, next: NextFunction) {
  try {
    const ownerId = req.user!.sub;
    const restaurant = await ownedRestaurantOrThrow(ownerId);
    const dishes = await Dish.find({ restaurant: restaurant._id }).sort({
      category: 1,
      name: 1,
    });
    return res.json({ dishes });
  } catch (err) {
    return next(err);
  }
}
