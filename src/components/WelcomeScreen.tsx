import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Sparkles, BrainCircuit, Activity } from "lucide-react";

interface WelcomeScreenProps {
  name: string | null;
  onComplete: () => void;
  lang: "ar" | "en";
}

export default function WelcomeScreen({ name, onComplete, lang }: WelcomeScreenProps) {
  const isRtl = lang === "ar";
  
  // Progress bar animation
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Fill progress bar over 2.5 seconds
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 2; // +2% every 50ms => 100% in 2500ms
      });
    }, 50);

    // Call onComplete after 3 seconds total
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [onComplete]);

  const greeting = name 
    ? (isRtl ? `مرحباً بك مجدداً، ${name}` : `Welcome back, ${name}`)
    : (isRtl ? "مرحباً بك في FinX" : "Welcome to FinX");

  const subtitle = isRtl
    ? "مساعدك المالي الذكي قيد التحضير"
    : "Your AI Financial Assistant is ready";

  return (
    <div className="absolute inset-0 z-50 bg-slate-50 dark:bg-[#020617] flex flex-col items-center justify-center overflow-hidden" dir="ltr">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
        <div className="absolute w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[80px] -translate-x-32 -translate-y-32"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Logo */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative mb-4 flex flex-col items-center"
        >
          <div className="w-24 h-24 mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 p-0.5 shadow-2xl shadow-indigo-500/30 relative">
            <div className="w-full h-full bg-slate-50 dark:bg-[#020617] rounded-2xl flex items-center justify-center">
              <BrainCircuit className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            </div>
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/40 border-2 border-slate-50 dark:border-[#020617]"
            >
              <Sparkles className="w-4 h-4 text-slate-900 dark:text-white" />
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex items-center gap-1"
          >
            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-widest">FIN</span>
            <span className="text-xl font-bold text-indigo-500">X</span>
          </motion.div>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center space-y-3 px-6"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            {greeting}
          </h1>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-400 flex items-center justify-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500 animate-pulse" />
            {subtitle}
          </p>
        </motion.div>

        {/* Health Score Metric / Loading Enhancement */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-12 w-64 p-4 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 backdrop-blur-sm"
        >
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs text-slate-700 dark:text-slate-400 font-medium">{isRtl ? "جاري مزامنة بياناتك..." : "Syncing financial data..."}</span>
            <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
