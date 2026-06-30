import { NotificationService } from "../services/NotificationService";
import type { SystemNotification } from "../types";

export type { SystemNotification };

export const getNotifications = async (userId: string): Promise<SystemNotification[]> => {
  return NotificationService.getNotifications(userId);
};

export const subscribeToNotifications = (userId: string, callback: (notifications: SystemNotification[]) => void) => {
  return NotificationService.subscribeToNotifications(userId, callback);
};

export const markAsRead = async (userId: string, notificationId: string) => {
  return NotificationService.markAsRead(userId, notificationId);
};

export const markAllAsRead = async (userId: string, notifications: SystemNotification[]) => {
  return NotificationService.markAllAsRead(userId, notifications);
};

export const deleteNotification = async (userId: string, notificationId: string) => {
  return NotificationService.deleteNotification(userId, notificationId);
};

export const togglePinNotification = async (userId: string, notificationId: string, currentPinStatus: boolean) => {
  return NotificationService.togglePinNotification(userId, notificationId, currentPinStatus);
};

export const deleteAllNotifications = async (userId: string, notifications: SystemNotification[]) => {
  return NotificationService.deleteAllNotifications(userId, notifications);
};

export const createNotification = async (userId: string, data: Omit<SystemNotification, "id" | "userId" | "createdAt" | "readStatus">) => {
  return NotificationService.createNotification(userId, data);
};

