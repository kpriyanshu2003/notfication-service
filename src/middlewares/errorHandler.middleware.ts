import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  logger.error("Error middleware caught an error", {
    error: err.message,
    stack: process.env.NODE_ENV === "production" ? "[warn]" : err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(statusCode).json({
    status: "error",
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? "[warn]" : err.stack,
  });
};
