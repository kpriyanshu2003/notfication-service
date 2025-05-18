import { Request, Response } from "express";
import notificationService from "../services/notification.service";
import userService from "../services/user.service";
import { NotificationFilters } from "../types/notfication.type";
import { NotificationStatus, NotificationType } from "@prisma/client";
import logger from "../config/logger";

export class UserController {
  async getUserNotifications(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const user = await userService.findById(id);

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: `User with ID ${id} not found`,
        });
      }

      const filters: NotificationFilters = {};

      if (req.query.status) {
        const status = req.query.status as string;
        if (
          Object.values(NotificationStatus).includes(
            status as NotificationStatus
          )
        )
          filters.status = status as NotificationStatus;
      }

      if (req.query.type) {
        const type = req.query.type as string;
        if (Object.values(NotificationType).includes(type as NotificationType))
          filters.type = type as NotificationType;
      }

      if (req.query.startDate)
        filters.startDate = new Date(req.query.startDate as string);

      if (req.query.endDate)
        filters.endDate = new Date(req.query.endDate as string);

      if (req.query.page) filters.page = parseInt(req.query.page as string, 10);

      if (req.query.limit)
        filters.limit = parseInt(req.query.limit as string, 10);

      const notifications = await notificationService.getUserNotifications(
        id,
        filters
      );

      return res.status(200).json({
        status: "success",
        data: notifications,
      });
    } catch (error) {
      logger.error("Error in getUserNotifications controller", {
        error,
        userId: req.params.id,
      });

      return res.status(500).json({
        status: "error",
        message: "An error occurred while retrieving user notifications",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export default new UserController();
