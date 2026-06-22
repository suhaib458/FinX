import React, { useState, useEffect } from "react";
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
  X
} from "lucide-react";
import { getProjects, getOwnerProjects, createProject, Project, createInvestmentRequest, InvestmentRequest, getOwnerRequests, getInvestorRequests } from "../lib/projects";

interface ProjectsTabProps {
  lang: "ar" | "en";
  user: any;
}

export default function ProjectsTab({ lang, user }: ProjectsTabProps) {
  const isRtl = lang === "ar";
  const [role, setRole] = useState<"owner" | "investor">("investor");
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [ownerProjects, setOwnerProjects] = useState<Project[]>([]);
  const [ownerRequests, setOwnerRequests] = useState<InvestmentRequest[]>([]);
  const [investorRequests, setInvestorRequests] = useState<InvestmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [investing, setInvesting] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    category: "Fintech",
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
  const t = {
    ownerRole: isRtl ? "صاحب المشروع" : "Project Owner",
    investorRole: isRtl ? "مستثمر" : "Investor",
    myProjects: isRtl ? "مشاريعي" : "My Projects",
    discover: isRtl ? "اكتشف المشاريع" : "Discover Projects",
    createProject: isRtl ? "طرح مشروع جديد" : "Submit New Project",
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
        category: "Fintech",
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
    } else {
      setToastMsg("Failed to create project");
    }
    
    setSubmitting(false);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleInvest = async () => {
    if (!user || !activeProject || investing) return;
    setInvesting(true);
    
    const reqData: Omit<InvestmentRequest, 'id' | 'createdAt'> = {
      projectId: activeProject.id!,
      projectName: activeProject.name,
      investorId: user.uid,
      investorName: user.displayName || user.email?.split('@')[0] || "Unknown Investor",
      founderId: activeProject.founderId,
      message: "I am interested in discussing an investment in your project.",
      status: "pending"
    };
    
    const ok = await createInvestmentRequest(reqData);
    if (ok) {
      setToastMsg("Investment request sent!");
    } else {
      setToastMsg("Failed to send request.");
    }
    
    setInvesting(false);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const renderInvestorView = () => {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {isRtl ? "فرص استثمارية واعدة" : "Promising Investment Opportunities"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isRtl ? "تصفح المشاريع الناشئة وتواصل مع المؤسسين." : "Browse emerging startups and connect with founders."}
            </p>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full md:w-auto hide-scrollbar">
            {["AI / Tech", "Fintech", "HealthTech", "Jordan", "Remote"].map(tag => (
              <button key={tag} className="shrink-0 px-4 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 border border-transparent hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors">
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {projects.map(proj => (
            <div key={proj.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-medium mb-3">
                      <Target className="w-3.5 h-3.5" />
                      {proj.category}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{proj.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      {proj.founderName}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
                      {proj.stage}
                    </span>
                    <button className="text-slate-400 hover:text-indigo-500 transition-colors p-1">
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-5">
                  <span className="font-semibold text-slate-900 dark:text-white mr-1 rtl:ml-1 rtl:mr-0">{t.problem}:</span>
                  {proj.problem}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-5 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">{t.fundingNeeded}</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">${proj.fundingNeeded.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">{t.expectedReturn}</p>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{proj.expectedReturn}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">{t.riskLevel}</p>
                    <p className="text-sm font-semibold text-amber-600 dark:text-amber-500">{proj.riskLevel}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">{t.location}</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{proj.location}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-5">
                   <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-medium text-slate-600 dark:text-slate-300">{isRtl ? "التمويل المجموع" : "Funding Progress"}</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {Math.round((proj.moneyReceived / proj.fundingNeeded) * 100)}%
                      </span>
                   </div>
                   <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min((proj.moneyReceived / proj.fundingNeeded) * 100, 100)}%` }}></div>
                   </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <button onClick={() => setActiveProject(proj)} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    {t.viewDetails}
                  </button>
                  <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {investorRequests.length > 0 && (
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {isRtl ? "طلباتي الاستثمارية" : "My Investment Requests"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {investorRequests.map(req => (
                <div key={req.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-slate-900 dark:text-white">{req.projectName}</h4>
                    <span className={`text-[11px] px-2 py-1 rounded-lg font-semibold uppercase ${
                      req.status === 'accepted' ? 'bg-emerald-50 text-emerald-600' :
                      req.status === 'declined' ? 'bg-rose-50 text-rose-600' :
                      'bg-amber-50 text-amber-600'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    "{req.message}"
                  </p>
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
          className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors"
        >
          {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowRight className="w-4 h-4 rotate-180" />}
          {t.backToList}
        </button>

        {/* Hero Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                {proj.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2">{proj.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1"><Users className="w-4 h-4"/> {proj.founderName}</span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {proj.location}</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> {proj.timeline}</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 w-full md:w-auto shrink-0">
               <button 
                 onClick={handleInvest}
                 disabled={investing}
                 className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                 {investing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Briefcase className="w-4 h-4" />}
                 {isRtl ? "طلب استثمار / تفاوض" : "Request to Invest"}
               </button>
               <div className="flex gap-3">
                 <button className="flex-1 w-full md:w-auto px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-all flex items-center justify-center gap-2">
                   <MessageSquare className="w-4 h-4" />
                   {t.contactFounder}
                 </button>
                 <button className="px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-all flex items-center justify-center">
                   <Bookmark className="w-5 h-5" />
                 </button>
               </div>
            </div>
          </div>
        </div>

        {/* Pitch Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="md:col-span-2 space-y-6">
              
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                 <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                   <Target className="w-5 h-5 text-rose-500" />
                   {t.problem} & {t.solution}
                 </h3>
                 <div className="space-y-5">
                   <div className="p-4 bg-rose-50 dark:bg-rose-500/5 rounded-xl border border-rose-100 dark:border-rose-500/10">
                     <p className="text-sm text-rose-900 dark:text-rose-200 leading-relaxed font-medium">
                       <span className="font-bold flex items-center gap-1.5 mb-2"><X className="w-4 h-4"/> The Problem</span>
                       {proj.problem}
                     </p>
                   </div>
                   <div className="p-4 bg-emerald-50 dark:bg-emerald-500/5 rounded-xl border border-emerald-100 dark:border-emerald-500/10">
                     <p className="text-sm text-emerald-900 dark:text-emerald-200 leading-relaxed font-medium">
                       <span className="font-bold flex items-center gap-1.5 mb-2"><CheckCircle2 className="w-4 h-4"/> The Solution</span>
                       {proj.solution}
                     </p>
                   </div>
                 </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                 <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                   <Globe className="w-5 h-5 text-blue-500" />
                   {isRtl ? "معلومات السوق والجمهور" : "Market & Audience"}
                 </h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t.marketSize}</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{proj.marketSize}</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t.audience}</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{proj.audience}</p>
                    </div>
                 </div>
              </div>

           </div>

           <div className="space-y-6">
              {/* Financial Highlight */}
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white border border-indigo-500/20 shadow-xl shadow-indigo-900/10 relative overflow-hidden">
                 <div className="absolute top-0 right-0 opacity-10">
                   <PieChart className="w-32 h-32 -mt-4 -mr-4" />
                 </div>
                 <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
                   <Banknote className="w-5 h-5 text-emerald-400" />
                   {isRtl ? "تفاصيل التمويل" : "Funding Details"}
                 </h3>
                 
                 <div className="space-y-4 relative z-10">
                    <div>
                      <p className="text-indigo-200 text-xs mb-1 uppercase tracking-wider">{t.fundingNeeded}</p>
                      <p className="text-3xl font-black">${proj.fundingNeeded.toLocaleString()}</p>
                    </div>
                    <div className="pt-4 border-t border-indigo-500/30 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-indigo-200 text-[10px] mb-1 uppercase">{t.expectedReturn}</p>
                        <p className="text-sm font-bold text-emerald-400">{proj.expectedReturn}</p>
                      </div>
                      <div>
                        <p className="text-indigo-200 text-[10px] mb-1 uppercase">{t.riskLevel}</p>
                        <p className="text-sm font-bold text-amber-400">{proj.riskLevel}</p>
                      </div>
                    </div>
                 </div>
              </div>

              {/* Status Tracking */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                 <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                   <Activity className="w-4 h-4 text-indigo-500" />
                   {t.financialTracking}
                 </h3>
                 
                 <div className="space-y-4">
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-500 dark:text-slate-400">{isRtl ? "تم جمعه" : "Raised so far"}</span>
                     <span className="font-bold text-slate-900 dark:text-white">${proj.moneyReceived.toLocaleString()}</span>
                   </div>
                   
                   <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min((proj.moneyReceived / proj.fundingNeeded) * 100, 100)}%` }}></div>
                   </div>

                   <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                     <div className="flex items-center gap-3">
                       <ShieldCheck className="w-8 h-8 text-emerald-500 shrink-0" />
                       <div>
                         <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider">
                           {isRtl ? "مدقق أمنياً ومالياً" : "Verified by FinX"}
                         </p>
                         <p className="text-[10px] text-slate-500">Identity & market viability checked.</p>
                       </div>
                     </div>
                   </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
  };

  const renderOwnerView = () => {
    if (showCreate) {
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4">
          <button 
            onClick={() => setShowCreate(false)}
            className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors mb-6"
          >
            {isRtl ? <ArrowRight className="w-4 h-4 rotate-180" /> : <ArrowRight className="w-4 h-4" />}
            {t.backToList}
          </button>
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t.createProject}</h2>
            <p className="text-sm text-slate-500 mt-1">{isRtl ? "قدم مشروعك بشكل احترافي للمستثمرين" : "Present your project professionally to investors"}</p>
          </div>

          <div className="space-y-6 max-w-3xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{isRtl ? "اسم المشروع" : "Project Name"}</label>
                <input type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white transition-all" placeholder="e.g. NextGen Fin App" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{isRtl ? "التصنيف" : "Category"}</label>
                <select value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white transition-all">
                  <option>Fintech</option>
                  <option>HealthTech</option>
                  <option>AI / Cloud</option>
                  <option>E-Commerce</option>
                  <option>SaaS</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
               <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{isRtl ? "ملخص المشروع" : "Project Summary"}</label>
               <input type="text" value={formData.summary} onChange={e => setFormData(p => ({ ...p, summary: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white transition-all" placeholder="One clear sentence describing your startup..." />
            </div>

            <div className="space-y-2">
               <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t.problem}</label>
               <textarea rows={3} value={formData.problem} onChange={e => setFormData(p => ({ ...p, problem: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white transition-all" placeholder="Describe the core problem..."></textarea>
            </div>

            <div className="space-y-2">
               <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t.solution}</label>
               <textarea rows={3} value={formData.solution} onChange={e => setFormData(p => ({ ...p, solution: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white transition-all" placeholder="How does your product solve it..."></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t.audience}</label>
                 <input type="text" value={formData.audience} onChange={e => setFormData(p => ({ ...p, audience: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white transition-all" placeholder="e.g. University Students, SMEs" />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t.marketSize}</label>
                 <input type="text" value={formData.marketSize} onChange={e => setFormData(p => ({ ...p, marketSize: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white transition-all" placeholder="e.g. $500M MENA Market" />
               </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{isRtl ? "مرفقات المشروع (عرض تقديمي، دراسة جدوى)" : "Project Attachments (Pitch Deck, Feasibility Study)"}</label>
              <div className="w-full border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-xl p-6 text-center transition-colors cursor-pointer text-slate-500 dark:text-slate-400">
                <span className="text-sm">{isRtl ? "اضغط لرفع الملفات أو السحب والإفلات هنا" : "Click to upload files or drag and drop here"}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="space-y-2">
                 <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t.fundingNeeded} ($)</label>
                 <input type="number" value={formData.fundingNeeded} onChange={e => setFormData(p => ({ ...p, fundingNeeded: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white transition-all" placeholder="100000" />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t.expectedReturn}</label>
                 <input type="text" value={formData.expectedReturn} onChange={e => setFormData(p => ({ ...p, expectedReturn: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white transition-all" placeholder="e.g. 15% ROI or 10% Equity" />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t.stage}</label>
                 <select value={formData.stage} onChange={e => setFormData(p => ({ ...p, stage: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white transition-all">
                   <option>Idea</option>
                   <option>Prototype</option>
                   <option>In progress</option>
                   <option>Seeking funding</option>
                 </select>
               </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button 
                onClick={() => setShowCreate(false)}
                className="px-6 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
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

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {t.myProjects}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isRtl ? "إدارة مشاريعك وعروضك الاستثمارية." : "Manage your projects and pitches."}
            </p>
          </div>
          
          <button 
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-lg shadow-indigo-500/20 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            {t.createProject}
          </button>
        </div>

        {/* Financial Flow Overview for Owner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 uppercase tracking-wider">{isRtl ? "إجمالي التمويل المستلم" : "Total Raised"}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">$0.00</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400">
                 <TrendingUp className="w-5 h-5" />
              </div>
           </div>
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 uppercase tracking-wider">{isRtl ? "الأموال المصروفة" : "Money Spent"}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">$0.00</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-500/10 flex flex-col items-center justify-center text-rose-600 dark:text-rose-400">
                 <Briefcase className="w-5 h-5" />
              </div>
           </div>
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 uppercase tracking-wider">{isRtl ? "الميزانية المتبقية" : "Remaining Budget"}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">$0.00</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex flex-col items-center justify-center text-indigo-600 dark:text-indigo-400">
                 <PieChart className="w-5 h-5" />
              </div>
           </div>
        </div>

        {ownerProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center px-4">
             <div className="w-16 h-16 bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 rounded-2xl flex items-center justify-center mb-6">
               <Target className="w-8 h-8 text-indigo-500" />
             </div>
             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
               {isRtl ? "لا توجد مشاريع مسجلة بعد" : "No projects submitted yet"}
             </h3>
             <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
               {isRtl 
                 ? "ابدأ بإضافة مشروعك الأول لجذب الانتباه المستثمرين وتتبع التدفقات المالية للمشروع بسهولة وشفافية."
                 : "Start by submitting your first project to attract investors and track financial flows with transparency."}
             </p>
             <button 
               onClick={() => setShowCreate(true)}
               className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20 text-sm font-medium transition-all"
             >
               {t.createProject}
             </button>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {ownerProjects.map(proj => (
                <div key={proj.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-medium mb-3">
                          <Target className="w-3.5 h-3.5" />
                          {proj.category}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{proj.name}</h3>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
                          {proj.stage}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-5 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">{t.fundingNeeded}</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">${proj.fundingNeeded.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">{t.expectedReturn}</p>
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{proj.expectedReturn}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      <button onClick={() => setActiveProject(proj)} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5">
                        <Eye className="w-4 h-4" />
                        {t.viewDetails}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {ownerRequests.length > 0 && (
              <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                  {isRtl ? "طلبات الاستثمار" : "Investment Requests"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ownerRequests.map(req => (
                    <div key={req.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-slate-900 dark:text-white">{req.investorName}</h4>
                        <span className="text-[11px] px-2 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg font-semibold uppercase">{req.status}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{req.projectName}</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        "{req.message}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24" dir={isRtl ? "rtl" : "ltr"}>
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-lg font-medium text-sm animate-in slide-in-from-top-4">
          {toastMsg}
        </div>
      )}

      {/* View Toggle */}
      {!activeProject && !showCreate && (
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-inner">
            <button
              onClick={() => setRole("investor")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                role === "investor"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <BarChart4 className="w-4 h-4" />
              {t.investorRole}
            </button>
            <button
              onClick={() => setRole("owner")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                role === "owner"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Building2 className="w-4 h-4" />
              {t.ownerRole}
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="w-full">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : activeProject ? (
          renderProjectPitchPage()
        ) : role === "investor" ? (
          renderInvestorView()
        ) : (
          renderOwnerView()
        )}
      </div>

    </div>
  );
}
