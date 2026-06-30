import React, { useState, useEffect } from 'react';
import SaveButton from "./SaveButton";
import { translations } from "../translations";
import { FinNote, Transaction } from "../types";
import { auth } from '../lib/firebase';
import { NotesService } from '../services/NotesService';
import { Plus, Search, NotebookText, Trash2, Edit2, X, BrainCircuit, ArrowDownUp, Save, MessageSquareText } from 'lucide-react';

interface NotesProps {
  lang: "ar" | "en";
  onSendToCoach?: (text: string) => void;
  onAddTransaction?: (tx: Transaction) => void;
}

const FinancialNotes = ({ lang, onSendToCoach, onAddTransaction }: NotesProps) => {
  const t = translations[lang] as any;
  const isRtl = lang === "ar";
  
  const [notes, setNotes] = useState<FinNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  
  // SMS Feature state
  const [smsText, setSmsText] = useState("");
  const [smsLoading, setSmsLoading] = useState(false);

  const handleParseSms = async () => {
    if (!smsText.trim() || !auth.currentUser) return;
    setSmsLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const { newNote, transactionData } = await NotesService.parseSmsAndCreateNote(
        auth.currentUser.uid,
        smsText,
        lang,
        token
      );
      
      setNotes([newNote, ...notes]);
      setSmsText("");

      if (onAddTransaction && typeof transactionData.amount === 'number') {
        onAddTransaction({
          date: new Date().toISOString().split('T')[0],
          desc: transactionData.merchant || transactionData.title || "SMS Auto-Extract",
          amount: transactionData.amount,
          type: transactionData.type === 'income' ? 'income' : 'expense',
          category: transactionData.category || "General"
        });
      }

    } catch (e: any) {
      setErrorMsg(e.message || "Failed to parse SMS");
    } finally {
      setSmsLoading(false);
    }
  };

  // Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [currentNote, setCurrentNote] = useState<FinNote | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [sortOrder]);

  const fetchNotes = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const fetchedNotes = await NotesService.getNotes(auth.currentUser.uid, sortOrder);
      setNotes(fetchedNotes);
    } catch (error: any) {
      setErrorMsg(error.message || 'Failed to fetch notes.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!auth.currentUser || (!editTitle.trim() && !editContent.trim())) return;
    
    setSaveLoading(true);
    setErrorMsg('');
    try {
      const savedNote = await NotesService.saveNote(
        auth.currentUser.uid,
        currentNote,
        editTitle,
        editContent,
        isRtl
      );

      if (currentNote) {
        setNotes(notes.map(n => n.id === currentNote.id ? savedNote : n));
      } else {
        setNotes([savedNote, ...notes]);
      }
      setIsEditing(false);
    } catch (error: any) {
      setErrorMsg(error.message || 'Failed to save note.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!auth.currentUser) return;
    setErrorMsg('');
    try {
      await NotesService.deleteNote(auth.currentUser.uid, noteId);
      setNotes(notes.filter(n => n.id !== noteId));
    } catch (error: any) {
      setErrorMsg(error.message || 'Failed to delete note.');
    }
  };

  const openEditor = (note?: FinNote) => {
    if (note) {
      setCurrentNote(note);
      setEditTitle(note.title);
      setEditContent(note.content);
    } else {
      setCurrentNote(null);
      setEditTitle('');
      setEditContent('');
    }
    setIsEditing(true);
  };

  const handleAnalyze = (note: FinNote) => {
    if (onSendToCoach) {
      const prompt = isRtl
        ? `حلل الملاحظة المالية التالية واستخرج الأهداف مع تقديم خطوات عملية:\nالحدث: ${note.title}\nالتفاصيل: ${note.content}`
        : `Analyze the following financial note, extract goals and provide actionable steps:\nTitle: ${note.title}\nDetails: ${note.content}`;
      onSendToCoach(prompt);
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isEditing) {
    return (
      <div className="flex-1 flex flex-col p-4 bg-[#F7F8FA] dark:bg-transparent overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => setIsEditing(false)}
            className="flex items-center gap-2 text-text-primary dark:text-text-secondary hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
            <span className="text-xs font-bold">{t.cancel}</span>
          </button>
          <button 
            onClick={handleSave}
            disabled={saveLoading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-bg-secondary disabled:text-text-primary dark:text-text-secondary text-white px-4 py-2 rounded-xl transition-colors text-xs font-bold"
          >
            <Save className="w-4 h-4" />
            {saveLoading ? '...' : t.saveNote}
          </button>
        </div>

        <input 
          dir="auto"
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          placeholder={t.noteTitlePlaceholder}
          className="bg-transparent text-xl font-bold text-text-primary placeholder-slate-600 focus:outline-none mb-4"
        />

        <textarea 
          dir="auto"
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          placeholder={t.noteContentPlaceholder}
          className="flex-1 bg-surface-primary/50 border border-border-primary rounded-xl p-4 text-text-primary placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 resize-none text-sm leading-relaxed"
        />
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col p-4 bg-[#F7F8FA] dark:bg-transparent overflow-y-auto ${isRtl ? 'font-arabic' : 'font-sans'}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-text-primary">{t.notesTitle}</h2>
          <p className="text-xs text-text-primary dark:text-text-secondary mt-1">
            {notes.length} {isRtl ? 'ملاحظات' : 'Notes'}
          </p>
        </div>
        <button 
          onClick={() => openEditor()}
          className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center text-white transition-colors shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-6">
        <div className="relative flex-1">
          <Search className={`absolute top-2.5 w-4 h-4 text-text-primary dark:text-text-secondary ${isRtl ? 'right-3' : 'left-3'}`} />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchNotes}
            className={`w-full bg-surface-primary border border-border-primary text-text-primary text-xs rounded-xl py-2.5 focus:outline-none focus:border-indigo-500 transition-colors ${isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
          />
        </div>
        <button 
          onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
          className="w-10 h-10 rounded-xl border border-border-primary bg-surface-primary flex flex-col items-center justify-center text-text-primary dark:text-text-secondary hover:text-slate-900 dark:hover:text-white transition-colors flex-shrink-0"
          title={sortOrder === 'desc' ? t.sortNewest : t.sortOldest}
        >
          <ArrowDownUp className="w-4 h-4" />
        </button>
      </div>

      {errorMsg && (
        <div className="mb-4 bg-red-500/10 border border-red-500/50 rounded-xl p-3 flex items-start gap-2">
          <span className="text-rose-600 dark:text-rose-400 text-xs font-medium leading-relaxed">{errorMsg}</span>
        </div>
      )}

      {/* SMS Fast Parser -> Nashmi SMS Intelligence */}
      <div className="mb-6 bg-gradient-to-r from-indigo-950/40 to-blue-900/20 border border-indigo-500/20 rounded-2xl p-4 md:p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[40px] rounded-full pointer-events-none"></div>
        
        <div className="flex items-center justify-between mb-3 relative z-10">
          <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
            <MessageSquareText className="w-5 h-5" />
            {lang === "ar" ? "نظام Nashmi الذكي للرسائل" : "Nashmi SMS Intelligence"}
            <span className="bg-indigo-500/20 text-indigo-500 dark:text-indigo-300 text-[10px] px-2 py-0.5 rounded-full border border-indigo-500/30 uppercase tracking-wider font-mono shadow-sm">Pro</span>
          </h3>
        </div>
        
        <p className="text-xs text-text-primary dark:text-text-secondary mb-4 leading-relaxed max-w-xl">
          {lang === "ar" 
            ? "يقوم النظام تلقائياً بتحليل رسائل البنوك، استخراج بيانات الدخل والمصروفات، وتحويلها إلى أهداف وتقارير بأمان." 
            : "The system automatically analyzes bank messages, extracts income and expense data, and securely transforms them into goals and reports."}
        </p>

        <div className="flex flex-col gap-3 relative z-10">
          <textarea
            value={smsText}
            onChange={e => setSmsText(e.target.value)}
            placeholder={lang === "ar" ? "الصق رسالة البنك هنا لاستخراج العملية التلقائي (مثال: تم خصم 50 دينار لصالح كريم)..." : "Paste your bank SMS here for auto-extraction (e.g. 50 JOD deducted for Careem)..."}
            className="w-full bg-surface-primary/80 border border-slate-300 dark:border-slate-700/80 rounded-xl p-3 text-sm text-text-primary focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none resize-none transition-all placeholder:text-text-primary dark:text-text-secondary"
            rows={3}
          />
          <button
            onClick={handleParseSms}
            disabled={smsLoading || !smsText.trim()}
            className="w-full sm:w-auto self-end bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] cursor-pointer"
          >
            {smsLoading ? (
              <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <BrainCircuit className="w-4 h-4" />
                {lang === "ar" ? "تحليل واستخراج ذكي" : "Smart Extract & Analyze"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-border-primary rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-surface-primary flex items-center justify-center mb-4">
            <NotebookText className="w-8 h-8 text-text-primary dark:text-text-secondary" />
          </div>
          <p className="text-sm text-text-primary dark:text-text-secondary">{t.emptyNotes}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotes.map(note => (
            <div key={note.id} className="bg-surface-primary border border-border-primary rounded-xl p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all group">
              <div className="flex justify-between items-start mb-2">
                <h3 dir="auto" className="font-bold text-slate-900 dark:text-slate-100 text-sm line-clamp-1 flex-1">{note.title}</h3>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                  <SaveButton itemType="note" itemId={note.id} title={note.title} subtitle={note.content} iconOnly className="p-1.5 rounded-lg hover:bg-bg-secondary" />
                  <button 
                    onClick={() => openEditor(note)}
                    className="p-1.5 text-text-primary dark:text-text-secondary hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-bg-secondary transition-colors shrink-0"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(note.id)}
                    className="p-1.5 text-text-primary dark:text-text-secondary hover:text-rose-600 dark:text-rose-400 rounded-lg hover:bg-bg-secondary transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              
              <p dir="auto" className="text-xs text-text-primary dark:text-text-secondary line-clamp-2 mb-3 leading-relaxed">
                {note.content}
              </p>

              <div className="flex items-center justify-between border-t border-border-primary/60 pt-3">
                <span className="text-[10px] text-text-primary dark:text-text-secondary">
                  {new Date(note.updatedAt).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                
                {onSendToCoach && (
                  <button
                    onClick={() => handleAnalyze(note)}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-1 rounded-md transition-colors"
                  >
                    <BrainCircuit className="w-3 h-3" />
                    {t.analyzeWithAI}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default React.memo(FinancialNotes);

