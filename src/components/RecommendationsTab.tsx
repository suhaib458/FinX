import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { 
  Sparkles, 
  Lightbulb, 
  X, 
  Pin, 
  ArrowRight, 
  Loader2,
  RefreshCw,
  Zap,
  Target,
  Briefcase,
  PieChart
} from "lucide-react";
import { RecommendationsService, Recommendation } from "../lib/recommendations";
import { translations } from "../translations";

interface RecommendationsTabProps {
  lang: "ar" | "en";
  user: User;
  userRole?: string | null;
  setActiveTab: (tab: any) => void;
}

export default function RecommendationsTab({ lang, user, userRole, setActiveTab }: RecommendationsTabProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const t = translations[lang];
  const isRtl = lang === "ar";
  
  const fetchRecommendations = async () => {
    setLoading(true);
    let data = await RecommendationsService.getRecommendations(user.uid);
    
    // Automatically generate if empty
    if (data.length === 0) {
      setGenerating(true);
      const newItems = await RecommendationsService.generateSmartRecommendations(user.uid, userRole || null);
      data = newItems;
      setGenerating(false);
    }
    
    setRecommendations(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRecommendations();
  }, [user.uid]);

  const handleGenerate = async () => {
    setGenerating(true);
    const newItems = await RecommendationsService.generateSmartRecommendations(user.uid, userRole || null);
    setRecommendations(prev => {
      const merged = [...newItems, ...prev];
      // remove dups by ID
      return merged.filter((item, index, self) => index === self.findIndex((t) => t.id === item.id));
    });
    setGenerating(false);
  };

  const handleDismiss = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setRecommendations(prev => prev.filter(r => r.id !== id));
    await RecommendationsService.dismiss(user.uid, id);
  };

  const handleTogglePin = async (e: React.MouseEvent, id: string, pinned: boolean) => {
    e.stopPropagation();
    setRecommendations(prev => prev.map(r => r.id === id ? { ...r, pinned: !pinned } : r));
    await RecommendationsService.togglePin(user.uid, id, pinned);
  };

  const getIcon = (type: string) => {
    switch(type) {
      case "career": return <Briefcase className="w-4 h-4 text-amber-500" />;
      case "finance": return <PieChart className="w-4 h-4 text-emerald-500" />;
      case "project": return <Target className="w-4 h-4 text-indigo-500" />;
      case "productivity": return <Zap className="w-4 h-4 text-rose-500" />;
      default: return <Lightbulb className="w-4 h-4 text-text-secondary" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const map: Record<string, {ar: string; en: string}> = {
      career: { ar: "مهني", en: "Career" },
      finance: { ar: "مالي", en: "Finance" },
      project: { ar: "مشاريع", en: "Project" },
      productivity: { ar: "إنتاجية", en: "Productivity" }
    };
    return map[type] ? (isRtl ? map[type].ar : map[type].en) : type;
  };

  const sortedRecs = [...recommendations].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    const priorityScore = { high: 3, medium: 2, low: 1 };
    return priorityScore[b.priority] - priorityScore[a.priority];
  });

  return (
    <div className={`flex flex-col h-full bg-[#F7F8FA] dark:bg-transparent ${isRtl ? 'text-right' : 'text-left'}`}>
      <div className="p-4 bg-surface-primary border-b border-border-primary flex justify-between items-center shadow-sm z-10 shrink-0">
        <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-500" />
          {t.recommendations || "Smart Recommendations"}
        </h2>
        <button 
          onClick={handleGenerate}
          disabled={generating}
          className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-full hover:bg-indigo-100 disabled:opacity-50 transition-colors"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-text-secondary">
            <Loader2 className="w-6 h-6 animate-spin mb-2" />
            <span className="text-sm">{isRtl ? "جاري التحميل..." : "Loading recommendations..."}</span>
          </div>
        ) : sortedRecs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-text-secondary">
            <div className="w-16 h-16 bg-bg-secondary rounded-full flex items-center justify-center mb-4">
              <Lightbulb className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-sm font-medium">{isRtl ? "لا توجد توصيات جديدة." : "No new recommendations."}</p>
            <p className="text-xs text-text-secondary mt-1 max-w-[250px]">{isRtl ? "يقوم الذكاء الاصطناعي بمراقبة حسابك وسيقترح عليك الإجراءات الهامة مستقبلاً." : "The AI engine monitors your account and will suggest proactive actions here."}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedRecs.map(rec => (
              <div 
                key={rec.id}
                onClick={() => setActiveTab(rec.actionTarget)}
                className="group relative bg-surface-primary border border-border-primary rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-indigo-500/40 cursor-pointer overflow-hidden transition-all"
              >
                {/* Priority Glow */}
                {rec.priority === "high" && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
                )}

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                       <div className="w-8 h-8 rounded-full bg-bg-secondary flex items-center justify-center border border-border-primary">
                         {getIcon(rec.type)}
                       </div>
                       <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                         {getTypeLabel(rec.type)}
                       </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {rec.priority === "high" && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-50 text-rose-600 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-900/30">
                          {isRtl ? "عاجل" : "High Priority"}
                        </span>
                      )}
                      {rec.pinned && (
                         <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                      )}
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-text-primary mb-1.5 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {rec.title}
                  </h3>
                  
                  <p className="text-xs text-text-secondary leading-relaxed mb-4">
                    {rec.reason}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-border-primary/50">
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                      {isRtl ? "اتخاذ إجراء" : "Take Action"}
                      <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                    </span>

                    <div className="flex items-center gap-1">
                      <button 
                        onClick={(e) => handleTogglePin(e, rec.id, rec.pinned)}
                        className="p-1.5 text-text-secondary hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors"
                        title={isRtl ? "تثبيت" : "Pin"}
                      >
                         <Pin className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => handleDismiss(e, rec.id)}
                        className="p-1.5 text-text-secondary hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                        title={isRtl ? "تجاهل" : "Dismiss"}
                      >
                         <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
