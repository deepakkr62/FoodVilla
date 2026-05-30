import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { Restaurant, slugify } from "../models/Restaurant";
import { Dish } from "../models/Dish";
import { AppError } from "../middleware/errorHandler";
import { restaurantsCache } from "../utils/memoryCache";

const addressSchema = z.object({
  line1: z.string().trim().min(2),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(1),
  state: z.string().trim().optional(),
  postalCode: z.string().trim().min(1),
  country: z.string().trim().default("IN"),
});

const upsertSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).optional(),
  cuisines: z.array(z.string().trim().min(1)).max(8).default([]),
  priceRange: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).default(2),
  address: addressSchema,
  location: z
    .object({
      type: z.literal("Point").default("Point"),
      coordinates: z.tuple([z.number(), z.number()]),
    })
    .optional(),
  coverImageUrl: z.string().url().optional(),
  bannerImageUrl: z.string().url().optional(),
  deliveryFee: z.number().min(0).default(0),
  minOrder: z.number().min(0).default(0),
  prepTimeMinutes: z.number().min(5).max(180).default(30),
  isOpen: z.boolean().default(true),
});

async function uniqueSlug(name: string, currentId?: string): Promise<string> {
  let base = slugify(name) || "restaurant";
  let candidate = base;
  let suffix = 1;
  while (true) {
    const existing = await Restaurant.findOne({ slug: candidate }).lean();
    if (!existing || existing._id.toString() === currentId) return candidate;
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
}

/** GET /api/owner/restaurant — get the authenticated owner's restaurant (or null). */
export async function getMyRestaurant(req: Request, res: Response, next: NextFunction) {
  try {
    const ownerId = req.user!.sub;
    const restaurant = await Restaurant.findOne({ owner: ownerId });
    if (!restaurant) return res.json({ restaurant: null });
    const dishes = await Dish.find({ restaurant: restaurant._id }).sort({ category: 1, name: 1 });
    return res.json({ restaurant, dishes });
  } catch (err) {
    return next(err);
  }
}

/** POST /api/owner/restaurant — create restaurant (one per owner). */
export async function createMyRestaurant(req: Request, res: Response, next: NextFunction) {
  try {
    const ownerId = req.user!.sub;
    const existing = await Restaurant.findOne({ owner: ownerId }).lean();
    if (existing) {
      throw new AppError("You already have a restaurant — update it instead", 409);
    }
    const data = upsertSchema.parse(req.body);
    const slug = await uniqueSlug(data.name);
    const restaurant = await Restaurant.create({ ...data, owner: ownerId, slug });
    restaurantsCache.clear();
    return res.status(201).json({ restaurant });
  } catch (err) {
    return next(err);
  }
}

/** PUT /api/owner/restaurant — update the authenticated owner's restaurant. */
export async function updateMyRestaurant(req: Request, res: Response, next: NextFunction) {
  try {
    const ownerId = req.user!.sub;
    const data = upsertSchema.partial().parse(req.body);
    const restaurant = await Restaurant.findOne({ owner: ownerId });
    if (!restaurant) throw new AppError("Restaurant not found — create one first", 404);

    if (data.name && data.name !== restaurant.name) {
      restaurant.slug = await uniqueSlug(data.name, restaurant._id.toString());
    }
    Object.assign(restaurant, data);
    await restaurant.save();
    restaurantsCache.clear();
    return res.json({ restaurant });
  } catch (err) {
    return next(err);
  }
}

/** GET /api/restaurants — public list with optional filters & geo proximity. */
export async function listRestaurants(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      q,
      cuisine,
      city,
      minRating,
      maxPrice,
      lat,
      lng,
      radius = "10",
      page = "1",
      limit = "20",
      sort,
    } = req.query;
    const filter: Record<string, unknown> = { isApproved: true };
    if (cuisine) filter.cuisines = { $in: [String(cuisine)] };
    if (city) (filter as { "address.city"?: string })["address.city"] = String(city);
    if (minRating) (filter as { "rating.average"?: object })["rating.average"] = { $gte: Number(minRating) };
    if (maxPrice) filter.priceRange = { $lte: Number(maxPrice) };
    if (q) filter.$text = { $search: String(q) };

    if (lat && lng) {
      // $geoWithin/$centerSphere is compatible with countDocuments(); the trade-off
      // vs $nearSphere is that results aren't auto-sorted by distance.
      const radiusKm = Math.min(50, Math.max(0.5, Number(radius)));
      filter.location = {
        $geoWithin: {
          $centerSphere: [[Number(lng), Number(lat)], radiusKm / 6378.1], // earth radius
        },
      };
    }

    const pageN = Math.max(1, parseInt(String(page), 10));
    const limitN = Math.min(50, Math.max(1, parseInt(String(limit), 10)));
    const skip = (pageN - 1) * limitN;

    // Cache by the full normalized query so /restaurants and
    // /restaurants?cuisine=Italian have separate cache entries.
    const cacheKey = JSON.stringify({
      q, cuisine, city, minRating, maxPrice, lat, lng, radius, sort,
      page: pageN, limit: limitN,
    });
    const cached = restaurantsCache.get(cacheKey);
    if (cached) {
      res.setHeader("X-Cache", "HIT");
      return res.json(cached);
    }

    const sortSpec: Record<string, 1 | -1> | undefined =
      lat && lng
        ? undefined
        : sort === "rating"
          ? { "rating.average": -1, createdAt: -1 }
          : sort === "newest"
            ? { createdAt: -1 }
            : { "rating.average": -1, createdAt: -1 };

    // .lean() skips Mongoose document hydration → ~3-5x faster JSON serialization.
    const query = Restaurant.find(filter, {
      // Only return fields the listing card actually uses (smaller payload).
      name: 1, slug: 1, cuisines: 1, priceRange: 1, address: 1,
      coverImageUrl: 1, rating: 1, deliveryFee: 1, minOrder: 1,
      prepTimeMinutes: 1, isOpen: 1,
    })
      .lean()
      .skip(skip)
      .limit(limitN);
    if (sortSpec) query.sort(sortSpec);
    const [items, total] = await Promise.all([query, Restaurant.countDocuments(filter)]);

    const payload = { items, total, page: pageN, limit: limitN };
    restaurantsCache.set(cacheKey, payload);
    res.setHeader("X-Cache", "MISS");
    res.setHeader("Cache-Control", "public, max-age=30");
    return res.json(payload);
  } catch (err) {
    return next(err);
  }
}

/** GET /api/restaurants/:id — public detail with dishes grouped by category. */
export async function getRestaurantById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id;
    const restaurant = await Restaurant.findOne({
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { slug: id },
      ],
    });
    if (!restaurant) throw new AppError("Restaurant not found", 404);
    const dishes = await Dish.find({ restaurant: restaurant._id, isAvailable: true }).sort({
      category: 1,
      name: 1,
    });
    return res.json({ restaurant, dishes });
  } catch (err) {
    return next(err);
  }
}
