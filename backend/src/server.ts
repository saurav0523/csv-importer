import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { setupDatabase } from "./config/db";

async function startServer() {
  try {
    await setupDatabase();

    const app = createApp();
    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 GrowEasy CSV Importer API running on port ${env.PORT} [${env.NODE_ENV}]`);
      logger.info(`AI provider: openrouter (${env.OPENROUTER_MODEL})`);
    });

    const gracefulShutdown = (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info("Server closed.");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  } catch (err) {
    logger.error({ error: (err as Error).message }, "Failed to start server");
    process.exit(1);
  }
}

startServer();
