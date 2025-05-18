// src/app.ts
import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { env } from "./config/env";
import logger from "./config/logger";

import indexRoutes from "./routes/index.route";
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/errorHandler.middleware";

export const createApp = (): Express => {
  const app: Express = express();

  app.use(helmet());
  app.use(cors());
  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  if (env.NODE_ENV !== "production") app.use(morgan("dev"));
  else {
    app.use(
      morgan("combined", {
        stream: { write: (message: string) => logger.info(message.trim()) },
      })
    );
  }

  app.get("/health", (req, res) => {
    res
      .status(200)
      .json({ status: "ok", uptime: process.uptime(), timestamp: Date.now() });
  });

  app.use("/", indexRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;
