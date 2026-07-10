import "dotenv/config";

export const env = {
  PORT: Number(process.env.PORT || 8080),
  NODE_ENV: process.env.NODE_ENV || "development",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",

  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || "",
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || "openrouter/free",

  DATABASE_URL: process.env.DATABASE_URL || "",

  AI_BATCH_SIZE: Number(process.env.AI_BATCH_SIZE || 25),
  AI_MAX_RETRIES: Number(process.env.AI_MAX_RETRIES || 3),
  AI_CONCURRENCY: Number(process.env.AI_CONCURRENCY || 3),

  MAX_FILE_SIZE_MB: Number(process.env.MAX_FILE_SIZE_MB || 5),
  MAX_ROWS_PER_IMPORT: Number(process.env.MAX_ROWS_PER_IMPORT || 5000),

  RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
  RATE_LIMIT_MAX_REQUESTS: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 20),
};

export const isProd = env.NODE_ENV === "production";
