import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, BrainCircuit, Activity, TrendingUp, Target, Briefcase, ArrowRight, ArrowLeft } from "lucide-react";

interface WelcomeScreenProps {
  name: string | null;
  onComplete: () => void;
  lang: "ar" | "en";
}

export default function WelcomeScreen({ name, onComplete, lang }: WelcomeScreenProps) {
  const isRtl = lang === "ar";
  const [countdown, setCountdown] = useState(5);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  useEffect(() => {
    // Check if first login on this device
    const hasLoggedBefore = localStorage.getItem("finx_has_logged_in");
    if (!hasLoggedBefore) {
      setIsFirstLogin(true);
      localStorage.setItem("finx_has_logged_in", "true");
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onComplete]);

  const greeting = isFirstLogin 
    ? (isRtl ? "مرحباً بك في FinX" : "Welcome to FinX")
    : (isRtl ? `سعيدون بعودتك، ${name || "يا صديقي"} 👋` : `Welcome back, ${name || "Friend"} 👋`);

  const subtitle = isFirstLogin
    ? (isRtl ? "جاهز لبناء مستقبل مالي ومهني أكثر ذكاءً؟" : "Ready to build a smarter financial and professional future?")
    : (isRtl ? "جاري تحضير ملخصك المالي الذكي..." : "Preparing your intelligent financial summary...");

  const aiInsights = isFirstLogin ? [
    isRtl ? "اكتشف كيف يمكن للذكاء الاصطناعي تحسين ميزانيتك." : "Discover how AI can optimize your budget.",
  ] : [
    isRtl ? "صحتك المالية تحسنت بنسبة 8% هذا الشهر." : "Your financial health improved by 8% this month.",
    isRtl ? "لديك 3 توصيات جديدة اليوم." : "You have 3 new recommendations today.",
    isRtl ? "تم اكتشاف فرص وظيفية تناسب مهاراتك." : "Job opportunities matching your skills were found."
  ];

  const randomInsight = aiInsights[Math.floor(Math.random() * aiInsights.length)];

  const cards = [
    {
      icon: <Activity className="w-6 h-6 text-emerald-400" />,
      title: isRtl ? "الحالة المالية" : "Financial Status",
      desc: isFirstLogin ? (isRtl ? "تتبع نفقاتك بسهولة" : "Track expenses easily") : (isRtl ? "أداء ممتاز" : "Excellent Performance"),
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20"
    },
    {
      icon: <Briefcase className="w-6 h-6 text-blue-400" />,
      title: isRtl ? "التقدم المهني" : "Career Growth",
      desc: isFirstLogin ? (isRtl ? "طور مسارك المهني" : "Develop your career") : (isRtl ? "+2 فرصة جديدة" : "+2 New Opportunities"),
      bg: "bg-blue-500/10",
      border: "border-blue-500/20"
    },
    {
      icon: <BrainCircuit className="w-6 h-6 text-purple-400" />,
      title: isRtl ? "توصيات الذكاء الاصطناعي" : "AI Recommendations",
      desc: isFirstLogin ? (isRtl ? "نصائح مخصصة لك" : "Personalized advice") : (isRtl ? "جاهزة للمراجعة" : "Ready for review"),
      bg: "bg-purple-500/10",
      border: "border-purple-500/20"
    }
  ];

  return (
    <div className={`fixed inset-0 z-50 bg-transparent flex flex-col items-center justify-center overflow-hidden ${isRtl ? 'font-arabic' : 'font-sans'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Background Ambience */}
      <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute w-[400px] h-[400px] bg-accent-purple/20 rounded-full blur-[100px] translate-x-32 -translate-y-32" 
        />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl px-6">
        
        {/* Animated Logo */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative mb-8 flex flex-col items-center"
        >
          <div className="w-20 h-20 mb-4 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[1px] shadow-2xl shadow-indigo-500/20 relative group">
            <div className="w-full h-full bg-slate-900 rounded-[23px] flex items-center justify-center">
              <BrainCircuit className="w-10 h-10 text-indigo-400 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/40 border-2 border-[#020617]"
            >
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex items-center gap-1"
          >
            <span className="text-2xl font-black text-white tracking-widest">FIN</span>
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">X</span>
          </motion.div>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center space-y-4 mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tight">
            {greeting}
          </h1>
          <p className="text-lg text-text-secondary max-w-lg mx-auto">
            {subtitle}
          </p>
        </motion.div>

        {/* AI Insight Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 mb-10 flex items-start sm:items-center gap-4 backdrop-blur-md relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5" />
          <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex flex-shrink-0 items-center justify-center border border-indigo-500/30 relative z-10">
            <Sparkles className="w-6 h-6 text-indigo-400" />
          </div>
          <div className="relative z-10">
            <h3 className="text-sm font-bold text-indigo-300 mb-1">{isRtl ? "لمحة سريعة" : "Quick Insight"}</h3>
            <p className="text-slate-200 text-sm sm:text-base font-medium">{randomInsight}</p>
          </div>
        </motion.div>

        {/* Quick Overview Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12"
        >
          {cards.map((card, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col items-center text-center transition-all`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${card.bg} ${card.border} border`}>
                {card.icon}
              </div>
              <h4 className="text-white font-bold mb-1">{card.title}</h4>
              <p className="text-xs text-text-secondary">{card.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Area */}
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 1, duration: 0.5 }}
           className="flex flex-col items-center gap-4"
        >
           <button 
             onClick={onComplete}
             className="group relative px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-lg shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:shadow-[0_0_40px_rgba(79,70,229,0.5)] transition-all overflow-hidden flex items-center gap-3"
           >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              {isRtl ? "الدخول إلى FinX" : "Enter FinX"}
              {isRtl ? <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> : <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
           </button>
           
           <div className="flex items-center gap-2 text-xs font-medium text-text-secondary bg-white/5 px-4 py-2 rounded-full border border-white/5">
             <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
             {isRtl ? `دخول تلقائي خلال ${countdown}...` : `Auto-continue in ${countdown}...`}
           </div>
        </motion.div>
      </div>
    </div>
  );
}
