import { db, auth } from "./firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy,
  getDocs,
  serverTimestamp
} from "firebase/firestore";

export type SavedItemType = "job" | "project" | "note" | "finance" | "interview";

export interface SavedItem {
  id: string; // The document ID in the saved collection, e.g. `<uid>_<itemType>_<itemId>`
  uid: string;
  itemType: SavedItemType;
  itemId: string;
  title: string;
  subtitle?: string;
  metadata?: any;
  savedAt: string;
  folderId?: string;
  pinned: boolean;
}

export const SavedService = {
  // Generate a unique ID for a saved item to prevent duplicates
  _getSavedId(uid: string, itemType: string, itemId: string) {
    return `${uid}_${itemType}_${itemId}`;
  },

  async toggleSaveItem(
    uid: string,
    itemType: SavedItemType, 
    itemId: string, 
    title: string, 
    subtitle?: string, 
    metadata?: any
  ) {
    const savedId = this._getSavedId(uid, itemType, itemId);
    const docRef = doc(db, "savedItems", savedId);

    // Check if it exists
    const allQuery = query(collection(db, "savedItems"), where("uid", "==", uid), where("itemType", "==", itemType), where("itemId", "==", itemId));
    const snapshot = await getDocs(allQuery);
    
    if (!snapshot.empty) {
      // Unsave
      for (const d of snapshot.docs) {
        await deleteDoc(d.ref);
      }
      return false;
    } else {
      // Save
      const payload = {
        uid,
        itemType,
        itemId,
        title,
        subtitle: subtitle || "",
        metadata: metadata || {},
        savedAt: new Date().toISOString(),
        pinned: false
      };
      await setDoc(docRef, payload);
      return true;
    }
  },

  async isSaved(uid: string, itemType: SavedItemType, itemId: string): Promise<boolean> {
    const q = query(
      collection(db, "savedItems"), 
      where("uid", "==", uid), 
      where("itemType", "==", itemType), 
      where("itemId", "==", itemId)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  },

  subscribeToSavedItems(uid: string, onUpdate: (items: SavedItem[]) => void) {
    const q = query(collection(db, "savedItems"), where("uid", "==", uid), orderBy("savedAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const items: SavedItem[] = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() } as SavedItem);
      });
      onUpdate(items);
    }, (error) => {
      console.warn("Error fetching saved items", error);
      onUpdate([]);
    });
  },

  async togglePin(savedId: string, currentPinStatus: boolean) {
    const docRef = doc(db, "savedItems", savedId);
    await setDoc(docRef, { pinned: !currentPinStatus }, { merge: true });
  },

  async deleteSavedItem(savedId: string) {
    const docRef = doc(db, "savedItems", savedId);
    await deleteDoc(docRef);
  }
};
