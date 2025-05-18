import dotenv from "dotenv";
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "3300", 10),
  RUN_MODE: process.env.RUN_MODE || "service", // 'service' or 'consumer'
};

export const validateEnv = (): void => {
  // const requiredVars = ["DATABASE_URL", "RABBITMQ_URL"];
  // for (const envVar of requiredVars) {
  //   if (!process.env[envVar]) {
  //     console.warn(`Missing required environment variable: ${envVar}`);
  //   }
  // }
};
