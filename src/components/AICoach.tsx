import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, BrainCircuit, AlertCircle, Trash2 } from "lucide-react";
import { translations } from "../translations";
import { ChatMessage } from "../types";

interface AICoachProps {
  lang: "ar" | "en";
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  analysis: any;
}

export default function AICoach({ lang, messages, setMessages, analysis }: AICoachProps) {
  const t = translations[lang];
  const isRtl = lang === "ar";
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Suggested direct prompt chips
  const presets = [
    t.presetSaveQuestion,
    t.presetScoreQuestion,
    t.presetLoanQuestion,
  ];

  // Auto Scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsgId = Date.now().toString();
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInput("");
    setLoading(true);

    try {
      // Feed full context in request body
      const payloadMessages = messages.map(m => ({
        role: m.role === "user" ? "user" : "model",
        content: m.content
      }));
      
      // Inject user message to array
      payloadMessages.push({ role: "user", content: textToSend });

      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: payloadMessages,
          language: lang,
          // Feed analytical snapshots to Gemini for custom personalized diagnostics!
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
        content: t.chatGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  };

  // Crude formatting helper to render bold keywords and clean list bullets
  const formatText = (content: string) => {
    return content.split("\n").map((line, i) => {
      let trimmed = line.trim();
      let isBullet = trimmed.startsWith("•") || trimmed.startsWith("-") || /^\d+\./.test(trimmed);
      
      // Replace bold tags
      let formattedText = line;
      const boldRegex = /\*\*(.*?)\*\*/g;
      const matches = [...line.matchAll(boldRegex)];
      
      if (matches.length > 0) {
        // Return structured JSX elements easily
        let parts = [];
        let lastIndex = 0;
        let match;
        boldRegex.lastIndex = 0;
        while ((match = boldRegex.exec(line)) !== null) {
          parts.push(line.substring(lastIndex, match.index));
          parts.push(<strong key={match.index} className="text-indigo-400 font-bold">{match[1]}</strong>);
          lastIndex = boldRegex.lastIndex;
        }
        parts.push(line.substring(lastIndex));
        return (
          <div key={i} className={`min-h-[20px] ${isBullet ? (isRtl ? 'pr-3 border-r-2 border-indigo-500/30' : 'pl-3 border-l-2 border-indigo-500/30') : ''} mb-1.5`}>
            {parts}
          </div>
        );
      }

      return (
        <p key={i} className={`min-h-[16px] mb-1 leading-relaxed ${isBullet ? (isRtl ? 'pr-3 border-r-2 border-indigo-500/20 text-slate-200' : 'pl-3 border-l-2 border-indigo-500/20 text-slate-200') : ''}`}>
          {line}
        </p>
      );
    });
  };

  return (
    <div 
      className="flex-1 flex flex-col h-full overflow-hidden bg-[#020617]"
      style={{ direction: isRtl ? "rtl" : "ltr" }}
    >
      {/* Mini Title bar Header */}
      <div className="p-4 border-b border-slate-850 bg-slate-900/25 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
            <BrainCircuit className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white font-sans">{t.coachTitle}</h3>
            <p className="text-[9px] text-slate-400 tracking-tight font-medium uppercase font-sans">{t.appSubtitle}</p>
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
              className={`flex gap-3 max-w-[85%] ${isUser ? "ms-auto flex-row-reverse" : ""}`}
            >
              {/* Profile Avatar indicator */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                isUser 
                  ? "bg-slate-900 border-slate-800 text-indigo-400" 
                  : "bg-indigo-950/30 border-indigo-500/20 text-indigo-400"
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4.5 h-4.5" />}
              </div>

              {/* Text Bubble */}
              <div className="space-y-1">
                <div className={`p-3.5 rounded-2xl text-[12.5px] shadow-sm leading-relaxed ${
                  isUser 
                    ? "bg-slate-900 text-slate-100 rounded-tr-none border border-slate-850"
                    : "bg-slate-900/50 text-slate-200 border border-slate-800 rounded-tl-none"
                }`}>
                  {formatText(msg.content)}
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
                <span className="text-[11px] text-slate-400 pl-1">{t.coachTyping}</span>
              </div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>      {/* Preset Suggested chips & Input zone */}
      <div className="p-3.5 border-t border-slate-850 bg-slate-950/80 shrink-0 space-y-3.5">
        
        {/* Suggestion prompt chips (only show if chat contains few records) */}
        {messages.length < 5 && (
          <div className="space-y-2.5">
            <span className="text-[9px] text-slate-500 font-mono tracking-wider uppercase block">
              {isRtl ? "نصائح نقر سريعة للحكام:" : "Quick click Q&As:"}
            </span>
            <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(preset)}
                  disabled={loading}
                  className="text-[10px] md:text-[11px] whitespace-nowrap px-3 py-1.5 rounded-xl bg-slate-900/40 hover:bg-slate-900 active:scale-95 text-slate-300 border border-slate-800 hover:border-indigo-500/20 transition-all cursor-pointer shrink-0 text-start font-medium"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Real chat form input */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder={t.askAnythingPlaceholder}
            className="flex-1 h-11 px-4 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/25 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-500 hover:to-blue-600 active:scale-95 text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:pointer-events-none shadow-md shadow-indigo-500/10 cursor-pointer"
          >
            <Send className="w-4.5 h-4.5 text-white transform rtl:-scale-x-100 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
}
