import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { User } from "../models/User";
import { AppError } from "../middleware/errorHandler";

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const data = updateProfileSchema.parse(req.body);
    const user = await User.findById(req.user!.sub);
    if (!user) throw new AppError("User not found", 404);

    if (data.name !== undefined) user.name = data.name;
    if (data.phone !== undefined) user.phone = data.phone || undefined;
    if (data.avatarUrl !== undefined) user.avatarUrl = data.avatarUrl || undefined;

    await user.save();
    return res.json({ user: user.toSafeJSON() });
  } catch (err) {
    return next(err);
  }
}
