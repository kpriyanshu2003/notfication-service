import { NotificationType } from "@prisma/client";
import { EXCHANGES, publishToExchange } from "../config/rabbitmq";
import logger from "../config/logger";
import { NotificationPayload } from "../types/notfication.type";

export const sendNotificationToQueue = async (
  notification: NotificationPayload
): Promise<boolean> => {
  try {
    let routingKey: string;

    switch (notification.type) {
      case NotificationType.EMAIL:
        routingKey = "notification.email";
        break;
      case NotificationType.SMS:
        routingKey = "notification.sms";
        break;
      case NotificationType.IN_APP:
        routingKey = "notification.in_app";
        break;
      default:
        throw new Error(`Unknown notification type: ${notification.type}`);
    }

    const result = await publishToExchange(
      EXCHANGES.NOTIFICATIONS,
      routingKey,
      notification
    );

    if (result) {
      logger.info("Notification published to queue", {
        notificationId: notification.id,
        type: notification.type,
        routingKey,
      });
    } else {
      logger.error("Failed to publish notification to queue", {
        notificationId: notification.id,
        type: notification.type,
      });
    }

    return result;
  } catch (error) {
    logger.error("Error publishing notification to queue", {
      notification,
      error,
    });
    return false;
  }
};
