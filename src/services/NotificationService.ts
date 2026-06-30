import { NotificationRepository } from '../repositories/NotificationRepository';
import type { SystemNotification } from '../types';

export class NotificationService {
  static async getNotifications(userId: string): Promise<SystemNotification[]> {
    try {
      return await NotificationRepository.getNotifications(userId);
    } catch (err) {
      console.error("Error fetching notifications", err);
      return [];
    }
  }

  static subscribeToNotifications(userId: string, callback: (notifications: SystemNotification[]) => void) {
    return NotificationRepository.subscribeToNotifications(userId, callback, (error) => {
      console.error("Error subscribing to notifications:", error);
      callback([]);
    });
  }

  static async markAsRead(userId: string, notificationId: string): Promise<boolean> {
    try {
      await NotificationRepository.updateNotification(userId, notificationId, { readStatus: true });
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  static async markAllAsRead(userId: string, notifications: SystemNotification[]): Promise<boolean> {
    try {
      const promises = notifications.filter(n => !n.readStatus).map(n => 
        NotificationRepository.updateNotification(userId, n.id!, { readStatus: true })
      );
      await Promise.all(promises);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  static async deleteNotification(userId: string, notificationId: string): Promise<boolean> {
    try {
      await NotificationRepository.deleteNotification(userId, notificationId);
      return true;
    } catch (err) {
      console.error("Error deleting notification:", err);
      return false;
    }
  }

  static async togglePinNotification(userId: string, notificationId: string, currentPinStatus: boolean): Promise<boolean> {
    try {
      await NotificationRepository.updateNotification(userId, notificationId, { isPinned: !currentPinStatus });
      return true;
    } catch (err) {
      console.error("Error pinning notification:", err);
      return false;
    }
  }

  static async deleteAllNotifications(userId: string, notifications: SystemNotification[]): Promise<boolean> {
    try {
      const promises = notifications.map(n => 
        NotificationRepository.deleteNotification(userId, n.id!)
      );
      await Promise.all(promises);
      return true;
    } catch (err) {
      console.error("Error deleting all notifications:", err);
      return false;
    }
  }

  static async createNotification(userId: string, data: Omit<SystemNotification, "id" | "userId" | "createdAt" | "readStatus">): Promise<boolean> {
    try {
      await NotificationRepository.createNotification(userId, data);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
}
