import React from "react";
import { Sparkles, CheckCircle2, Shield, Zap, TrendingUp, Mic, Download, Target } from "lucide-react";

interface NashmiProTabProps {
  lang: "ar" | "en";
  isPro: boolean;
}

export default function NashmiProTab({ lang, isPro }: NashmiProTabProps) {
  const isRtl = lang === "ar";
  
  const handleUpgrade = () => {
    // Simulated Upgrade
    localStorage.setItem("finx_pro_status", "true");
    window.location.reload();
  };

  const features = [
    {
      icon: <Mic className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      title: lang === "ar" ? "البحث عن وظيفة بالصوت" : "Voice Job Search",
      desc: lang === "ar" ? "ابحث عن وظائف عبر رسائل صوتية ذكية." : "Find jobs using smart voice messages."
    },
    {
      icon: <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      title: lang === "ar" ? "تحليل رسائل SMS التلقائي" : "Auto SMS Intelligence",
      desc: lang === "ar" ? "استخراج وتحليل الحركات المالية من رسائلك بأمان." : "Extract and analyze financial transactions from SMS securely."
    },
    {
      icon: <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      title: lang === "ar" ? "أهداف مرئية متقدمة" : "Premium Visual Goals",
      desc: lang === "ar" ? "تتبع مبهر لأهدافك مع تقسيمات مرئية ذكية." : "Stunning goal tracking with smart visual milestones."
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      title: lang === "ar" ? "مضاعف النقاط والمكافآت" : "Points Multiplier",
      desc: lang === "ar" ? "احصل على ضعف النقاط لسرعة الوصول للمكافآت." : "Earn 2x points to unlock rewards faster."
    },
    {
      icon: <Download className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      title: lang === "ar" ? "تصدير النقاش كـ PDF" : "Export Chat PDF",
      desc: lang === "ar" ? "ملفات PDF منظمة لنقاشاتك وتوصياتك المهمة." : "Structured PDF exports for discussions and recommendations."
    },
    {
      icon: <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      title: lang === "ar" ? "الأولوية والحصرية" : "Priority & Exclusivity",
      desc: lang === "ar" ? "شارة الحساب الاحترافي وأولوية للوصول للميزات الجديدة." : "Pro profile badge and early access to new features."
    }
  ];

  return (
    <div className={`p-4 sm:p-6 pb-24 overflow-y-auto no-scrollbar h-full ${isRtl ? 'font-arabic' : 'font-sans'}`} dir="ltr">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/40 via-slate-900/80 to-blue-900/40 border border-indigo-500/30 p-8 sm:p-12 text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 blur-[80px] rounded-full pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-500 p-[2px] mb-6 shadow-2xl shadow-indigo-500/30 overflow-hidden">
              <div className="w-full h-full bg-slate-50 dark:bg-[#020617] rounded-xl flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
              Nashmi <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Pro</span>
            </h1>
            <p className="text-slate-700 dark:text-slate-300 max-w-lg mx-auto text-base sm:text-lg mb-8 leading-relaxed">
              {lang === "ar" 
                ? "ارتق بوعيك المالي لتجربة حصرية من النخبة. استمتع بميزات الذكاء الاصطناعي المتقدمة والأتمتة."
                : "Elevate your financial awareness to an elite tier. Unlock advanced AI and premium automation."}
            </p>
            
            {isPro ? (
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold shadow-lg shadow-emerald-500/10 transition-all">
                <CheckCircle2 className="w-5 h-5" />
                {lang === "ar" ? "حسابك الحالي هو Pro" : "You are a Pro member"}
              </div>
            ) : (
              <button 
                onClick={handleUpgrade}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-indigo-600 hover:bg-indigo-500 text-slate-900 dark:text-white font-bold text-lg shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all hover:-translate-y-1"
              >
                <Sparkles className="w-5 h-5" />
                {lang === "ar" ? "ارتقِ الآن بـ 4.99 دينار/شهر" : "Upgrade Now for JOD 4.99/mo"}
              </button>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6 px-2">
            {lang === "ar" ? "الميزات الحصرية" : "Exclusive Features"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feat, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex flex-col gap-3 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800/80 transition-colors">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  {feat.icon}
                </div>
                <div>
                  <h3 className="text-slate-800 dark:text-slate-200 font-semibold text-base mb-1">{feat.title}</h3>
                  <p className="text-slate-700 dark:text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
