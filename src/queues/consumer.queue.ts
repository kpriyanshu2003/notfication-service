import { ConsumeMessage } from "amqplib";
import { NotificationType } from "@prisma/client";
import { getChannel, QUEUES } from "../config/rabbitmq";
import logger from "../config/logger";

import emailService from "../services/email.service";
import smsService from "../services/sms.service";
import inAppService from "../services/in-app.service";
import notificationService from "../services/notification.service";
import userService from "../services/user.service";
import { NotificationPayload } from "../types/notfication.type";

const processEmailNotification = async (
  notification: NotificationPayload
): Promise<void> => {
  try {
    const user = await userService.findById(notification.userId);

    if (!user || !user.email) {
      throw new Error(
        `User ${notification.userId} does not have an email address`
      );
    }

    const result = await emailService.sendEmail(notification, user.email);

    if (result.success) {
      await notificationService.markNotificationSent(
        notification.id,
        result.messageId
      );
    } else {
      await notificationService.markNotificationFailed(
        notification.id,
        result.error || "Unknown error"
      );
    }
  } catch (error) {
    logger.error("Error processing email notification", {
      notificationId: notification.id,
      error,
    });

    await notificationService.markNotificationFailed(
      notification.id,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
};

const processSmsNotification = async (
  notification: NotificationPayload
): Promise<void> => {
  try {
    const user = await userService.findById(notification.userId);

    if (!user || !user.phone) {
      throw new Error(
        `User ${notification.userId} does not have a phone number`
      );
    }

    const result = await smsService.sendSms(notification, user.phone);

    if (result.success) {
      // Mark as sent
      await notificationService.markNotificationSent(
        notification.id,
        result.messageId
      );
    } else {
      await notificationService.markNotificationFailed(
        notification.id,
        result.error || "Unknown error"
      );
    }
  } catch (error) {
    logger.error("Error processing SMS notification", {
      notificationId: notification.id,
      error,
    });

    await notificationService.markNotificationFailed(
      notification.id,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
};

const processInAppNotification = async (
  notification: NotificationPayload
): Promise<void> => {
  try {
    const result = await inAppService.sendInAppNotification(
      notification,
      notification.userId
    );

    if (result.success) {
      await notificationService.markNotificationSent(
        notification.id,
        result.messageId
      );
    } else {
      await notificationService.markNotificationFailed(
        notification.id,
        result.error || "Unknown error"
      );
    }
  } catch (error) {
    logger.error("Error processing in-app notification", {
      notificationId: notification.id,
      error,
    });

    await notificationService.markNotificationFailed(
      notification.id,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
};

const processNotification = async (
  notification: NotificationPayload
): Promise<void> => {
  logger.debug("Processing notification", {
    notificationId: notification.id,
    type: notification.type,
  });

  try {
    switch (notification.type) {
      case NotificationType.EMAIL:
        await processEmailNotification(notification);
        break;
      case NotificationType.SMS:
        await processSmsNotification(notification);
        break;
      case NotificationType.IN_APP:
        await processInAppNotification(notification);
        break;
      default:
        logger.error("Unknown notification type", {
          notificationId: notification.id,
          type: notification.type,
        });
    }
  } catch (error) {
    logger.error("Error processing notification", {
      notificationId: notification.id,
      error,
    });

    await notificationService.markNotificationFailed(
      notification.id,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
};

const handleMessage =
  (queue: string) =>
  async (msg: ConsumeMessage | null): Promise<void> => {
    if (!msg) {
      return;
    }

    try {
      const content = msg.content.toString();
      const notification = JSON.parse(content) as NotificationPayload;

      logger.debug("Received message from queue", {
        queue,
        notificationId: notification.id,
      });

      await processNotification(notification);

      const channel = getChannel();
      channel.ack(msg);
    } catch (error) {
      logger.error("Error handling message", { queue, error });

      const channel = getChannel();
      channel.nack(msg, false, true);
    }
  };

export const setupConsumers = async (): Promise<void> => {
  try {
    const channel = getChannel();
    await channel.prefetch(1);

    await channel.consume(QUEUES.EMAIL, handleMessage(QUEUES.EMAIL), {
      noAck: false,
    });
    logger.info("Email consumer set up");

    await channel.consume(QUEUES.SMS, handleMessage(QUEUES.SMS), {
      noAck: false,
    });
    logger.info("SMS consumer set up");

    await channel.consume(QUEUES.IN_APP, handleMessage(QUEUES.IN_APP), {
      noAck: false,
    });
    logger.info("In-app consumer set up");

    logger.info("All consumers are ready");
  } catch (error) {
    logger.error("Error setting up consumers", { error });
    throw error;
  }
};
