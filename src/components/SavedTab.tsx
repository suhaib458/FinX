import React, { useState, useEffect } from "react";
import { Bookmark, Search, Briefcase, Rocket, FileText, PieChart, Target, Pin, Trash2, Folder as FolderIcon } from "lucide-react";
import { SavedService, SavedItem } from "../lib/saved";
import { User } from "firebase/auth";
import { translations } from "../translations";

interface SavedTabProps {
  lang: "ar" | "en";
  user: User;
}

export default function SavedTab({ lang, user }: SavedTabProps) {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const t = translations[lang];
  const isRtl = lang === "ar";

  useEffect(() => {
    const unsub = SavedService.subscribeToSavedItems(user.uid, (data) => {
      setItems(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user.uid]);

  const handleTogglePin = async (id: string, current: boolean) => {
    await SavedService.togglePin(id, current);
  };

  const handleDelete = async (id: string) => {
    await SavedService.deleteSavedItem(id);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "job": return <Briefcase className="w-5 h-5 text-blue-500" />;
      case "project": return <Rocket className="w-5 h-5 text-indigo-500" />;
      case "note": return <FileText className="w-5 h-5 text-amber-500" />;
      case "finance": return <PieChart className="w-5 h-5 text-emerald-500" />;
      case "interview": return <Target className="w-5 h-5 text-rose-500" />;
      default: return <Bookmark className="w-5 h-5 text-text-secondary" />;
    }
  };

  const getTypeLabel = (type: string) => {
    if (type === "job") return t.jobsResults || "Job";
    if (type === "project") return t.projectsResults || "Project";
    if (type === "note") return t.notesResults || "Note";
    if (type === "finance") return t.financeResults || "Finance";
    if (type === "interview") return t.interviewsResults || "Interview";
    return type;
  };

  const filteredItems = items
    .filter(item => filterType === "all" || item.itemType === filterType)
    .filter(item => 
      searchTerm === "" || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (item.subtitle && item.subtitle.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      // Pinned items first
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
    });

  return (
    <div className={`flex flex-col h-full bg-[#F7F8FA] dark:bg-transparent ${isRtl ? 'text-right' : 'text-left'}`}>
      <div className="p-4 bg-surface-primary border-b border-border-primary shrink-0 shadow-sm z-10">
        <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          {t.savedItems}
        </h2>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pr-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-text-secondary" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 rtl:pr-10 rtl:pl-4 bg-bg-secondary border-transparent rounded-xl py-2 text-sm focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 text-text-primary transition-all"
            placeholder={isRtl ? "البحث في المحفوظات..." : "Search saved items..."}
          />
        </div>
        
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide no-scrollbar -mx-2 px-2">
          {["all", "job", "project", "note", "finance", "interview"].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                filterType === type 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" 
                  : "bg-bg-secondary text-text-secondary hover:bg-bg-secondary"
              }`}
            >
              {type === "all" ? t.allResults : getTypeLabel(type)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4 text-text-secondary">
            <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-sm animate-pulse">{isRtl ? "جاري التحميل..." : "Loading saved items..."}</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4 text-text-secondary">
            <div className="w-16 h-16 bg-bg-secondary rounded-full flex items-center justify-center">
              <FolderIcon className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-sm font-medium">{t.noSavedItems}</p>
          </div>
        ) : (
          filteredItems.map(item => (
            <div 
              key={item.id} 
              className="group relative bg-surface-primary border border-border-primary rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-indigo-500/30 transition-all flex gap-4 overflow-hidden"
            >
              {item.pinned && (
                <div className="absolute top-0 right-0 rtl:right-auto rtl:left-0 border-[16px] border-transparent border-t-amber-500 border-r-amber-500 rtl:border-r-transparent rtl:border-l-amber-500 rtl:-scale-x-100 opacity-90 h-0 w-0">
                  <Pin className="absolute -top-3.5 -right-3 w-3 h-3 text-white stroke-[3] -rotate-45" />
                </div>
              )}
              
              <div className="w-12 h-12 shrink-0 rounded-xl bg-bg-secondary border border-border-primary flex items-center justify-center mt-1">
                {getIcon(item.itemType)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-bg-secondary text-text-secondary uppercase tracking-wide">
                    {getTypeLabel(item.itemType)}
                  </span>
                  <span className="text-[10px] text-text-secondary">
                    {new Date(item.savedAt).toLocaleDateString(lang === 'ar' ? 'ar-JO' : 'en-US')}
                  </span>
                </div>
                
                <h3 className="font-bold text-text-primary leading-snug truncate pr-4">
                  {item.title}
                </h3>
                
                {item.subtitle && (
                  <p className="text-sm text-text-secondary mt-1 line-clamp-2 leading-relaxed pr-2">
                    {item.subtitle}
                  </p>
                )}
                
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border-primary/50">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleTogglePin(item.id, item.pinned); }}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 -ml-2 rounded-lg transition-colors ${item.pinned ? 'text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-500/10' : 'text-text-secondary hover:bg-bg-secondary'}`}
                  >
                    <Pin className={`w-3.5 h-3.5 ${item.pinned ? 'fill-current' : ''}`} />
                    {item.pinned ? (isRtl ? "مثبت" : "Pinned") : (isRtl ? "تثبيت" : "Pin")}
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                    className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-lg text-text-secondary hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors ml-auto rtl:ml-0 rtl:mr-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {isRtl ? "إزالة" : "Remove"}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
