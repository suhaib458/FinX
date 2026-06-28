import React, { useState, useEffect, useMemo, useRef } from "react";
import { Search, Loader2, Briefcase, FileText, PieChart, Target, Rocket, ArrowRight, X, History, Sparkles } from "lucide-react";
import { collection, query, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { getProjects } from "../lib/projects";
import SaveButton from "./SaveButton";
import { User } from "firebase/auth";
import { translations } from "../translations";

interface SearchTabProps {
  lang: "ar" | "en";
  user: User;
  setActiveTab: (tab: any) => void;
}

export default function SearchTab({ lang, user, setActiveTab }: SearchTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any>({
    notes: [],
    projects: [],
    jobs: [], // mock for now
    finance: [] // mock for now
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const t = translations[lang];
  const isRtl = lang === "ar";

  useEffect(() => {
    const savedSearches = localStorage.getItem(`finx_recent_searches_${user.uid}`);
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, [user.uid]);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem(`finx_recent_searches_${user.uid}`, JSON.stringify(updated));
  };

  const handleSearch = async (queryStr: string) => {
    setSearchTerm(queryStr);
    if (!queryStr.trim()) {
      setResults({ notes: [], projects: [], jobs: [], finance: [] });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    try {
      // 1. Search Notes (Mocked local search of firestore usually, but let's fetch all and filter for demo)
      const qNotes = query(collection(db, "users", user.uid, "notes"), orderBy("createdAt", "desc"), limit(20));
      const noteDocs = await getDocs(qNotes);
      const notes = noteDocs.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
      const matchedNotes = notes.filter(n => n.title?.toLowerCase().includes(queryStr.toLowerCase()) || n.content?.toLowerCase().includes(queryStr.toLowerCase()));

      // Mocked Jobs
      const mockJobs = [
        { id: "j1", title: "Senior UI Developer", company: "TechHub Jordan", location: "Amman" },
        { id: "j2", title: "Financial Analyst", company: "Arab Bank", location: "Amman" },
        { id: "j3", title: "Product Manager", company: "StartupX", location: "Remote" }
      ];
      const matchedJobs = mockJobs.filter(j => j.title.toLowerCase().includes(queryStr.toLowerCase()) || j.company.toLowerCase().includes(queryStr.toLowerCase()));

      // Actual Projects from Firestore
      const allProjects = await getProjects();
      const matchedProjects = allProjects.filter(p => p.name.toLowerCase().includes(queryStr.toLowerCase()) || (p.summary && p.summary.toLowerCase().includes(queryStr.toLowerCase())) || (p.problem && p.problem.toLowerCase().includes(queryStr.toLowerCase())) || (p.founderName && p.founderName.toLowerCase().includes(queryStr.toLowerCase())));

      setResults({
        notes: matchedNotes,
        projects: matchedProjects.map(p => ({ id: p.id, title: p.name, desc: p.summary || p.problem, company: p.founderName })),
        jobs: matchedJobs,
        finance: []
      });
      
    } catch(err) {
      console.warn("Search error", err);
    } finally {
      setIsSearching(false);
    }
  };

  const executeSearch = (term: string) => {
    saveRecentSearch(term);
    handleSearch(term);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      executeSearch(searchTerm);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setResults({ notes: [], projects: [], jobs: [], finance: [] });
    searchInputRef.current?.focus();
  };

  const renderSection = (title: string, items: any[], type: string, icon: any) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3 flex items-center gap-2">
          {icon}
          {title}
          <span className="bg-border-primary text-text-secondary px-2 py-0.5 rounded-full text-[10px]">
            {items.length}
          </span>
        </h3>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div 
              key={i} 
              onClick={() => {
                if (type === 'note') setActiveTab('notes');
                if (type === 'project') setActiveTab('projects');
              }}
              className="group p-3 rounded-xl bg-surface-primary border border-border-primary hover:border-indigo-500/30 shadow-sm cursor-pointer transition-all flex items-center justify-between"
            >
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {item.title}
                </h4>
                {(item.company || item.desc || item.content) && (
                  <p className="text-xs text-text-secondary mt-1 line-clamp-1">
                    {item.company || item.desc || item.content}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <SaveButton itemType={type as any} itemId={item.id} title={item.title} subtitle={item.company || item.desc || item.content} iconOnly className="p-1.5 rounded-lg hover:bg-bg-secondary" />
                <ArrowRight className={`w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors ${isRtl ? 'rotate-180' : ''}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const hasResults = Object.values(results).some((arr: any) => arr.length > 0);

  return (
    <div className={`flex flex-col h-full bg-[#F7F8FA] dark:bg-transparent ${isRtl ? 'text-right' : 'text-left'}`}>
      {/* Search Header */}
      <div className="p-4 bg-surface-primary border-b border-border-primary shrink-0">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-4 rtl:pr-4 flex items-center pointer-events-none">
            {isSearching ? (
              <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-text-secondary group-focus-within:text-indigo-500 transition-colors" />
            )}
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRtl ? "البحث في الوظائف، المشاريع، والملاحظات..." : "Search jobs, projects, notes..."}
            className="block w-full bg-bg-secondary border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 rounded-2xl py-3 pl-12 pr-10 rtl:pl-10 rtl:pr-12 text-sm text-text-primary transition-all shadow-sm placeholder-slate-400"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 pr-3 rtl:pl-3 flex items-center text-text-secondary hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                <X className="w-3.5 h-3.5" />
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 relative">
        {/* Empty State / Suggestions */}
        {!searchTerm && (
          <div className="max-w-md mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                  <History className="w-4 h-4" />
                  {isRtl ? "عمليات البحث الأخيرة" : "Recent Searches"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term, i) => (
                    <button
                      key={i}
                      onClick={() => executeSearch(term)}
                      className="px-3 py-1.5 rounded-full bg-surface-primary border border-border-primary text-sm font-medium text-text-secondary hover:border-indigo-500/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-sm"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Smart Suggestions */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                {isRtl ? "مقترحات البحث" : "Suggested searches"}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {["Software Engineer", "FinTech", "Marketing ROI", "Data Analyst"].map((term, i) => (
                  <button
                    key={i}
                    onClick={() => executeSearch(term)}
                    className="p-3 rounded-xl bg-surface-primary border border-border-primary hover:border-indigo-500/50 hover:shadow-md transition-all text-sm font-medium text-text-primary text-start flex items-center justify-between group"
                  >
                    <span>{term}</span>
                    <ArrowRight className={`w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-500 transition-colors ${isRtl ? 'rotate-180' : ''}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchTerm && (
          <div className="animate-in fade-in duration-300">
            {hasResults ? (
              <div className="space-y-2">
                {renderSection(t.jobsResults || "Jobs", results.jobs, "job", <Briefcase className="w-4 h-4" />)}
                {renderSection(t.projectsResults || "Projects", results.projects, "project", <Rocket className="w-4 h-4" />)}
                {renderSection(t.notesResults || "Notes", results.notes, "note", <FileText className="w-4 h-4" />)}
                {renderSection(t.financeResults || "Financial Insights", results.finance, "finance", <PieChart className="w-4 h-4" />)}
              </div>
            ) : !isSearching ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="w-20 h-20 bg-bg-secondary rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">{t.noSearchResults}</h3>
                <p className="text-sm text-text-secondary">
                  {isRtl ? "حاول البحث بكلمات مختلفة أو إملائية أخرى" : "Try searching with different keywords or spelling"}
                </p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
