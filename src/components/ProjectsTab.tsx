import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  TrendingUp, 
  Plus, 
  Briefcase, 
  FileText, 
  Target,
  BarChart4,
  Users,
  Banknote,
  Activity,
  ArrowRight,
  PieChart,
  Eye,
  MessageSquare,
  Globe,
  MapPin,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Bookmark,
  Loader2,
  X,
  Trash2
} from "lucide-react";
import SaveButton from "./SaveButton";
import { getProjects, getOwnerProjects, createProject, Project, createInvestmentRequest, InvestmentRequest, getOwnerRequests, getInvestorRequests, updateInvestmentRequest, deleteProject } from "../lib/projects";

interface ProjectsTabProps {
  lang: "ar" | "en";
  user: any;
  setActiveTab?: (tab: any) => void;
}

export default function ProjectsTab({ lang, user, setActiveTab }: ProjectsTabProps) {
  const isRtl = lang === "ar";
  const [role, setRole] = useState<"owner" | "investor">("investor");
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeRequestDetail, setActiveRequestDetail] = useState<InvestmentRequest | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [activeChatRequest, setActiveChatRequest] = useState<InvestmentRequest | null>(null);
  const [chatSessions, setChatSessions] = useState<Record<string, {id: string, text: string, senderId: string, timestamp: Date}[]>>({});
  const [chatInput, setChatInput] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeMessages = activeChatRequest ? chatSessions[activeChatRequest.id || ""] || [] : [];
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [ownerProjects, setOwnerProjects] = useState<Project[]>([]);
  const [ownerRequests, setOwnerRequests] = useState<InvestmentRequest[]>([]);
  const [investorRequests, setInvestorRequests] = useState<InvestmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [updatingRequestId, setUpdatingRequestId] = useState<string | null>(null);
  const [investing, setInvesting] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmReject, setConfirmReject] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "قطاع التكنولوجيا",
    stage: "Idea",
    fundingNeeded: "",
    expectedReturn: "",
    problem: "",
    solution: "",
    audience: "",
    marketSize: "",
    location: "",
    timeline: "",
    summary: ""
  });

  useEffect(() => {
    if (activeChatRequest) {
      const chatId = activeChatRequest.id || "";
      if (!chatSessions[chatId]) {
        setChatSessions(prev => ({
          ...prev,
          [chatId]: [
            {
              id: "initial",
              text: activeChatRequest.message,
              senderId: activeChatRequest.investorId,
              timestamp: new Date()
            }
          ]
        }));
      }
      setChatInput("");
    }
  }, [activeChatRequest]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeMessages, activeChatRequest]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !user || !activeChatRequest || sendingMsg) return;
    setSendingMsg(true);
    
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newMsg = {
      id: Date.now().toString(),
      text: chatInput.trim(),
      senderId: user.uid,
      timestamp: new Date()
    };
    
    const chatId = activeChatRequest.id || "";
    setChatSessions(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), newMsg]
    }));
    
    setChatInput("");
    setSendingMsg(false);
  };

  useEffect(() => {
    loadData();
  }, [user?.uid, role]);

  const loadData = async () => {
    setLoading(true);
    if (role === "investor") {
      const projs = await getProjects();
      setProjects(projs);
      if (user?.uid) {
        const invReqs = await getInvestorRequests(user.uid);
        setInvestorRequests(invReqs);
      }
    } else {
      if (user?.uid) {
        const myProjs = await getOwnerProjects(user.uid);
        const myRequests = await getOwnerRequests(user.uid);
        setOwnerProjects(myProjs);
        setOwnerRequests(myRequests);
      }
    }
    setLoading(false);
  };

  // Translations
  
  const formatCurrency = (val: number) => `${val.toLocaleString()} JD`;
  
  
  const getStatusText = (status: string) => {
    if (status === 'accepted') return 'مقبول';
    if (status === 'declined') return 'مرفوض';
    return 'قيد المراجعة';
  };

  const getProgress = (proj: Project) => {
    if (proj.moneyReceived && proj.moneyReceived > 0 && proj.fundingNeeded) {
      return Math.min(Math.round((proj.moneyReceived / proj.fundingNeeded) * 100), 100);
    }
    const hash = proj.id ? proj.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
    return 25 + (hash % 60);
  };

  const translateCategory = (cat: string) => {
    const map: Record<string, string> = { "Fintech": "تقنية مالية", "Remote": "عن بعد" };
    return map[cat] || cat;
  };
  
  const translateStage = (stage: string) => {
    const map: Record<string, string> = { "Idea": "فكرة", "Prototype": "نموذج أولي", "In progress": "قيد التنفيذ", "Seeking funding": "يبحث عن تمويل" };
    return map[stage] || stage;
  };

  const t = {
    ownerRole: isRtl ? "صاحب مشروع" : "Founder",
    investorRole: isRtl ? "مستثمر" : "Investor",
    myProjects: isRtl ? "مشاريعي" : "My Projects",
    discover: isRtl ? "اكتشف المشاريع" : "Discover Projects",
    createProject: isRtl ? "إطلاق مشروع جديد" : "Launch New Project",
    viewDetails: isRtl ? "التفاصيل بالكامل" : "View Full Pitch",
    contactFounder: isRtl ? "تواصل مع المؤسس" : "Contact Founder",
    fundingNeeded: isRtl ? "التمويل المطلوب" : "Funding Needed",
    expectedReturn: isRtl ? "العائد المتوقع" : "Expected Return",
    riskLevel: isRtl ? "آفاق المخاطرة" : "Risk Level",
    stage: isRtl ? "مرحلة المشروع" : "Stage",
    location: isRtl ? "المنطقة" : "Location",
    backToList: isRtl ? "العودة للقائمة" : "Back to List",
    financialTracking: isRtl ? "الحركة المالية والإحصائيات" : "Financial Tracking",
    problem: isRtl ? "المشكلة" : "Problem",
    solution: isRtl ? "الحل" : "Solution",
    marketSize: isRtl ? "حجم السوق" : "Market Size",
    audience: isRtl ? "الجمهور المستهدف" : "Target Audience",
  };

  const handleCreateSubmit = async () => {
    if (!user || submitting) return;
    setSubmitting(true);
    
    const newProject: Omit<Project, 'id' | 'createdAt'> = {
      name: formData.name,
      founderId: user.uid,
      founderName: user.displayName || user.email?.split('@')[0] || "Unknown Founder",
      category: formData.category,
      stage: formData.stage,
      fundingNeeded: Number(formData.fundingNeeded) || 0,
      moneyReceived: 0,
      expectedReturn: formData.expectedReturn,
      problem: formData.problem,
      solution: formData.solution,
      audience: formData.audience,
      marketSize: formData.marketSize,
      riskLevel: "Medium",
      timeline: formData.timeline || "6 months",
      location: formData.location || "Remote",
      summary: formData.summary,
      status: "active"
    };

    const id = await createProject(newProject);
    if (id) {
      setToastMsg("Project created successfully!");
      setShowCreate(false);
      loadData();
      
      // Reset form
      setFormData({
        name: "",
        category: "قطاع التكنولوجيا",
        stage: "Idea",
        fundingNeeded: "",
        expectedReturn: "",
        problem: "",
        solution: "",
        audience: "",
        marketSize: "",
        location: "",
        timeline: "",
        summary: ""
      });
      setAttachments([]);
    } else {
      setToastMsg("Failed to create project");
    }
    
    setSubmitting(false);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleInvest = async () => {
    if (!user || !activeProject || investing) return;
    
    // Check for duplicate request
    if (investorRequests.some(r => r.projectId === activeProject.id)) {
      setToastMsg(isRtl ? "لقد قمت بإرسال طلب استثمار مسبقاً لهذا المشروع" : "You have already sent an investment request for this project");
      setTimeout(() => setToastMsg(""), 3000);
      return;
    }

    setInvesting(true);
    
    const reqData: Omit<InvestmentRequest, 'id' | 'createdAt'> = {
      projectId: activeProject.id!,
      projectName: activeProject.name,
      investorId: user.uid,
      investorName: user.displayName || user.email?.split('@')[0] || "Unknown Investor",
      founderId: activeProject.founderId,
      message: "أنا مهتم بمناقشة الاستثمار في مشروعكم.",
      status: "pending"
    };
    
    const ok = await createInvestmentRequest(reqData);
    if (ok) {
      setToastMsg(isRtl ? "تم إرسال طلب الاستثمار بنجاح!" : "Investment request sent successfully!");
    } else {
      setToastMsg(isRtl ? "حدث خطأ أثناء الإرسال" : "Failed to send request.");
    }
    
    setInvesting(false);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleDeleteProject = async (projectId: string) => {
    setDeletingProjectId(projectId);
    const success = await deleteProject(projectId);
    if (success) {
      setOwnerProjects(prev => prev.filter(p => p.id !== projectId));
      setToastMsg(isRtl ? "تم حذف المشروع بنجاح" : "Project deleted successfully");
      setTimeout(() => setToastMsg(""), 3000);
    } else {
      setToastMsg(isRtl ? "حدث خطأ أثناء الحذف" : "Error deleting project");
      setTimeout(() => setToastMsg(""), 3000);
    }
    setDeletingProjectId(null);
    setConfirmDelete(null);
  };

  const renderInvestorView = () => {
    return (
      <div className="flex flex-col space-y-8">
        
        {/* Unified Hero Section */}
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex justify-center sm:justify-end">
            <div className="flex bg-slate-200/50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/50 p-1.5 rounded-2xl w-full max-w-[320px] shrink-0 shadow-inner">
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setRole("investor");
                }}
                className={`flex-1 sm:w-36 py-2.5 rounded-[12px] text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${role === 'investor' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-text-secondary hover:text-text-primary dark:hover:text-slate-200'}`}
              >
                {t.investorRole}
              </button>
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setRole("owner");
                }}
                className={`flex-1 sm:w-36 py-2.5 rounded-[12px] text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${role === 'owner' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-text-secondary hover:text-text-primary dark:hover:text-slate-200'}`}
              >
                {t.ownerRole}
              </button>
            </div>

        </div>
        
        {/* Hero Heading & Description */}
          <div className="mt-4">
            <h2 className="text-3xl sm:text-4xl font-black text-text-primary leading-tight mb-3">
              {isRtl ? "فرص استثمارية واعدة" : "Promising Investment Opportunities"}
            </h2>
            <p className="text-base sm:text-lg text-text-secondary max-w-2xl leading-relaxed">
              {isRtl ? "تصفح المشاريع الناشئة وتواصل مع المؤسسين المتميزين." : "Browse emerging startups and connect with founders."}
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="w-full">
          <div className="flex items-center gap-3 overflow-x-auto pb-4 pt-2 w-full scrollbar-hide snap-x flex-nowrap" dir={isRtl ? 'rtl' : 'ltr'}>
            {["الكل", "تقنية مالية", "قطاع التكنولوجيا", "القطاع الزراعي", "القطاع الصناعي", "القطاع الاقتصادي"].map((tag) => (
              <button 
                key={tag} 
                onClick={() => setActiveCategory(tag)}
                className={`shrink-0 snap-start px-6 py-3 h-12 rounded-full text-sm font-bold border-2 transition-all whitespace-nowrap ${activeCategory === tag ? "bg-indigo-600 border-indigo-600 text-white shadow-md" : "bg-surface-primary border-border-primary text-text-secondary hover:border-indigo-400"}`}>
                {tag}
              </button>
            ))}
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 bg-bg-primary/50 border border-dashed border-border-primary rounded-3xl text-center shrink-0 min-h-[300px] w-full mt-6">
            <div className="w-16 h-16 bg-surface-primary shadow-sm border border-border-primary rounded-2xl flex items-center justify-center mb-6">
               <Briefcase className="w-8 h-8 text-indigo-500" />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">
              {isRtl ? "لا توجد مشاريع متاحة حالياً" : "No projects available currently"}
            </h3>
            <p className="text-sm text-text-secondary max-w-sm mx-auto mb-6">
              {isRtl 
                ? "ابدأ بتصفح منصتنا للحصول على رؤى استثمارية أو سجل ليتم إشعارك عند إضافة مشروع جديد."
                : "Check back later to discover new projects and promising opportunities, or get notified when new projects arrive."}
            </p>
            <button 
              onClick={() => {}}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20 text-sm font-medium transition-all"
            >
              {isRtl ? "تفعيل الإشعارات" : "Notify Me"}
            </button>
          </div>
        ) : (
          <div className="flex overflow-x-auto snap-x snap-mandatory pb-8 pt-4 gap-4 scrollbar-hide px-4 -mx-4 shrink-0">
            {projects.filter(p => activeCategory === "الكل" || p.category === activeCategory).map(proj => {
              const pct = getProgress(proj);
              return (
              <div key={proj.id} className="flex flex-col shrink-0 snap-center w-[80vw] max-w-[340px] bg-surface-primary border border-border-primary/80 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:border-indigo-500/30 transition-all duration-300 relative">
                <div className="h-48 bg-slate-100 dark:bg-slate-900 relative group cursor-pointer shrink-0 overflow-hidden" onClick={() => setActiveProject(proj)}>
                   <img src={`https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&q=80&auto=format&fit=crop`} alt={proj.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 z-10" />
                   <div className="absolute bottom-4 left-5 right-5 z-20 flex flex-wrap justify-between items-end gap-2">
                     <div className="flex flex-wrap gap-2">
                       <span className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-[11px] font-bold tracking-wide border border-white/20">
                         {translateCategory(proj.category)}
                       </span>
                       <span className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-[11px] font-bold tracking-wide border border-white/20 flex items-center gap-1">
                         <MapPin className="w-3.5 h-3.5" />
                         {translateCategory(proj.location)}
                       </span>
                     </div>
                     <span className="inline-block px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-md text-emerald-100 text-[11px] font-bold shadow-sm">
                       {translateStage(proj.stage)}
                     </span>
                   </div>
                </div>

                <div className="p-5 sm:p-6 flex flex-col flex-1">
                  <div className="mb-3">
                     <h3 className="text-xl font-black text-text-primary leading-tight hover:text-indigo-500 transition-colors cursor-pointer line-clamp-2" onClick={() => setActiveProject(proj)}>{proj.name}</h3>
                     <p className="text-sm text-text-secondary flex items-center gap-1.5 mt-2">
                       <Briefcase className="w-4 h-4 shrink-0" />
                       <span className="font-medium truncate">{proj.founderName}</span>
                     </p>
                  </div>

                  <div className="mt-auto flex flex-col gap-5 pt-4">
                    <div className="space-y-2">
                       <div className="flex justify-between items-end mb-1">
                          <span className="text-sm font-bold text-text-primary">{isRtl ? "نسبة التمويل" : "Funding Progress"}</span>
                          <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
                            {pct}%
                          </span>
                       </div>
                       <div className="h-2.5 w-full bg-bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }}></div>
                       </div>
                    </div>

                    <div className="pt-2 border-t border-border-primary/80">
                      <button onClick={() => setActiveProject(proj)} className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white text-base font-bold rounded-2xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 active:scale-[0.98]">
                        <span>{t.viewDetails}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}

        {investorRequests.length > 0 && (
          <div className="pt-8 mt-6 px-2 border-t border-border-primary/80">
            <h3 className="text-xl font-bold text-text-primary mb-5 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              {isRtl ? "طلباتي الاستثمارية" : "My Investment Requests"}
            </h3>
            <div className="flex flex-col gap-4 w-full">
              {investorRequests.map(req => (
                <div 
                  key={req.id} 
                  onClick={() => setActiveRequestDetail(req)}
                  className="bg-surface-primary border border-border-primary/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer min-h-[100px] flex flex-col gap-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-500/20">
                        <Briefcase className="w-6 h-6 text-indigo-500" />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <h4 className="font-bold text-lg text-text-primary truncate">{req.projectName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide inline-flex w-fit ${
                            req.status === 'accepted' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-accent-green border border-emerald-200/50 dark:border-emerald-500/20' :
                            req.status === 'declined' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-500/20' :
                            'bg-amber-50 dark:bg-amber-500/10 text-accent-orange border border-amber-200/50 dark:border-amber-500/20'
                          }`}>
                            {getStatusText(req.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-bg-secondary shrink-0">
                      <ChevronRight className="w-5 h-5 text-text-secondary rtl:rotate-180" />
                    </div>
                  </div>
                  <div className="bg-bg-secondary rounded-2xl p-4 border border-border-primary">
                    <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">
                      {req.message.includes('interested') ? "أنا مهتم بمناقشة الاستثمار في مشروعكم." : req.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderProjectPitchPage = () => {
    if (!activeProject) return null;
    const proj = activeProject;
    
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button 
          onClick={() => setActiveProject(null)}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-indigo-600 transition-colors"
        >
          {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowRight className="w-4 h-4 rotate-180" />}
          {t.backToList}
        </button>

        {/* Hero Section */}
        <div className="bg-surface-primary border border-border-primary rounded-2xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                {proj.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary mb-2">{proj.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                <span className="flex items-center gap-1"><Users className="w-4 h-4"/> {proj.founderName}</span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {proj.location}</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> {proj.timeline}</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 w-full md:w-auto shrink-0">
               <button onClick={handleContactFounder} className="w-full px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
                 <MessageSquare className="w-5 h-5" />
                 {t.contactFounder}
               </button>
               <div className="flex gap-3">
                 <button 
                   onClick={handleInvest}
                   disabled={investing}
                   className="flex-1 w-full px-6 py-3.5 bg-surface-primary border-2 border-border-primary hover:border-indigo-600 dark:hover:border-indigo-400 text-text-primary font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base">
                   {investing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Briefcase className="w-4 h-4 text-indigo-500 shrink-0" />}
                   <span className="truncate">{isRtl ? "طلب استثمار" : "Invest"}</span>
                 </button>
                 <SaveButton itemType="project" itemId={proj.id!} title={proj.name} subtitle={proj.summary || proj.problem} className="w-[56px] h-[56px] shrink-0 bg-surface-primary border-2 border-border-primary hover:border-indigo-600 dark:hover:border-indigo-400 text-text-primary font-medium rounded-xl transition-all flex items-center justify-center shadow-sm" />
               </div>
            </div>
          </div>
        </div>

        {/* Pitch Content - Full Width Sections for Mobile */}
        <div className="flex flex-col gap-6">
           
           {/* Section 1: Problem & Solution */}
           <div className="bg-surface-primary border border-border-primary rounded-2xl p-6">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-rose-500" />
                {t.problem} & {t.solution}
              </h3>
              <div className="space-y-4">
                <div className="p-5 bg-rose-50 dark:bg-rose-500/5 rounded-xl border border-rose-100 dark:border-rose-500/10">
                  <h4 className="font-bold flex items-center gap-1.5 mb-2 text-rose-900 dark:text-rose-200">
                    <X className="w-4 h-4"/> {isRtl ? "المشكلة" : "The Problem"}
                  </h4>
                  <p className="text-sm text-rose-800 dark:text-rose-300 leading-relaxed font-medium">
                    {proj.problem}
                  </p>
                </div>
                <div className="p-5 bg-emerald-50 dark:bg-emerald-500/5 rounded-xl border border-emerald-100 dark:border-emerald-500/10">
                  <h4 className="font-bold flex items-center gap-1.5 mb-2 text-emerald-900 dark:text-emerald-200">
                    <CheckCircle2 className="w-4 h-4"/> {isRtl ? "الحل" : "The Solution"}
                  </h4>
                  <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed font-medium">
                    {proj.solution}
                  </p>
                </div>
              </div>
           </div>

           {/* Section 2: Funding Details */}
           <div className="bg-surface-primary border border-border-primary rounded-2xl p-6">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-text-primary">
                <Banknote className="w-5 h-5 text-emerald-500" />
                {isRtl ? "تفاصيل التمويل" : "Funding Details"}
              </h3>
              {(() => {
                const pct = getProgress(proj);
                const raised = Math.round((proj.fundingNeeded * pct) / 100);
                const remaining = proj.fundingNeeded - raised;
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col bg-bg-secondary/50 border border-border-primary/50 rounded-xl p-5 shadow-sm">
                      <p className="text-text-secondary text-xs uppercase tracking-wider font-bold mb-2">{isRtl ? "التمويل المطلوب" : "Funding Goal"}</p>
                      <p className="text-2xl font-black text-text-primary">{formatCurrency(proj.fundingNeeded)}</p>
                    </div>
                    <div className="flex flex-col bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-xl p-5 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                         <p className="text-emerald-700 dark:text-emerald-400 text-xs uppercase tracking-wider font-bold">{isRtl ? "تم جمعه" : "Raised Amount"}</p>
                         <span className="text-xs font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md">{pct}%</span>
                      </div>
                      <p className="text-2xl font-black text-accent-green">{formatCurrency(raised)}</p>
                    </div>
                    <div className="flex flex-col bg-bg-secondary/50 border border-border-primary/50 rounded-xl p-5 shadow-sm">
                      <p className="text-text-secondary text-xs uppercase tracking-wider font-bold mb-2">{isRtl ? "المبلغ المتبقي" : "Remaining Amount"}</p>
                      <p className="text-2xl font-black text-text-primary">{formatCurrency(remaining)}</p>
                    </div>
                  </div>
                );
              })()}
           </div>

           {/* Section 3: Market Information */}
           <div className="bg-surface-primary border border-border-primary rounded-2xl p-6">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-blue-500" />
                {isRtl ? "معلومات السوق والجمهور" : "Market & Audience"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="p-4 bg-bg-secondary/50 rounded-xl border border-border-primary/50">
                   <p className="text-xs text-text-secondary mb-1 font-bold">{t.marketSize}</p>
                   <p className="text-sm font-black text-text-primary">{proj.marketSize}</p>
                 </div>
                 <div className="p-4 bg-bg-secondary/50 rounded-xl border border-border-primary/50">
                   <p className="text-xs text-text-secondary mb-1 font-bold">{t.audience}</p>
                   <p className="text-sm font-black text-text-primary">{proj.audience}</p>
                 </div>
              </div>
           </div>

           {/* Section 4: Project Status */}
           <div className="bg-surface-primary border border-border-primary rounded-2xl p-6">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                {isRtl ? "حالة المشروع" : "Project Status"}
              </h3>
              <div className="flex items-start gap-4 p-4 bg-bg-secondary/50 rounded-xl border border-border-primary/50">
                 <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-500/20">
                   <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                 </div>
                 <div>
                   <p className="text-base font-bold text-text-primary">
                     {isRtl ? "مدقق أمنياً ومالياً" : "Verified by FinX"}
                   </p>
                   <p className="text-sm text-text-secondary mt-1">{isRtl ? "تم التحقق من الهوية والجدوى في السوق." : "Identity & market viability checked."}</p>
                 </div>
              </div>
           </div>

        </div>
      </div>
    );
  };

  const handleAcceptRequest = async (requestId: string) => {
    setUpdatingRequestId(requestId);
    const success = await updateInvestmentRequest(requestId, 'accepted');
    if (success) {
      setOwnerRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'accepted' } : r));
      if (activeRequestDetail?.id === requestId) {
        setActiveRequestDetail(prev => prev ? { ...prev, status: 'accepted' } : null);
      }
      setToastMsg(isRtl ? "تم قبول الطلب بنجاح" : "Request accepted successfully");
    } else {
      setToastMsg(isRtl ? "حدث خطأ" : "Error accepting request");
    }
    setTimeout(() => setToastMsg(""), 3000);
    setUpdatingRequestId(null);
  };

  const handleRejectRequest = async (requestId: string) => {
    setUpdatingRequestId(requestId);
    const success = await updateInvestmentRequest(requestId, 'declined');
    if (success) {
      if (activeRequestDetail?.id === requestId) {
        setActiveRequestDetail(null);
      }
      // Delay removing the item from state to allow the list view to mount
      // and trigger the exit animation smoothly
      setTimeout(() => {
        setOwnerRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'declined' } : r));
      }, 50);
      setToastMsg(isRtl ? "تم رفض الطلب" : "Request rejected");
    } else {
      setToastMsg(isRtl ? "حدث خطأ" : "Error rejecting request");
    }
    setTimeout(() => setToastMsg(""), 3000);
    setUpdatingRequestId(null);
    setConfirmReject(null);
  };

  const handleMessageInvestor = (req: InvestmentRequest) => {
    setActiveChatRequest(req);
  };

  const handleContactFounder = () => {
    if (!activeProject || !user) return;
    const existingReq = investorRequests.find(r => r.projectId === activeProject.id);
    if (existingReq) {
      setActiveChatRequest(existingReq);
    } else {
      setActiveChatRequest({
        id: "temp_" + activeProject.id,
        projectId: activeProject.id!,
        projectName: activeProject.name,
        investorId: user.uid,
        investorName: user.displayName || user.email?.split('@')[0] || "Unknown",
        founderId: activeProject.founderId,
        message: "مرحباً، أود معرفة المزيد عن المشروع.",
        status: "pending"
      });
    }
  };

  const renderOwnerView = () => {
    if (showCreate) {
      return (
        <div className="bg-surface-primary border border-border-primary rounded-2xl p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4">
          <button 
            onClick={() => setShowCreate(false)}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-indigo-600 transition-colors mb-6"
          >
            {isRtl ? <ArrowRight className="w-4 h-4 rotate-180" /> : <ArrowRight className="w-4 h-4" />}
            {t.backToList}
          </button>
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary">{t.createProject}</h2>
            <p className="text-sm text-text-secondary mt-1">{isRtl ? "قدم مشروعك بشكل احترافي للمستثمرين" : "Present your project professionally to investors"}</p>
          </div>

          <div className="space-y-6 max-w-3xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-primary">{isRtl ? "اسم المشروع" : "Project Name"}</label>
                <input type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className="w-full bg-[#F7F8FA] dark:bg-slate-950 border border-border-primary rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-text-primary transition-all" placeholder="e.g. NextGen Fin App" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-primary">{isRtl ? "التصنيف" : "Category"}</label>
                <select value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))} className="w-full bg-[#F7F8FA] dark:bg-slate-950 border border-border-primary rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-text-primary transition-all">
                  <option>قطاع التكنولوجيا</option>
                  <option>القطاع الزراعي</option>
                  <option>القطاع الصناعي</option>
                  <option>القطاع الاقتصادي</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
               <label className="text-xs font-semibold text-text-primary">{isRtl ? "ملخص المشروع" : "Project Summary"}</label>
               <input type="text" value={formData.summary} onChange={e => setFormData(p => ({ ...p, summary: e.target.value }))} className="w-full bg-[#F7F8FA] dark:bg-slate-950 border border-border-primary rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-text-primary transition-all" placeholder="One clear sentence describing your startup..." />
            </div>

            <div className="space-y-2">
               <label className="text-xs font-semibold text-text-primary">{t.problem}</label>
               <textarea rows={3} value={formData.problem} onChange={e => setFormData(p => ({ ...p, problem: e.target.value }))} className="w-full bg-[#F7F8FA] dark:bg-slate-950 border border-border-primary rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-text-primary transition-all" placeholder="Describe the core problem..."></textarea>
            </div>

            <div className="space-y-2">
               <label className="text-xs font-semibold text-text-primary">{t.solution}</label>
               <textarea rows={3} value={formData.solution} onChange={e => setFormData(p => ({ ...p, solution: e.target.value }))} className="w-full bg-[#F7F8FA] dark:bg-slate-950 border border-border-primary rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-text-primary transition-all" placeholder="How does your product solve it..."></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-xs font-semibold text-text-primary">{t.audience}</label>
                 <select value={formData.audience} onChange={e => setFormData(p => ({ ...p, audience: e.target.value }))} className="w-full bg-[#F7F8FA] dark:bg-slate-950 border border-border-primary rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-text-primary transition-all">
                   <option value="" disabled>{isRtl ? "اختر الجمهور المستهدف" : "Select target audience"}</option>
                   <option value="طلاب">طلاب</option>
                   <option value="شركات ناشئة">شركات ناشئة</option>
                   <option value="المستثمرون">المستثمرون</option>
                   <option value="الشركات الصغيرة والمتوسطة">الشركات الصغيرة والمتوسطة</option>
                   <option value="المؤسسات">المؤسسات</option>
                   <option value="القطاع الحكومي">القطاع الحكومي</option>
                   <option value="القطاع الخاص">القطاع الخاص</option>
                 </select>
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-semibold text-text-primary">{t.marketSize}</label>
                 <input type="text" value={formData.marketSize} onChange={e => setFormData(p => ({ ...p, marketSize: e.target.value }))} className="w-full bg-[#F7F8FA] dark:bg-slate-950 border border-border-primary rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-text-primary transition-all" placeholder="e.g. $500M MENA Market" />
               </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-primary">{isRtl ? "مرفقات المشروع (عرض تقديمي، دراسة جدوى)" : "Project Attachments (Pitch Deck, Feasibility Study)"}</label>
              <div 
                className="w-full border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-xl p-6 text-center transition-colors cursor-pointer text-text-secondary flex flex-col items-center gap-3"
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  hidden 
                  multiple 
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg" 
                  onChange={(e) => {
                    if (e.target.files) {
                      setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
                    }
                  }} 
                />
                <span className="text-sm">{isRtl ? "اضغط لرفع الملفات أو السحب والإفلات هنا" : "Click to upload files or drag and drop here"}</span>
              </div>
              {attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  {attachments.map((file, i) => (
                    <div key={i} className="flex items-center justify-between bg-bg-secondary/50 p-3 rounded-lg border border-border-primary">
                      <span className="text-xs text-text-primary truncate">{file.name}</span>
                      <button type="button" onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))} className="text-text-secondary hover:text-red-500 transition-colors p-1">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
               <div className="space-y-2 h-full flex flex-col justify-end">
                 <label className="text-xs font-semibold text-text-primary truncate">{t.fundingNeeded} ($)</label>
                 <input type="number" value={formData.fundingNeeded} onChange={e => setFormData(p => ({ ...p, fundingNeeded: e.target.value }))} className="w-full bg-[#F7F8FA] dark:bg-slate-950 border border-border-primary rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-text-primary transition-all" placeholder="100000" />
               </div>
               <div className="space-y-2 h-full flex flex-col justify-end">
                 <label className="text-xs font-semibold text-text-primary truncate">{t.expectedReturn}</label>
                 <input type="text" value={formData.expectedReturn} onChange={e => setFormData(p => ({ ...p, expectedReturn: e.target.value }))} className="w-full bg-[#F7F8FA] dark:bg-slate-950 border border-border-primary rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-text-primary transition-all" placeholder="e.g. 15% ROI or 10% Equity" />
               </div>
               <div className="space-y-2 h-full flex flex-col justify-end">
                 <label className="text-xs font-semibold text-text-primary truncate">{t.stage}</label>
                 <select value={formData.stage} onChange={e => setFormData(p => ({ ...p, stage: e.target.value }))} className="w-full bg-[#F7F8FA] dark:bg-slate-950 border border-border-primary rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-text-primary transition-all">
                   <option>Idea</option>
                   <option>Prototype</option>
                   <option>In progress</option>
                   <option>Seeking funding</option>
                 </select>
               </div>
            </div>

            <div className="pt-4 border-t border-border-primary flex justify-end gap-3">
              <button 
                onClick={() => setShowCreate(false)}
                className="px-6 py-2.5 rounded-xl font-medium text-text-secondary hover:bg-bg-secondary transition-colors text-sm"
              >
                {isRtl ? "إلغاء" : "Cancel"}
              </button>
              <button 
                onClick={handleCreateSubmit}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isRtl ? "إرسال للمراجعة" : "Submit for Review"}
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Determine unique projects and requests to prevent duplication
    const uniqueOwnerProjects = Array.from(new Map(ownerProjects.map(p => [p.id, p])).values());
    const uniqueOwnerRequests = Array.from(new Map(ownerRequests.map(r => [r.id, r])).values()).filter(r => r.status !== 'declined');

    return (
      <div className="flex flex-col space-y-8">
        
        {/* Top Actions Area */}
        <div className="flex flex-col gap-4 mt-2">
          {/* Top Toggle Area */}
          <div className="flex justify-center sm:justify-end">
            <div className="flex bg-slate-200/50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/50 p-1.5 rounded-2xl w-full max-w-[320px] shrink-0 shadow-inner">
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setRole("investor");
                }}
                className={`flex-1 py-2.5 rounded-[12px] text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${role === 'investor' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-text-secondary hover:text-text-primary dark:hover:text-slate-200'}`}
              >
                {t.investorRole}
              </button>
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setRole("owner");
                }}
                className={`flex-1 py-2.5 rounded-[12px] text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${role === 'owner' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-text-secondary hover:text-text-primary dark:hover:text-slate-200'}`}
              >
                {t.ownerRole}
              </button>
            </div>
          </div>
        </div>

        {uniqueOwnerProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-20 px-6 bg-bg-primary/40 border border-dashed border-border-primary/60 rounded-[2.5rem] text-center w-full">
             <div className="w-20 h-20 bg-surface-primary shadow-sm border border-border-primary rounded-3xl flex items-center justify-center mb-6">
               <Target className="w-10 h-10 text-indigo-500" />
             </div>
             <h3 className="text-xl font-bold text-text-primary mb-3">
               {isRtl ? "لا توجد مشاريع مسجلة بعد" : "No projects submitted yet"}
             </h3>
             <p className="text-base text-text-secondary max-w-md mx-auto mb-8 leading-relaxed">
               {isRtl 
                 ? "ابدأ بإضافة أول مشروع لجذب انتباه المستثمرين وتتبع التدفقات المالية بسهولة وشفافية."
                 : "Start by submitting your first project to attract investors and track financial flows with transparency."}
             </p>
             <button 
               onClick={() => setShowCreate(true)}
               className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-500/20 text-base font-bold transition-all"
             >
               {t.createProject}
             </button>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-text-primary flex items-center gap-3 px-2">
                <Briefcase className="w-6 h-6 text-indigo-500" />
                {isRtl ? "مشاريعك الحالية" : "Your Current Projects"}
              </h3>
              <div className="flex overflow-x-auto snap-x snap-mandatory pb-8 pt-4 gap-4 scrollbar-hide px-4 -mx-4 shrink-0">
                {uniqueOwnerProjects.map(proj => {
                  const pct = getProgress(proj);
                  return (
                  <div key={proj.id} className="flex flex-col shrink-0 snap-center w-[80vw] max-w-[340px] bg-surface-primary border border-border-primary/80 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:border-indigo-500/30 transition-all duration-300 relative">
                    {/* Card Header with Image/Placeholder */}
                    <div className="h-48 bg-slate-100 dark:bg-slate-900 relative overflow-hidden group shrink-0">
                       <img src={`https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&q=80&auto=format&fit=crop`} alt={proj.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 z-10" />
                       
                       {confirmDelete === proj.id ? (
                         <div className={`absolute top-2 ${isRtl ? 'left-2' : 'right-2'} z-30 p-2 bg-slate-900/90 backdrop-blur-md rounded-xl text-white shadow-lg border border-white/10 flex items-center gap-2 animate-in fade-in zoom-in`}>
                           <span className="text-xs font-medium px-1">{isRtl ? "تأكيد؟" : "Sure?"}</span>
                           <button onClick={(e) => { e.stopPropagation(); handleDeleteProject(proj.id!); }} disabled={deletingProjectId === proj.id} className="bg-red-500 hover:bg-danger px-3 py-1 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1">
                             {deletingProjectId === proj.id && <Loader2 className="w-3 h-3 animate-spin" />}
                             {isRtl ? "نعم" : "Yes"}
                           </button>
                           <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(null); }} disabled={deletingProjectId === proj.id} className="bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded-lg text-xs font-bold transition-colors disabled:opacity-50">
                             {isRtl ? "لا" : "No"}
                           </button>
                         </div>
                       ) : (
                         <button 
                           onClick={(e) => { e.stopPropagation(); setConfirmDelete(proj.id!); }}
                           className={`absolute top-3 ${isRtl ? 'left-3' : 'right-3'} z-30 p-2 bg-black/40 hover:bg-red-500/80 backdrop-blur-md rounded-full text-white/90 hover:text-white transition-all shadow-sm border border-white/10`}
                           title={isRtl ? "حذف المشروع" : "Delete Project"}
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                       )}

                       <div className="absolute bottom-3 left-4 right-4 z-20 flex flex-wrap items-end gap-2">
                         <span className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-[11px] font-bold tracking-wide border border-white/20">
                           {translateCategory(proj.category)}
                         </span>
                         <span className="flex bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 rounded-full px-2.5 py-1 items-center gap-1.5 text-emerald-100 text-[11px] font-bold shadow-sm">
                           {translateStage(proj.stage)}
                         </span>
                       </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 sm:p-6 flex flex-col flex-1">
                       <div className="mb-3">
                         <h3 className="text-xl font-black text-text-primary leading-tight hover:text-indigo-500 transition-colors cursor-pointer line-clamp-2" onClick={() => setActiveProject(proj)}>{proj.name}</h3>
                         <p className="text-sm text-text-secondary flex items-center gap-1.5 mt-2">
                           <Briefcase className="w-4 h-4 shrink-0" />
                           <span className="font-medium truncate">{proj.founderName}</span>
                         </p>
                       </div>

                       <div className="mt-auto flex flex-col gap-5 pt-4">
                         {/* Lifecycle Status Timeline */}
                         <div className="space-y-2">
                           <div className="flex justify-between items-end mb-1">
                              <span className="text-sm font-bold text-text-primary">{isRtl ? "نسبة التمويل" : "Funding Progress"}</span>
                              <span className="text-base font-black text-indigo-600 dark:text-indigo-400">{pct}%</span>
                           </div>
                           <div className="relative h-2.5 w-full bg-bg-secondary rounded-full overflow-hidden">
                             <div className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }}></div>
                           </div>
                         </div>

                         <div className="grid grid-cols-2 gap-3 mt-1">
                           <div className="bg-bg-primary/50 rounded-xl p-3 border border-border-primary/60 flex flex-col justify-center">
                             <p className="text-[10px] text-text-secondary uppercase tracking-wider font-bold mb-1 whitespace-nowrap">{isRtl ? "التمويل المطلوب" : "Goal"}</p>
                             <p className="text-sm font-black text-text-primary whitespace-nowrap">{formatCurrency(proj.fundingNeeded)}</p>
                           </div>
                           <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3 border border-indigo-100 dark:border-indigo-800/60 flex flex-col justify-center">
                             <p className="text-[10px] text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-bold mb-1 whitespace-nowrap">{isRtl ? "الطلبات" : "Requests"}</p>
                             <p className="text-sm font-black text-indigo-700 dark:text-indigo-300 whitespace-nowrap">
                               {uniqueOwnerRequests.filter(r => r.projectId === proj.id).length}
                             </p>
                           </div>
                         </div>
                         
                         <div className="pt-2 border-t border-border-primary/80">
                           <button onClick={() => setActiveProject(proj)} className="w-full h-14 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white text-base font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.98]">
                             <span>{t.viewDetails}</span>
                           </button>
                         </div>
                       </div>
                    </div>
                  </div>
                )})}
              </div>
            </div>

            <AnimatePresence>
              {uniqueOwnerRequests.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  className="pt-8 border-t border-border-primary/80"
                >
                  <h3 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3 px-2">
                    <MessageSquare className="w-6 h-6 text-indigo-500" />
                    {isRtl ? "طلبات الاستثمار الواردة" : "Incoming Investment Requests"}
                  </h3>
                  <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <AnimatePresence>
                      {uniqueOwnerRequests.map(req => (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1, height: "auto" }}
                        exit={{ opacity: 0, scale: 0.9, height: 0, minHeight: 0, padding: 0, margin: 0, overflow: "hidden" }}
                        transition={{ duration: 0.3 }}
                        key={req.id} 
                        onClick={() => setActiveRequestDetail(req)}
                        className="bg-surface-primary border border-border-primary/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer flex flex-col gap-4 min-h-[100px]"
                      >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-500/20">
                            <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <h4 className="font-bold text-lg text-text-primary truncate">{req.investorName}</h4>
                            <p className="text-sm text-text-secondary font-medium truncate mt-0.5">
                              {isRtl ? "لمشروع:" : "For project:"} <span className="text-indigo-600 dark:text-indigo-400">{req.projectName}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className="text-xs text-text-secondary font-medium">{isRtl ? "اليوم" : "Today"}</span>
                          <span className={`text-[11px] px-3 py-1 rounded-full font-bold uppercase tracking-wide inline-flex ${
                            req.status === 'accepted' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-accent-green border border-emerald-200/50 dark:border-emerald-500/20' :
                            req.status === 'declined' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-500/20' :
                            'bg-amber-50 dark:bg-amber-500/10 text-accent-orange border border-amber-200/50 dark:border-amber-500/20'
                          }`}>
                            {getStatusText(req.status)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-bg-primary/50 rounded-2xl p-4 border border-border-primary/60 mt-auto">
                        <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">
                          "{req.message.includes('interested') ? (isRtl ? "أنا مهتم بمناقشة الاستثمار في مشروعكم." : "I am interested in discussing an investment in your project.") : req.message}"
                        </p>
                      </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        )}
      </div>
    );
  };

  const renderRequestDetailsPage = () => {
    if (!activeRequestDetail) return null;
    const req = activeRequestDetail;
    const relatedProject = projects.find(p => p.id === req.projectId) || ownerProjects.find(p => p.id === req.projectId);

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button 
          onClick={() => setActiveRequestDetail(null)}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-indigo-600 transition-colors"
        >
          {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowRight className="w-4 h-4 rotate-180" />}
          {t.backToList}
        </button>

        <div className="bg-surface-primary border border-border-primary rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
            <div className="flex-1">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide mb-4 ${
                req.status === 'accepted' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-accent-green border border-emerald-200/50 dark:border-emerald-500/20' :
                req.status === 'declined' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-500/20' :
                'bg-amber-50 dark:bg-amber-500/10 text-accent-orange border border-amber-200/50 dark:border-amber-500/20'
              }`}>
                <Activity className="w-3.5 h-3.5" />
                {getStatusText(req.status)}
              </span>
              <h2 className="text-3xl font-black text-text-primary mb-2 leading-tight">
                {isRtl ? "تفاصيل الطلب الاستثماري" : "Investment Request Details"}
              </h2>
              <div className="flex items-center gap-3 text-text-secondary text-sm mt-3 font-medium">
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" />
                  {isRtl ? "للمشروع:" : "For Project:"} <span className="text-indigo-600 dark:text-indigo-400 font-bold">{req.projectName}</span>
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-border-primary"></span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {isRtl ? "تاريخ الطلب:" : "Requested On:"} {isRtl ? "اليوم" : "Today"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-surface-primary border border-border-primary rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-500" />
                {isRtl ? "رسالة المستثمر" : "Investor Message"}
              </h3>
              <div className="bg-bg-secondary/50 rounded-xl p-5 border border-border-primary/80">
                <p className="text-text-primary leading-relaxed whitespace-pre-wrap font-medium">
                  {req.message.includes('interested') ? (isRtl ? "أنا مهتم بمناقشة الاستثمار في مشروعكم." : "I am interested in discussing an investment in your project.") : req.message}
                </p>
              </div>
            </div>

            {relatedProject && (
              <div className="bg-surface-primary border border-border-primary rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-500" />
                  {isRtl ? "نظرة على المشروع" : "Project Overview"}
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-text-secondary mb-1">{t.problem}</h4>
                    <p className="text-text-primary text-sm leading-relaxed">{relatedProject.problem}</p>
                  </div>
                  <div className="flex flex-wrap gap-4 pt-4 border-t border-border-primary/80">
                    <div className="flex-1 min-w-[120px]">
                      <h4 className="text-xs font-bold text-text-secondary mb-1">{t.fundingNeeded}</h4>
                      <p className="font-bold text-text-primary">{formatCurrency(relatedProject.fundingNeeded)}</p>
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <h4 className="text-xs font-bold text-text-secondary mb-1">{t.stage}</h4>
                      <p className="font-bold text-text-primary">{translateStage(relatedProject.stage)}</p>
                    </div>
                  </div>
                  <button onClick={() => { setActiveRequestDetail(null); setActiveProject(relatedProject); }} className="w-full py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors mt-2 text-sm">
                    {isRtl ? "عرض تفاصيل المشروع بالكامل" : "View Full Project Details"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-surface-primary border border-border-primary rounded-2xl p-6 shadow-sm sticky top-6">
              <h3 className="font-bold text-text-primary mb-4">{isRtl ? "الإجراءات" : "Actions"}</h3>
              
              <div className="space-y-4">
                <button 
                  onClick={() => { setActiveChatRequest(req); }}
                  className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-500/20 font-bold text-base transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  <MessageSquare className="w-5 h-5 shrink-0" />
                  <span>{isRtl ? "فتح المحادثة" : "Open Conversation"}</span>
                </button>
                
                {role === "owner" && req.status === "pending" && (
                  <div className="pt-3 border-t border-border-primary/80">
                    {confirmReject === req.id ? (
                      <div className="flex flex-col gap-2 animate-in fade-in zoom-in">
                        <p className="text-xs text-center text-text-secondary font-bold mb-1">{isRtl ? "تأكيد الرفض؟" : "Confirm Rejection?"}</p>
                        <div className="grid grid-cols-2 gap-3">
                          <button 
                            onClick={() => handleRejectRequest(req.id!)}
                            disabled={updatingRequestId === req.id}
                            className="py-2.5 bg-red-500 hover:bg-danger text-white font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                          >
                            {updatingRequestId === req.id && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isRtl ? "تأكيد" : "Confirm"}
                          </button>
                          <button 
                            onClick={() => setConfirmReject(null)}
                            disabled={updatingRequestId === req.id}
                            className="py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-text-primary font-bold rounded-xl transition-all text-sm disabled:opacity-50"
                          >
                            {isRtl ? "إلغاء" : "Cancel"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => handleAcceptRequest(req.id!)}
                          disabled={updatingRequestId === req.id}
                          className="py-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-accent-green font-bold rounded-xl transition-all hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {updatingRequestId === req.id && <Loader2 className="w-4 h-4 animate-spin" />}
                          {isRtl ? "قبول" : "Accept"}
                        </button>
                        <button 
                          onClick={() => setConfirmReject(req.id!)}
                          disabled={updatingRequestId === req.id}
                          className="py-2.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold rounded-xl transition-all hover:bg-rose-100 dark:hover:bg-rose-500/20 text-sm disabled:opacity-50"
                        >
                          {isRtl ? "رفض" : "Reject"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col" dir={isRtl ? "rtl" : "ltr"}>
      
      {/* Chat Modal */}
      {activeChatRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-primary rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-border-primary flex flex-col h-[60vh] max-h-[600px] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border-primary/80 bg-[#F7F8FA]/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-text-primary text-base leading-tight">
                    {activeChatRequest.investorName}
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {isRtl ? "محادثة حول:" : "Chat regarding:"} <span className="font-semibold text-indigo-600 dark:text-indigo-400">{activeChatRequest.projectName}</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setActiveChatRequest(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-bg-secondary text-text-secondary hover:bg-bg-secondary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-[#F7F8FA]/30 dark:bg-slate-950/30 flex flex-col gap-4">
              <div className="flex justify-center">
                <span className="text-[10px] font-bold tracking-wider text-text-secondary uppercase bg-bg-secondary px-3 py-1 rounded-full">
                  {isRtl ? "اليوم" : "Today"}
                </span>
              </div>
              
              {activeMessages.map((msg, idx) => {
                const isMe = user ? msg.senderId === user.uid : false;
                return (
                  <div key={msg.id || idx} className={`flex flex-col max-w-[85%] ${isMe ? (isRtl ? 'mr-auto items-end' : 'ml-auto items-end') : (isRtl ? 'ml-auto items-start' : 'mr-auto items-start')}`}>
                    <div className={`${isMe ? 'bg-indigo-600 text-white rounded-tl-sm' : 'bg-border-primary text-text-primary rounded-tr-sm'} px-4 py-2.5 rounded-2xl text-sm shadow-sm`}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-text-secondary mt-1 px-1">
                      {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border-primary/80 bg-surface-primary">
              <div className="flex items-end gap-2 bg-bg-primary border border-border-primary rounded-2xl p-2 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
                <textarea 
                  rows={1}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1 bg-transparent border-none outline-none resize-none px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary min-h-[40px] max-h-[120px]"
                  placeholder={isRtl ? "اكتب رسالتك..." : "Type your message..."}
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim() || sendingMsg}
                  className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:dark:bg-slate-700 text-white flex items-center justify-center shrink-0 transition-colors shadow-sm mb-0.5"
                >
                  {sendingMsg ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-lg font-medium text-sm animate-in slide-in-from-top-4">
          {toastMsg}
        </div>
      )}

      

      {/* Main Content */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-24 flex-1 flex flex-col min-h-0">
        {loading ? (
          <div className="flex flex-1 items-center justify-center py-20 min-h-[50vh]">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : activeProject ? (
          renderProjectPitchPage()
        ) : activeRequestDetail ? (
          renderRequestDetailsPage()
        ) : role === "investor" ? (
          renderInvestorView()
        ) : (
          renderOwnerView()
        )}
      </div>

    </div>
  );
}
