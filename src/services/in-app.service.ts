import { sendFCMMessage } from "../config/fcm";
import logger from "../config/logger";
import {
  NotificationPayload,
  NotificationResult,
} from "../types/notfication.type";
import userService from "./user.service";

export class InAppService {
  async sendInAppNotification(
    notification: NotificationPayload,
    userId: string
  ): Promise<NotificationResult> {
    try {
      const user = await userService.findById(userId);

      if (!user || !user.fcmToken) {
        return { success: false, error: `User has no FCM token registered` };
      }

      logger.debug("Sending in-app notification", {
        notificationId: notification.id,
        userId,
      });

      const messageId = await sendFCMMessage(
        user.fcmToken,
        notification.title,
        notification.content,
        { notificationId: notification.id }
      );

      logger.info("In-app notification sent successfully", {
        notificationId: notification.id,
        messageId,
      });

      return { success: true, messageId };
    } catch (error) {
      logger.error("Failed to send in-app notification", {
        notificationId: notification.id,
        userId,
        error,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

export default new InAppService();
