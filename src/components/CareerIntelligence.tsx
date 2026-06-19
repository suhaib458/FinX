import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, BriefcaseBusiness, AlertCircle, Trash2, Mic, MicOff, Paperclip, X } from "lucide-react";
import { translations } from "../translations";
import { ChatMessage } from "../types";
import { auth } from "../lib/firebase";
import Avatar from "./Avatar";

import Markdown from "react-markdown";

interface CareerIntelligenceProps {
  lang: "ar" | "en";
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  analysis: any;
  onAction?: () => void;
}

// Global declaration for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function CareerIntelligence({ lang, messages, setMessages, analysis, onAction }: CareerIntelligenceProps) {
  const t = translations[lang];
  const isRtl = lang === "ar";
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Voice Input State
  const [isListening, setIsListening] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const recognitionRef = useRef<any>(null);

  // File Attachments State
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

// Add default initial message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "greet",
          role: "assistant",
          content: lang === 'ar' ? 'مرحباً! أنا مساعدك المهني الذكي. يرجى إرفاق سيرتك الذاتية أو تفاصيل خبراتك لأقوم بتحليلها واقتراح التحسينات وأفضل الفرص الوظيفية المتاحة.' : 'Hello! I am your AI Career Assistant. Please attach your Resume (CV) or describe your experience, and I will analyze it to provide recommendations and job opportunities.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    }
  }, [lang, messages.length, setMessages]);

  useEffect(() => {
    // Initialize SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setInput((prev) => {
          // If the recognition gives an interim result, we'll just replace the last pending part, 
          // or for simplicity, we just set the whole spoken text if it's new.
          // Due to complexity, let's keep it simple: we set input to transcript for brevity, or append it.
          // Wait, 'continuous=true' appends it. So let's just use final results if possible, or interim.
          return transcript;
        });
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'not-allowed') {
          alert(lang === "ar" ? "يرجى السماح بالوصول إلى الميكروفون لاستخدام ميزة الصوت." : "Microphone permission is required to use voice input.");
        }
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = lang === "ar" ? "ar-SA" : "en-US";
    }
  }, [lang]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setInput(""); // Clear previous input when starting fresh recording
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Auto Scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };
  const VALID_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  const validateAndAddFiles = (filesList: File[]) => {
    const validFiles = filesList.filter(f => {
      if (f.size > MAX_SIZE) {
        alert(lang === 'ar' ? `الملف ${f.name} يتجاوز الحجم المسموح به (5MB)` : `File ${f.name} exceeds max size (5MB)`);
        return false;
      }
      return true; // Optionally enforce VALID_TYPES but File API already filters by accept
    });
    setAttachments(prev => [...prev, ...validFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files) as File[];
      validateAndAddFiles(newFiles);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files) as File[];
      validateAndAddFiles(newFiles);
    }
    // reset input so the same file could be selected again if needed
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });

  const handleSend = async (textToSend: string) => {
    if ((!textToSend.trim() && attachments.length === 0) || loading) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    const userMsgId = Date.now().toString();
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      role: "user",
      content: textToSend + (attachments.length > 0 ? `\n[${attachments.length} attachment(s) included]` : ""),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInput("");
    
    // Store copies of current attachments and clear UI state
    const currentAttachments = [...attachments];
    setAttachments([]);
    setLoading(true);

    try {
      const payloadMessages = messages.map(m => ({
        role: m.role === "user" ? "user" : "model",
        content: m.content
      }));
      
      payloadMessages.push({ role: "user", content: textToSend });

      // Convert attachments to base64
      const processedAttachments = await Promise.all(
        currentAttachments.map(async (f) => {
          const b64 = await toBase64(f);
          return { mimeType: f.type, data: b64, name: f.name };
        })
      );

      const response = await fetch("/api/career-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: payloadMessages,
          language: lang,
          attachments: processedAttachments,
          portfolioDetails: {
            income: analysis.monthlyIncome,
            expenses: analysis.monthlyExpenses,
            savingsRate: analysis.savingsRate,
            healthScore: analysis.healthScore
          }
        }),
      });

      const data = await response.json();
      const coachMsgId = (Date.now() + 1).toString();
      const newResponseMsg: ChatMessage = {
        id: coachMsgId,
        role: "assistant",
        content: data.reply || t.errorCoach,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, newResponseMsg]);
      if (onAction) onAction();
    } catch (err) {
      console.error("AI Coach Fetch error:", err);
      // Fallback response mapping
      const coachMsgId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        {
          id: coachMsgId,
          role: "assistant",
          content: t.errorCoach,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "greet",
        role: "assistant",
        content: lang === 'ar' ? 'مرحباً! قم برفع سيرتك الذاتية (CV)، أو الشهادات، أو وصف وظيفي لمساعدتك في تحليل وضعك المهني.' : 'Hello! Upload your Resume (CV), certificates, or job descriptions so I can analyze your career profile.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex-1 flex flex-col h-full overflow-hidden bg-[#020617] relative ${isRtl ? 'text-right' : 'text-left'}`}
    >
      
      {isDragOver && (
        <div className="absolute inset-0 z-50 bg-indigo-900/40 backdrop-blur-sm border-2 border-dashed border-indigo-400 flex flex-col items-center justify-center pointer-events-none rounded-xl m-2">
          <Sparkles className="w-12 h-12 text-indigo-400 mb-2 animate-pulse" />
          <p className="text-indigo-200 font-bold text-lg">{lang === 'ar' ? 'أفلت الملفات هنا للتحليل' : 'Drop files here to analyze'}</p>
        </div>
      )}

      {/* Mini Title bar Header */}
      <div className="p-4 border-b border-slate-850 bg-slate-900/25 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
            <BriefcaseBusiness className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white font-sans flex items-center gap-1.5">
              {t.careerTitle}
              <span className="bg-indigo-500/20 text-indigo-300 text-[8px] px-1.5 py-0.5 rounded-sm border border-indigo-500/30 font-bold uppercase tracking-wider">Pro</span>
            </h3>
            <p className="text-[8px] text-slate-400 tracking-tight font-medium uppercase font-sans">
              {isRtl ? "متصل بشبكة الوظائف / حد الصوت ١ دقيقة" : "Linked jobs / Max Voice 1 min"}
            </p>
          </div>
        </div>
        <button 
          onClick={clearChat}
          title="Clear Conversation"
          className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main scrolling Chat container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div 
              key={msg.id} 
              className={`flex gap-3 max-w-[85%] ${isUser ? "ms-auto" : ""}`}
            >
              {/* Profile Avatar indicator */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                isUser 
                  ? "bg-slate-900 border-none text-indigo-400" 
                  : "bg-indigo-950/30 border-indigo-500/20 text-indigo-400"
              }`}>
                {isUser && auth.currentUser ? (
                  <Avatar uid={auth.currentUser.uid} className="w-8 h-8" iconClassName="w-4 h-4" />
                ) : isUser ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4.5 h-4.5" />
                )}
              </div>

              {/* Text Bubble */}
              <div className="space-y-1">
                <div className={`p-3.5 rounded-2xl text-[12.5px] shadow-sm leading-relaxed ${
                  isUser 
                    ? "bg-slate-900 text-slate-100 rounded-tr-none border border-slate-850"
                    : "bg-slate-900/50 text-slate-200 border border-slate-800 rounded-tl-none"
                }`}>
                  <div className="markdown-body career-chat-md">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                </div>
                <span className={`text-[8.5px] text-slate-500 block ${isUser ? "text-start" : "text-end"}`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {loading && (
          <div className={`flex gap-3 max-w-[85%] ${isRtl ? "" : ""}`}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border bg-indigo-950/30 border-indigo-500/20 text-indigo-400">
              <Bot className="w-4.5 h-4.5 animate-spin" />
            </div>
            <div className="p-3.5 rounded-2xl text-xs bg-slate-900/50 border border-slate-800 rounded-tl-none text-indigo-400 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                <span className="text-[11px] text-slate-400 pl-1">{t.uploadingPhoto}</span>
              </div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>
      
      {/* Input zone */}
      <div className="p-3.5 border-t border-slate-850 bg-slate-950/80 shrink-0 space-y-3.5">

        
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {attachments.map((file, idx) => {
              const isImage = file.type.startsWith('image/');
              return (
                <div key={idx} className="relative flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-[10px] text-slate-300 group">
                  {isImage ? (
                    <img src={URL.createObjectURL(file)} alt="preview" className="w-6 h-6 object-cover rounded" />
                  ) : (
                    <Paperclip className="w-3 h-3 text-indigo-400" />
                  )}
                  <span className="truncate max-w-[120px] font-medium text-slate-200">{file.name}</span>
                  <button onClick={() => removeAttachment(idx)} className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer bg-slate-800/80 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Real chat form input */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex items-center gap-2 relative"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            multiple 
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          />
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            className="w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/40 transition-colors cursor-pointer"
          >
            <Paperclip className="w-4.5 h-4.5" />
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder={isListening ? (isRtl ? "جاري الاستماع..." : "Listening...") : t.askAnythingPlaceholder}
            className={`flex-1 h-11 px-4 text-xs rounded-xl bg-slate-950 border text-slate-100 placeholder-slate-500 focus:outline-none transition-all ${isListening ? 'border-red-500/50 bg-red-500/5 focus:border-red-500/50' : 'border-slate-800 focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/25'}`}
          />
          
          <button
            type="button"
            onClick={toggleListening}
            className={`w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-xl border transition-colors cursor-pointer ${isListening ? 'bg-red-500/20 border-red-500/40 text-red-400 animate-pulse' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/40'}`}
          >
            {isListening ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
          </button>

          <button
            type="submit"
            disabled={(!input.trim() && attachments.length === 0) || loading}
            className="w-11 h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-500 hover:to-blue-600 active:scale-95 text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:pointer-events-none shadow-md shadow-indigo-500/10 cursor-pointer flex-shrink-0"
          >
            <Send className={`w-4.5 h-4.5 text-white transition-transform ${isRtl ? '-scale-x-100' : ''}`} />
          </button>
        </form>
      </div>
    </div>
  );
}
