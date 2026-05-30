import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { User } from "../models/User";
import { AppError } from "../middleware/errorHandler";

const addressSchema = z.object({
  label: z.string().trim().max(40).optional(),
  line1: z.string().trim().min(2).max(120),
  line2: z.string().trim().max(120).optional(),
  city: z.string().trim().min(1).max(60),
  state: z.string().trim().max(60).optional(),
  postalCode: z.string().trim().min(1).max(20),
  country: z.string().trim().default("IN"),
  isDefault: z.boolean().optional(),
});

export async function listAddresses(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(req.user!.sub);
    if (!user) throw new AppError("User not found", 404);
    return res.json({ addresses: user.addresses ?? [] });
  } catch (err) {
    return next(err);
  }
}

export async function createAddress(req: Request, res: Response, next: NextFunction) {
  try {
    const data = addressSchema.parse(req.body);
    const user = await User.findById(req.user!.sub);
    if (!user) throw new AppError("User not found", 404);

    user.addresses = user.addresses ?? [];
    if (data.isDefault || user.addresses.length === 0) {
      user.addresses.forEach((a) => (a.isDefault = false));
      data.isDefault = true;
    }
    user.addresses.push(data);
    await user.save();
    return res.status(201).json({ addresses: user.addresses });
  } catch (err) {
    return next(err);
  }
}

export async function updateAddress(req: Request, res: Response, next: NextFunction) {
  try {
    const data = addressSchema.partial().parse(req.body);
    const user = await User.findById(req.user!.sub);
    if (!user) throw new AppError("User not found", 404);

    const addr = (user.addresses ?? []).find(
      (a) => a._id?.toString() === req.params.id,
    );
    if (!addr) throw new AppError("Address not found", 404);

    if (data.isDefault) {
      (user.addresses ?? []).forEach((a) => (a.isDefault = false));
    }
    Object.assign(addr, data);
    await user.save();
    return res.json({ addresses: user.addresses });
  } catch (err) {
    return next(err);
  }
}

export async function deleteAddress(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(req.user!.sub);
    if (!user) throw new AppError("User not found", 404);

    const before = user.addresses?.length ?? 0;
    user.addresses = (user.addresses ?? []).filter(
      (a) => a._id?.toString() !== req.params.id,
    );
    if (user.addresses.length === before) {
      throw new AppError("Address not found", 404);
    }
    // If we removed the default, promote the first remaining to default.
    if (user.addresses.length > 0 && !user.addresses.some((a) => a.isDefault)) {
      user.addresses[0].isDefault = true;
    }
    await user.save();
    return res.json({ addresses: user.addresses });
  } catch (err) {
    return next(err);
  }
}
