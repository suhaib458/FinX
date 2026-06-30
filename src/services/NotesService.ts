import { NotesRepository } from '../repositories/NotesRepository';
import type { FinNote } from '../types';

export class NotesService {
  static async getNotes(userId: string, sortOrder: 'asc' | 'desc'): Promise<FinNote[]> {
    try {
      return await NotesRepository.getNotes(userId, sortOrder);
    } catch (error) {
      console.error("Error fetching notes:", error);
      throw error;
    }
  }

  static async saveNote(
    userId: string, 
    currentNote: FinNote | null, 
    title: string, 
    content: string, 
    isRtl: boolean
  ): Promise<FinNote> {
    const now = Date.now();
    try {
      if (currentNote && currentNote.id) {
        // Update
        await NotesRepository.updateNote(userId, currentNote.id, {
          title,
          content,
          updatedAt: now
        });
        return { ...currentNote, title, content, updatedAt: now };
      } else {
        // Create
        const newNoteData = {
          title: title || (isRtl ? 'ملاحظة بلا عنوان' : 'Untitled Note'),
          content,
          userId,
          createdAt: now,
          updatedAt: now
        };
        const id = await NotesRepository.createNote(userId, newNoteData);
        return { id, ...newNoteData } as FinNote;
      }
    } catch (error) {
      console.error("Error saving note:", error);
      throw error;
    }
  }

  static async deleteNote(userId: string, noteId: string): Promise<void> {
    try {
      await NotesRepository.deleteNote(userId, noteId);
    } catch (error) {
      console.error("Error deleting note:", error);
      throw error;
    }
  }

  static async parseSmsAndCreateNote(
    userId: string,
    smsText: string,
    lang: "ar" | "en",
    token: string
  ): Promise<{ newNote: FinNote; transactionData: any }> {
    const response = await fetch('/api/parse-sms', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ smsText, language: lang })
    });

    if (!response.ok) throw new Error("API error");
    const data = await response.json();
    
    const isRtl = lang === "ar";
    const now = Date.now();
    const newNoteData = {
      title: data.title || (isRtl ? 'استخراج رسالة' : 'SMS Extraction'),
      content: isRtl 
        ? `تفاصيل المعاملة:\nالمبلغ: ${data.amount} ${data.currency}\nالنوع: ${data.type === 'income' ? 'إيداع/دخل' : 'مشتريات/سحب'}\nالتاجر: ${data.merchant}\nالتاريخ: ${data.date}\nالفئة: ${data.category}`
        : `Transaction Details:\nAmount: ${data.amount} ${data.currency}\nType: ${data.type}\nMerchant: ${data.merchant}\nDate: ${data.date}\nCategory: ${data.category}`,
      userId,
      createdAt: now,
      updatedAt: now
    };
    
    const id = await NotesRepository.createNote(userId, newNoteData);
    
    return {
      newNote: { id, ...newNoteData } as FinNote,
      transactionData: data
    };
  }
}
