import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export class AppError extends Error {
  statusCode: number;
  details?: unknown;
  constructor(message: string, statusCode = 500, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function notFound(req: Request, res: Response, _next: NextFunction) {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Validation Error",
      issues: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
  }
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.details,
    });
  }
  const message = err instanceof Error ? err.message : "Internal Server Error";
  if (process.env.NODE_ENV !== "test") {
    console.error("[error]", err);
  } else {
    // surface the stack in test so failures are debuggable
    console.error("[test-error]", err instanceof Error ? err.stack : err);
  }
  return res.status(500).json({ error: "Internal Server Error", message });
}
