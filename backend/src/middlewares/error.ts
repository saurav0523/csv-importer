import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const message = err instanceof Error ? err.message : "Unexpected server error";

  if (!isAppError) {
    logger.error({ err, path: req.path }, "Unhandled error");
  } else {
    logger.warn({ message, path: req.path }, "Handled application error");
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
}
