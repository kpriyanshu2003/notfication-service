import { NotificationPayload } from "../types/notfication.type";

export interface QueueMessage {
  payload: NotificationPayload;
  timestamp: number;
}

export enum QueueRoutingKey {
  EMAIL = "notification.email",
  SMS = "notification.sms",
  IN_APP = "notification.in_app",
}
