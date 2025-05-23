import { NotificationType, User } from "@prisma/client";
import { Request, Response } from "express";
import { CreateNotificationDto } from "../types/notfication.type";
import logger from "../config/logger";
import notificationService from "../services/notification.service";
import userService from "../services/user.service";
import { UserIdentifier } from "../types/user.type";

export class NotificationController {
  async sendNotification(req: Request, res: Response): Promise<any> {
    try {
      const { recipient, type, title, content } = req.body;

      if (!recipient || !type || !title || !content) {
        return res.status(400).json({
          status: "error",
          message: "Missing required fields: recipient, type, title, content",
        });
      }

      if (!Object.values(NotificationType).includes(type)) {
        return res.status(400).json({
          status: "error",
          message: `Invalid notification type. Must be one of: ${Object.values(
            NotificationType
          ).join(", ")}`,
        });
      }

      const notificationData: CreateNotificationDto = {
        recipientIdentifier: recipient,
        type: type as NotificationType,
        title,
        content,
      };

      const notification = await notificationService.createNotification(
        notificationData
      );

      let user: User | null = null;
      if (
        notification.type === NotificationType.EMAIL ||
        notification.type === NotificationType.SMS
      ) {
        const identifier =
          notification.type === NotificationType.EMAIL
            ? { email: recipient }
            : { phone: recipient };
        user = await userService.findByIdentifier(identifier);
      }

      return res.status(201).json({
        status: "success",
        message: "Notification queued successfully",
        data: {
          userId: user?.id,
          notificationId: notification.id,
          type: notification.type,
          status: notification.status,
          createdAt: notification.createdAt,
        },
      });
    } catch (error) {
      logger.error("Error in sendNotification controller", { error });

      return res.status(500).json({
        status: "error",
        message: "An error occurred while sending the notification",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export default new NotificationController();
