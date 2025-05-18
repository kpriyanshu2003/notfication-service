import { Request, Response } from "express";

export class UserController {
  async getUserNotifications(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.params.userId;
      // Simulate fetching notifications from a database
      const notifications = [
        { id: 1, message: "Notification 1 for user " + userId },
        { id: 2, message: "Notification 2 for user " + userId },
      ];

      return res.status(200).json({
        message: "User notifications fetched successfully",
        data: notifications,
      });
    } catch (error) {
      console.error("Error fetching user notifications:", error);
      return res.status(500).json({
        message: "Failed to fetch user notifications",
        error: error.message,
      });
    }
  }
}
