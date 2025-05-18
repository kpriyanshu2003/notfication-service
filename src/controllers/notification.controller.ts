import { Request, Response } from "express";

export class NotificationController {
  async sendNotification(req: Request, res: Response): Promise<Response> {
    try {
      return res.status(200).json({
        message: "Notification sent successfully",
        data: req.body,
      });
    } catch (error) {
      console.error("Error sending notification:", error);
      return res.status(500).json({
        message: "Failed to send notification",
        error: error.message,
      });
    }
  }
}
