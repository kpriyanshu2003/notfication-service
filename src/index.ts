import createApp from "./app";
import { connectDatabase, disconnectDatabase } from "./config/database";
import { env, validateEnv } from "./config/env";
import logger from "./config/logger";
import { connectRabbitMQ, disconnectRabbitMQ } from "./config/rabbitmq";

validateEnv();

const startService = async (): Promise<void> => {
  try {
    logger.info("Starting service in mode: " + env.RUN_MODE);

    await connectDatabase();
    await connectRabbitMQ();
    const app = createApp();

    const server = app.listen(env.PORT, () =>
      logger.info(`API server is running on port ${env.PORT}`)
    );

    setupGracefulShutdown(server);
  } catch (error) {
    logger.error("Failed to start service", { error });
    process.exit(1);
  }
};

const setupGracefulShutdown = (server: any): void => {
  const shutdownGracefully = async (signal: string) => {
    logger.info(`${signal} received. Shutting down gracefully...`);

    server.close(() => logger.info("HTTP server closed"));

    await disconnectRabbitMQ();
    await disconnectDatabase();

    logger.info("Graceful shutdown completed");
    process.exit(0);
  };

  process.on("SIGTERM", () => shutdownGracefully("SIGTERM"));
  process.on("SIGINT", () => shutdownGracefully("SIGINT"));

  process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception", { error });
    shutdownGracefully("uncaughtException");
  });

  process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection", { reason, promise });
    shutdownGracefully("unhandledRejection");
  });
};

startService().catch((error) => {
  logger.error("Error starting service", { error });
  process.exit(1);
});
