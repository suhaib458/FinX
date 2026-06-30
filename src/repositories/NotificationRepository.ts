import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs, updateDoc, doc, addDoc, serverTimestamp, deleteDoc, onSnapshot, DocumentData, QuerySnapshot } from 'firebase/firestore';
import type { SystemNotification } from '../types';

export class NotificationRepository {
  static getCollectionRef(userId: string) {
    return collection(db, "users", userId, "notifications");
  }

  static getDocumentRef(userId: string, notificationId: string) {
    return doc(db, "users", userId, "notifications", notificationId);
  }

  static async getNotifications(userId: string): Promise<SystemNotification[]> {
    const q = query(
      this.getCollectionRef(userId),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as SystemNotification));
  }

  static subscribeToNotifications(
    userId: string, 
    callback: (notifications: SystemNotification[]) => void,
    onError?: (error: Error) => void
  ) {
    const q = query(
      this.getCollectionRef(userId),
      orderBy("createdAt", "desc")
    );
    
    return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as SystemNotification));
      callback(notifications);
    }, (error: any) => {
      if (onError) onError(error);
      else console.error("Error subscribing to notifications:", error);
    });
  }

  static async updateNotification(userId: string, notificationId: string, data: Partial<SystemNotification>) {
    const dRef = this.getDocumentRef(userId, notificationId);
    return updateDoc(dRef, data as any);
  }

  static async deleteNotification(userId: string, notificationId: string) {
    const dRef = this.getDocumentRef(userId, notificationId);
    return deleteDoc(dRef);
  }

  static async createNotification(userId: string, data: Omit<SystemNotification, "id" | "userId" | "createdAt" | "readStatus">) {
    const colRef = this.getCollectionRef(userId);
    return addDoc(colRef, {
      ...data,
      userId,
      readStatus: false,
      createdAt: serverTimestamp()
    });
  }
}
