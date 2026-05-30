import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { User } from "../models/User";
import { AppError } from "../middleware/errorHandler";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../services/tokenService";
import { isProd } from "../config/env";

const REFRESH_COOKIE = "foodvilla_refresh";

const refreshCookieOpts = {
  httpOnly: true,
  secure: isProd,
  sameSite: (isProd ? "strict" : "lax") as "strict" | "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/api/auth",
};

const signupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["customer", "restaurant_owner"]).default("customer"),
  phone: z.string().trim().optional(),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

function tokensFor(user: { id: string; role: "customer" | "restaurant_owner"; email: string }) {
  const payload = { sub: user.id, role: user.role, email: user.email };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const data = signupSchema.parse(req.body);
    const existing = await User.findOne({ email: data.email }).lean();
    if (existing) {
      throw new AppError("Email already registered", 409);
    }
    const user = await User.create(data);
    const safe = user.toSafeJSON();
    const { accessToken, refreshToken } = tokensFor({
      id: safe.id,
      role: safe.role,
      email: safe.email,
    });
    res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOpts);
    return res.status(201).json({ user: safe, accessToken });
  } catch (err) {
    return next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const data = loginSchema.parse(req.body);
    const user = await User.findOne({ email: data.email }).select("+password");
    if (!user) throw new AppError("Invalid credentials", 401);
    const match = await user.comparePassword(data.password);
    if (!match) throw new AppError("Invalid credentials", 401);
    const safe = user.toSafeJSON();
    const { accessToken, refreshToken } = tokensFor({
      id: safe.id,
      role: safe.role,
      email: safe.email,
    });
    res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOpts);
    return res.json({ user: safe, accessToken });
  } catch (err) {
    return next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) throw new AppError("Refresh token required", 401);
    const payload = verifyRefreshToken(token);
    const accessToken = signAccessToken({
      sub: payload.sub,
      role: payload.role,
      email: payload.email,
    });
    return res.json({ accessToken });
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError("Invalid refresh token", 401));
  }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
  return res.json({ message: "Logged out" });
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError("Unauthenticated", 401);
    const user = await User.findById(req.user.sub);
    if (!user) throw new AppError("User not found", 404);
    return res.json({ user: user.toSafeJSON() });
  } catch (err) {
    return next(err);
  }
}
