import * as amqp from "amqplib";
import { env } from "./env";
import logger from "./logger";

export const QUEUES = {
  EMAIL: "email_notifications",
  SMS: "sms_notifications",
  IN_APP: "in_app_notifications",
};

export const EXCHANGES = {
  NOTIFICATIONS: "notifications",
};

let connection: amqp.ChannelModel | null = null;
let channel: amqp.Channel | null = null;

export const connectRabbitMQ = async (): Promise<void> => {
  try {
    connection = await amqp.connect(env.RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGES.NOTIFICATIONS, "topic", {
      durable: true,
    });

    await channel.assertQueue(QUEUES.EMAIL, { durable: true });
    await channel.assertQueue(QUEUES.SMS, { durable: true });
    await channel.assertQueue(QUEUES.IN_APP, { durable: true });

    await channel.bindQueue(
      QUEUES.EMAIL,
      EXCHANGES.NOTIFICATIONS,
      "notification.email"
    );
    await channel.bindQueue(
      QUEUES.SMS,
      EXCHANGES.NOTIFICATIONS,
      "notification.sms"
    );
    await channel.bindQueue(
      QUEUES.IN_APP,
      EXCHANGES.NOTIFICATIONS,
      "notification.in_app"
    );
    logger.info("Connected to RabbitMQ");

    connection.on("close", () => {
      logger.warn("RabbitMQ connection closed, attempting to reconnect...");
      setTimeout(connectRabbitMQ, 5000);
    });

    connection.on("error", (err) => {
      logger.error("RabbitMQ connection error", { error: err.message });
      if (connection) connection.close();
    });
  } catch (error) {
    logger.error("Failed to connect to RabbitMQ", { error });
    setTimeout(connectRabbitMQ, 5000);
  }
};

export const disconnectRabbitMQ = async (): Promise<void> => {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    logger.info("Disconnected from RabbitMQ");
  } catch (error) {
    logger.error("Failed to disconnect from RabbitMQ", { error });
  }
};

export const getChannel = (): amqp.Channel => {
  if (!channel) {
    throw new Error("RabbitMQ channel not initialized");
  }
  return channel;
};

export const publishToQueue = async (
  queue: string,
  message: any,
  options: amqp.Options.Publish = {}
): Promise<boolean> => {
  try {
    const ch = getChannel();
    return ch.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      persistent: true,
      ...options,
    });
  } catch (error) {
    logger.error("Failed to publish message to queue", { queue, error });
    return false;
  }
};

export const publishToExchange = async (
  exchange: string,
  routingKey: string,
  message: any,
  options: amqp.Options.Publish = {}
): Promise<boolean> => {
  try {
    const ch = getChannel();
    return ch.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      {
        persistent: true,
        ...options,
      }
    );
  } catch (error) {
    logger.error("Failed to publish message to exchange", {
      exchange,
      routingKey,
      error,
    });
    return false;
  }
};
