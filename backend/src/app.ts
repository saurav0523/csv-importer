import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import apiRoutes from "./routes/import.routes";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";

export function createApp() {
  const app = express();

  const allowedOrigins = env.CORS_ORIGIN.split(",").map((origin) => origin.trim());
  const corsOrigin = allowedOrigins.includes("*") ? "*" : allowedOrigins;

  app.use(helmet());
  app.use(
    cors({
      origin: corsOrigin,
      methods: ["GET", "POST"],
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

  app.use("/api", apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
