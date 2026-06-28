import { collection, query, where, orderBy, getDocs, updateDoc, doc, addDoc, serverTimestamp, deleteDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

export interface SystemNotification {
  id?: string;
  userId: string;
  type: string; // Used for icon/specific grouping
  title: string;
  message: string;
  category: "finance" | "debt" | "projects" | "career" | "account" | "system";
  priority?: "critical" | "warning" | "info" | "success";
  readStatus: boolean;
  createdAt?: any;
  relatedEntityId?: string;
  actionUrl?: string; // Could be a tab name to navigate to
  groupId?: string; // For grouping similar notifications
  fcmMessageId?: string; // For Firebase Cloud Messaging
  isPinned?: boolean; // For pinning important notifications
}

export const getNotifications = async (userId: string): Promise<SystemNotification[]> => {
  try {
    const q = query(
      collection(db, "users", userId, "notifications"),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as SystemNotification));
  } catch (err) {
    console.error("Error fetching notifications", err);
    return [];
  }
};

export const subscribeToNotifications = (userId: string, callback: (notifications: SystemNotification[]) => void) => {
  const q = query(
    collection(db, "users", userId, "notifications"),
    orderBy("createdAt", "desc")
  );
  
  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as SystemNotification));
    callback(notifications);
  }, (error) => {
    console.error("Error subscribing to notifications:", error);
    callback([]);
  });
};

export const markAsRead = async (userId: string, notificationId: string) => {
  try {
    const dRef = doc(db, "users", userId, "notifications", notificationId);
    await updateDoc(dRef, { readStatus: true });
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

export const markAllAsRead = async (userId: string, notifications: SystemNotification[]) => {
  try {
    const promises = notifications.filter(n => !n.readStatus).map(n => 
      updateDoc(doc(db, "users", userId, "notifications", n.id!), { readStatus: true })
    );
    await Promise.all(promises);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

export const deleteNotification = async (userId: string, notificationId: string) => {
  try {
    const dRef = doc(db, "users", userId, "notifications", notificationId);
    await deleteDoc(dRef);
    return true;
  } catch (err) {
    console.error("Error deleting notification:", err);
    return false;
  }
};

export const togglePinNotification = async (userId: string, notificationId: string, currentPinStatus: boolean) => {
  try {
    const dRef = doc(db, "users", userId, "notifications", notificationId);
    await updateDoc(dRef, { isPinned: !currentPinStatus });
    return true;
  } catch (err) {
    console.error("Error pinning notification:", err);
    return false;
  }
};

export const deleteAllNotifications = async (userId: string, notifications: SystemNotification[]) => {
  try {
    const promises = notifications.map(n => 
      deleteDoc(doc(db, "users", userId, "notifications", n.id!))
    );
    await Promise.all(promises);
    return true;
  } catch (err) {
    console.error("Error deleting all notifications:", err);
    return false;
  }
};

export const createNotification = async (userId: string, data: Omit<SystemNotification, "id" | "userId" | "createdAt" | "readStatus">) => {
  try {
    const colId = collection(db, "users", userId, "notifications");
    await addDoc(colId, {
      ...data,
      userId,
      readStatus: false,
      createdAt: serverTimestamp()
    });
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};
