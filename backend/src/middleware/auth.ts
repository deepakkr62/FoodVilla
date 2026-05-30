import { NextFunction, Request, Response } from "express";
import { AppError } from "./errorHandler";
import { JwtPayload, verifyAccessToken } from "../services/tokenService";
import type { UserRole } from "../models/User";

declare module "express-serve-static-core" {
  interface Request {
    user?: JwtPayload;
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token =
    header && header.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) {
    return next(new AppError("Authentication required", 401));
  }
  try {
    req.user = verifyAccessToken(token);
    return next();
  } catch {
    return next(new AppError("Invalid or expired token", 401));
  }
}

export function requireRole(...roles: UserRole[]) {
  return function (req: Request, _res: Response, next: NextFunction) {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Forbidden — insufficient role", 403));
    }
    return next();
  };
}
