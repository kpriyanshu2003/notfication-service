import androidSms from "../config/androidsms";
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
        "Title: " + notification.title + "\n\nContent:\n" + notification.content
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
    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      const messagePayload = {
        phoneNumbers: [formattedPhone],
        message: message,
      };

      const response = await androidSms.send(messagePayload);

      if (!response || !response.id) {
        throw new Error("Invalid response from SMS provider");
      }

      return { messageId: response.id };
    } catch (error) {
      logger.error("SMS provider error", { error, phoneNumber });
      throw error;
    }
  }

  private formatPhoneNumber(phoneNumber: string): string {
    let cleaned = phoneNumber.replace(/\D/g, "");
    if (!cleaned.startsWith("+")) cleaned = `+${cleaned}`;
    return cleaned;
  }
}

export default new SmsService();
