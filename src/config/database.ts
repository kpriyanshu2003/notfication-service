import { PrismaClient } from "@prisma/client";
import logger from "./logger";

const prisma = new PrismaClient({
  log: [
    { emit: "event", level: "query" },
    { emit: "event", level: "error" },
  ],
});

if (process.env.NODE_ENV === "development") {
  prisma.$on("query", (e: { query: any; params: any; duration: any }) => {
    logger.debug("Prisma Query", {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
    });
  });
}

prisma.$on("error", (e: { message: any }) =>
  logger.error("Prisma Error", { error: e.message })
);

export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info("Connected to database");
  } catch (error) {
    logger.error("Failed to connect to database", { error });
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info("Disconnected from database");
  } catch (error) {
    logger.error("Failed to disconnect from database", { error });
  }
};

export default prisma;
