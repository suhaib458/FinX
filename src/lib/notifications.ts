import { collection, query, where, orderBy, getDocs, updateDoc, doc, addDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";

export interface SystemNotification {
  id?: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  category: "career" | "finance" | "investment" | "system";
  readStatus: boolean;
  createdAt?: any;
  relatedEntityId?: string;
  actionUrl?: string;
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
