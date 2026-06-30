import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  DollarSign,
  Lightbulb,
  TrendingUp,
  Wallet,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  Mail,
  Briefcase,
  Target,
  FileText,
  LineChart,
  Rocket,
  PieChart,
  Cpu,
  Wifi,
  Users
} from "lucide-react";
import { translations } from "../translations";
import { FinancialAnalysis, ActiveCard } from "../types";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import VirtualCard from "./VirtualCard";
import { ProfileService } from "../services/ProfileService";

interface DashboardProps {
  lang: "ar" | "en";
  analysis: FinancialAnalysis;
  setActiveTab: (tab: any) => void;
  userRole?: string | null;
  activeCard?: ActiveCard | null;
}

const Dashboard = ({
  lang,
  analysis,
  setActiveTab,
  userRole,
  activeCard
}: DashboardProps) => {
  const t = translations[lang];
  const isRtl = lang === "ar";
  const navigate = useNavigate();

  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [onboardingData, setOnboardingData] = useState<any>(null);

  const handleRemoveCard = React.useCallback(async () => {
    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, "users", auth.currentUser.uid, "settings", "activeCard"));
        window.location.reload();
      } catch (error) {
        console.error("Error removing card", error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchOnboarding = async () => {
      if (auth.currentUser) {
        const data = await ProfileService.getOnboardingSettings(auth.currentUser.uid);
        if (data) {
          setOnboardingData(data);
        }
      } else {
        const localData = localStorage.getItem("finx_onboarding_data");
        if (localData) {
          try {
            setOnboardingData(JSON.parse(localData));
          } catch(e) {}
        }
      }
    };
    fetchOnboarding();
  }, []);

  // Financial values
  const score = analysis.healthScore;

  const handleSendReport = async () => {
    try {
      setSendingEmail(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setEmailSuccess(true);
      setTimeout(() => setEmailSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to send email:", err);
    } finally {
      setSendingEmail(false);
    }
  };

  const getScoreColor = (val: number) => {
    if (val >= 80) return "text-accent-green";
    if (val >= 60) return "text-accent-orange";
    return "text-rose-600 dark:text-rose-400";
  };

  const getScoreBg = (val: number) => {
    if (val >= 80) return "bg-emerald-500/10 border-emerald-500/20";
    if (val >= 60) return "bg-amber-500/10 border-amber-500/20";
    return "bg-rose-500/10 border-rose-500/20";
  };

  const getScoreLabel = (val: number) => {
    if (val >= 85) return t.excellentState;
    if (val >= 70) return t.goodState;
    if (val >= 50) return t.fairState;
    return t.cautionState;
  };

  const renderCareerWidgets = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Profile & CV Completeness */}
      <div 
        onClick={() => setActiveTab("careerProfile")}
        className="rounded-2xl p-4 bg-surface-primary/80 border border-border-primary shadow-sm cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
      >
        <div className="flex justify-between items-start mb-3">
           <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
             <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
           </div>
           <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-500/10 text-accent-orange text-[10px] font-bold rounded-lg uppercase">
             {isRtl ? "مطلوب إجراء" : "Action Needed"}
           </span>
        </div>
        <h4 className="text-sm font-bold text-text-primary mb-1">{isRtl ? "استكمل ملفك المهني" : "Complete Career Profile"}</h4>
        <p className="text-xs text-text-secondary mb-3">{isRtl ? "ارفع سيرتك الذاتية لتحليل فرصك وتطويرها" : "Upload your CV to analyze opportunities"}</p>
        <div className="w-full bg-bg-secondary rounded-full h-1.5">
          <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '25%' }}></div>
        </div>
      </div>

      {/* AI Interview Prep */}
      <div 
        onClick={() => setActiveTab("interviewSimulator")}
        className="rounded-2xl p-4 bg-indigo-600 dark:bg-indigo-900 border border-indigo-500 dark:border-indigo-800 shadow-sm cursor-pointer hover:bg-indigo-700 transition-colors text-white relative overflow-hidden"
      >
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
        <div className="flex justify-between items-start mb-3 relative z-10">
           <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
             <Target className="w-5 h-5 text-white" />
           </div>
        </div>
        <h4 className="text-sm font-bold text-white mb-1 relative z-10">{isRtl ? "محاكي المقابلات بالذكاء الاصطناعي" : "AI Interview Simulator"}</h4>
        <p className="text-xs text-indigo-100 relative z-10">{isRtl ? "استعد للوظيفة مع محاكي حي يقيم أداءك" : "Prep for your job with live simulation feedback"}</p>
      </div>
      
      {/* Job Matches (Placeholder) */}
      <div className="md:col-span-2 rounded-2xl p-4 bg-surface-primary/80 border border-border-primary shadow-sm">
         <h4 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
           <Briefcase className="w-4 h-4 text-indigo-500" />
           {isRtl ? "وظائف مقترحة لك" : "Recommended Jobs"}
         </h4>
         <div className="text-center py-6 text-text-secondary text-xs">
           {isRtl ? "ارفع سيرتك الذاتية أولاً لرؤية الوظائف المطابقة" : "Upload your CV first to see matching jobs"}
         </div>
      </div>
    </div>
  );

  const renderFounderWidgets = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div 
        onClick={() => setActiveTab("projects")}
        className="rounded-2xl p-4 bg-surface-primary/80 border border-border-primary shadow-sm cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-3">
          <Rocket className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h4 className="text-sm font-bold text-text-primary mb-1">نشمي</h4>
        <p className="text-xs text-text-secondary">{isRtl ? "أضف مشروعك، تتبع التمويل، ورد على طلبات الاستثمار" : "Add projects, track funding, manage investor requests"}</p>
      </div>

      <div className="rounded-2xl p-4 bg-surface-primary/80 border border-border-primary shadow-sm flex flex-col justify-center items-center text-center">
         <LineChart className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
         <span className="text-xs font-bold text-text-secondary">{isRtl ? "لا توجد بيانات استثمارية بعد" : "No investment data yet"}</span>
      </div>
    </div>
  );

  const renderInvestorWidgets = () => (
    <div className="grid grid-cols-1 gap-4">
      <div 
        onClick={() => setActiveTab("projects")}
        className="rounded-2xl p-5 bg-gradient-to-r from-slate-900 to-indigo-900 dark:from-slate-800 dark:to-indigo-950 text-white shadow-lg cursor-pointer transform hover:scale-[1.01] transition-transform"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <TrendingUp className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold">{isRtl ? "الفرص الاستثمارية المرشحة" : "Curated Investment Opportunities"}</h3>
              <p className="text-xs text-indigo-200">{isRtl ? "استكشف أحدث المشاريع الواعدة وابدأ المحادثات" : "Explore the latest promising startups & start conversations"}</p>
            </div>
          </div>
          <ArrowRight className={`w-5 h-5 text-indigo-300 ${isRtl ? 'rotate-180' : ''}`} />
        </div>
      </div>
    </div>
  );

  const renderFinanceWidgets = () => (
    <>
      <VirtualCard 
        activeCard={activeCard} 
        lang={lang} 
        isRtl={isRtl} 
        onRemoveCard={handleRemoveCard} 
      />

      <div
        onClick={() => setActiveTab("healthScore")}
        className="rounded-2xl p-4 bg-surface-primary/50 border border-border-primary hover:border-indigo-500/30 active:scale-98 transition-all cursor-pointer flex items-center justify-between gap-4"
      >
        <div className="space-y-1.5 flex-1">
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">
            {t.scoreTitle}
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-black font-mono ${getScoreColor(score)}`}>{score}</span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${getScoreBg(score)} ${getScoreColor(score)}`}>
              {getScoreLabel(score)}
            </span>
          </div>
          <p className="text-[11px] leading-relaxed text-text-primary dark:text-text-secondary line-clamp-1">
            {analysis.scoreExplanation}
          </p>
        </div>

        <div className="w-14 h-14 rounded-xl bg-white dark:bg-bg-primary border border-border-primary flex items-center justify-center shrink-0 relative">
          <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="18" className="text-border-primary" strokeWidth="3.5" stroke="currentColor" fill="transparent" />
            <circle cx="24" cy="24" r="18" className={score >= 80 ? "text-indigo-500" : score >= 60 ? "text-accent-orange" : "text-danger"} strokeWidth="4" strokeDasharray={113} strokeDashoffset={113 - (113 * score) / 100} strokeLinecap="round" fill="transparent" />
          </svg>
          <span className="absolute text-[10px] font-black text-text-primary">{score}%</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mt-4">
        {/* Account Analysis */}
        <div
          onClick={() => setActiveTab("upload")}
          className="rounded-2xl p-4 bg-surface-primary border border-border-primary cursor-pointer shadow-sm hover:border-emerald-500/50 transition-colors flex flex-col justify-between group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
          <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-3 relative z-10 group-hover:scale-110 transition-transform">
            <FileText className="w-4 h-4 text-accent-green" />
          </div>
          <h4 className="text-xs font-bold text-text-primary mb-1 relative z-10">
            {isRtl ? "تحليل الحساب" : "Account Analysis"}
          </h4>
        </div>

        {/* Family Financial System */}
        <div
          onClick={() => navigate("/family")}
          className="rounded-2xl p-4 bg-surface-primary border border-border-primary cursor-pointer shadow-sm hover:border-purple-500/50 transition-colors flex flex-col justify-between group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
          <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center mb-3 relative z-10 group-hover:scale-110 transition-transform">
            <Users className="w-4 h-4 text-accent-purple" />
          </div>
          <h4 className="text-xs font-bold text-text-primary mb-1 relative z-10">
            {isRtl ? "نظام العائلة المالي" : "Family Financial System"}
          </h4>
        </div>

        {/* Smart Recommendations */}
        <div
          onClick={() => setActiveTab("recommendations")}
          className="rounded-2xl p-4 bg-surface-primary border border-border-primary cursor-pointer shadow-sm hover:border-amber-500/50 transition-colors flex flex-col justify-between group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
          <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-3 relative z-10 group-hover:scale-110 transition-transform">
            <Sparkles className="w-4 h-4 text-accent-orange" />
          </div>
          <h4 className="text-xs font-bold text-text-primary mb-1 relative z-10">
             {t.recommendations || (isRtl ? "التوصيات الذكية" : "Smart Recommendations")}
          </h4>
        </div>

        {/* Analytics & Reports */}
        <div
          onClick={() => setActiveTab("analytics")}
          className="rounded-2xl p-4 bg-surface-primary border border-border-primary cursor-pointer shadow-sm hover:border-indigo-500/50 transition-colors flex flex-col justify-between group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
          <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-3 relative z-10 group-hover:scale-110 transition-transform">
            <PieChart className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h4 className="text-xs font-bold text-text-primary mb-1 relative z-10">
            {t.analytics || (isRtl ? "التحليلات والتقارير" : "Analytics & Reports")}
          </h4>
        </div>
      </div>
    </>
  );

  return (
    <div className={`flex-1 overflow-y-auto px-4 py-5 space-y-6 ${isRtl ? "text-right" : "text-left"} bg-[#F7F8FA] dark:bg-transparent`}>
      {(userRole === "job_seeker" || userRole === "student") && renderCareerWidgets()}
      {(userRole === "founder") && renderFounderWidgets()}
      {(userRole === "investor") && renderInvestorWidgets()}
      
      <div className="space-y-4">
        {renderFinanceWidgets()}
      </div>
    </div>
  );
};

export default React.memo(Dashboard);

