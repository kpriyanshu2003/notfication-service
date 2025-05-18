import nodemailer, { Transporter } from "nodemailer";
import { env } from "../config/env";
import logger from "../config/logger";
import {
  NotificationPayload,
  NotificationResult,
} from "../types/notfication.type";

export class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  }

  async sendEmail(
    notification: NotificationPayload,
    recipient: string
  ): Promise<NotificationResult> {
    try {
      logger.debug("Sending email notification", {
        notificationId: notification.id,
        recipient,
      });

      const { title, content } = notification;

      const mailOptions = {
        from: env.EMAIL_FROM,
        to: recipient,
        subject: title,
        text: content,
        html: `<p>${content}</p>`,
      };

      const info = await this.transporter.sendMail(mailOptions);

      logger.info("Email sent successfully", {
        notificationId: notification.id,
        messageId: info.messageId,
      });

      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error("Failed to send email", {
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
}

export default new EmailService();
