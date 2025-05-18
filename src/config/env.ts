import dotenv from "dotenv";
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "3300", 10),
  RUN_MODE: process.env.RUN_MODE || "service", // 'service' or 'consumer'

  DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/notification-service",

  // SMTP config
  SMTP_HOST: process.env.SMTP_HOST || "smtp.example.com",
  SMTP_PORT: parseInt(process.env.SMTP_PORT || "587", 10),
  SMTP_USER: process.env.SMTP_USER || "user@example.com",
  SMTP_PASS: process.env.SMTP_PASS || "password",
  EMAIL_FROM: process.env.EMAIL_FROM || "notifications@example.com",

  // FCM config
  FCM_PROJECT_ID: process.env.FCM_PROJECT_ID || "",
  FCM_CLIENT_EMAIL: process.env.FCM_CLIENT_EMAIL || "",
  FCM_PRIVATE_KEY: process.env.FCM_PRIVATE_KEY?.replace(/\\n/g, "\n") || "",
};

export const validateEnv = (): void => {
  // const requiredVars = ["DATABASE_URL", "RABBITMQ_URL"];
  // for (const envVar of requiredVars) {
  //   if (!process.env[envVar]) {
  //     console.warn(`Missing required environment variable: ${envVar}`);
  //   }
  // }
};
