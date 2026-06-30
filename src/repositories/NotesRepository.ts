import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import type { FinNote } from '../types';

export class NotesRepository {
  static getCollectionRef(userId: string) {
    return collection(db, "users", userId, "notes");
  }

  static getDocumentRef(userId: string, noteId: string) {
    return doc(db, "users", userId, "notes", noteId);
  }

  static async getNotes(userId: string, sortOrder: 'asc' | 'desc'): Promise<FinNote[]> {
    const q = query(
      this.getCollectionRef(userId),
      orderBy("updatedAt", sortOrder)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as FinNote));
  }

  static async createNote(userId: string, noteData: Partial<FinNote>): Promise<string> {
    const colRef = this.getCollectionRef(userId);
    const docRef = await addDoc(colRef, noteData);
    return docRef.id;
  }

  static async updateNote(userId: string, noteId: string, noteData: Partial<FinNote>): Promise<void> {
    const dRef = this.getDocumentRef(userId, noteId);
    await updateDoc(dRef, noteData as any);
  }

  static async deleteNote(userId: string, noteId: string): Promise<void> {
    const dRef = this.getDocumentRef(userId, noteId);
    await deleteDoc(dRef);
  }
}
