import { NotificationType } from "@prisma/client";

export interface CreateNotificationDto {
  recipientIdentifier: string; // email or phone
  type: NotificationType;
  title: string;
  content: string;
}

export interface NotificationPayload {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
}
