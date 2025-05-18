// src/services/sms.service.ts
import logger from "../config/logger";
import {
  NotificationPayload,
  NotificationResult,
} from "../types/notfication.type";

export class SmsService {
  async sendSms(
    notification: NotificationPayload,
    recipient: string
  ): Promise<NotificationResult> {
    try {
      logger.debug("Sending SMS notification", {
        notificationId: notification.id,
        recipient,
      });

      const result = await this.sendViaSmsProvider(
        recipient,
        notification.content
      );

      logger.info("SMS sent successfully", {
        notificationId: notification.id,
        messageId: result.messageId,
      });

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      logger.error("Failed to send SMS", {
        notificationId: notification.id,
        recipient,
        error,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async sendViaSmsProvider(
    phoneNumber: string,
    message: string
  ): Promise<{ messageId: string }> {
    // Simulate SMS sending delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // TODO: Replace with actual SMS provider integration

    // Generate a fake message ID for demonstration
    const messageId = `sms_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    return { messageId };
  }
}

export default new SmsService();
