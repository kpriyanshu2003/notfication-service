import { Notification, NotificationStatus, Prisma } from "@prisma/client";
import prisma from "../config/database";
import {
  CreateNotificationDto,
  NotificationFilters,
  NotificationPayload,
  PaginatedNotifications,
} from "../types/notfication.type";
import logger from "../config/logger";
import { UserIdentifier } from "../types/user.type";
import userService from "./user.service";

export class NotificationService {
  async createNotification(data: CreateNotificationDto): Promise<Notification> {
    try {
      const { recipientIdentifier, type, title, content } = data;

      const isEmail = recipientIdentifier.includes("@");
      const identifier: UserIdentifier = isEmail
        ? { email: recipientIdentifier }
        : { phone: recipientIdentifier };

      const user = await userService.findOrCreate({ ...identifier });

      const notification = await prisma.notification.create({
        data: {
          userId: user.id,
          type,
          title,
          content,
          status: NotificationStatus.PENDING,
        },
      });

      logger.info("Notification created", {
        notificationId: notification.id,
        type,
        userId: user.id,
      });

      await this.queueNotification(notification);

      return notification;
    } catch (error) {
      logger.error("Error creating notification", { error, data });
      throw error;
    }
  }

  async queueNotification(notification: Notification): Promise<boolean> {
    try {
      const payload: NotificationPayload = {
        id: notification.id,
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        content: notification.content,
      };
      const routingKey = `notification.${notification.type.toLowerCase()}`;

      await this.updateNotificationStatus(
        notification.id,
        NotificationStatus.PROCESSING
      );

      // FIXME: implement rabbitmq
      const published = true; // await rabbitmq.publish(routingKey, payload);

      if (!published) {
        await this.updateNotificationStatus(
          notification.id,
          NotificationStatus.FAILED,
          "Failed to publish to queue"
        );
        return false;
      }

      logger.info("Notification queued for processing", {
        notificationId: notification.id,
        type: notification.type,
        routingKey,
      });

      return true;
    } catch (error) {
      logger.error("Error queueing notification", {
        notificationId: notification.id,
        error,
      });

      await this.updateNotificationStatus(
        notification.id,
        NotificationStatus.FAILED,
        error instanceof Error ? error.message : "Unknown error"
      );

      return false;
    }
  }

  async updateNotificationStatus(
    id: string,
    status: NotificationStatus,
    failureReason?: string
  ): Promise<Notification> {
    try {
      const data: Prisma.NotificationUpdateInput = { status };

      if (failureReason) data.failureReason = failureReason;
      if (status === NotificationStatus.SENT) data.sentAt = new Date();

      return await prisma.notification.update({ where: { id }, data });
    } catch (error) {
      logger.error("Error updating notification status", {
        notificationId: id,
        status,
        error,
      });
      throw error;
    }
  }

  async getUserNotifications(
    userId: string,
    filters: NotificationFilters = {}
  ): Promise<PaginatedNotifications> {
    try {
      const {
        status,
        type,
        startDate,
        endDate,
        page = 1,
        limit = 20,
      } = filters;

      const where: Prisma.NotificationWhereInput = { userId };

      if (status) where.status = status;
      if (type) where.type = type;

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
      }

      const total = await prisma.notification.count({ where });

      const skip = (page - 1) * limit;
      const pages = Math.ceil(total / limit);

      // Get paginated notifications
      const notifications = await prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      });

      return { items: notifications, total, page, limit, pages };
    } catch (error) {
      logger.error("Error getting user notifications", {
        userId,
        filters,
        error,
      });
      throw error;
    }
  }
}

export default new NotificationService();
