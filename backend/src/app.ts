import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { env, isTest } from "./config/env";
import { errorHandler, notFound } from "./middleware/errorHandler";
import healthRouter from "./routes/health";
import authRouter from "./routes/auth";
import restaurantsRouter from "./routes/restaurants";
import addressesRouter from "./routes/addresses";
import ordersRouter from "./routes/orders";
import reviewsRouter from "./routes/reviews";
import usersRouter from "./routes/users";

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  if (!isTest) {
    app.use(morgan("dev"));
  }

  app.use(
    "/api",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.use("/api", healthRouter);
  app.use("/api", authRouter);
  app.use("/api", restaurantsRouter);
  app.use("/api", addressesRouter);
  app.use("/api", ordersRouter);
  app.use("/api", reviewsRouter);
  app.use("/api", usersRouter);

  // Root
  app.get("/", (_req, res) => {
    res.json({
      service: "Food Villa API",
      docs: "/api/health",
    });
  });

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
