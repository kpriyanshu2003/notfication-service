import { NotificationStatus, NotificationType } from "@prisma/client";

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

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface NotificationFilters {
  status?: NotificationStatus;
  type?: NotificationType;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface PaginatedNotifications {
  items: Array<any>;
  total: number;
  page: number;
  limit: number;
  pages: number;
}
