import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface LaunchVideoProps {
  onComplete: () => void;
}

export default function LaunchVideo({ onComplete }: LaunchVideoProps) {
  const [scene, setScene] = useState(0);

  useEffect(() => {
    // Sequence timing
    // Scene 0: Start to 5s
    // Scene 1: 5s to 10s
    // Scene 2: 10s to 15s
    // Scene 3: 15s to 20s
    // Scene 4: 20s to 25s
    // Scene 5: 25s to 30s -> end
    const timers = [
      setTimeout(() => setScene(1), 5000),
      setTimeout(() => setScene(2), 10000),
      setTimeout(() => setScene(3), 15000),
      setTimeout(() => setScene(4), 20000),
      setTimeout(() => setScene(5), 25000),
      setTimeout(() => onComplete(), 30000),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="absolute inset-0 z-50 bg-slate-50 dark:bg-[#020617] overflow-hidden flex flex-col items-center justify-center font-arabic">
      
      {/* Background Particles / Ambiance */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#020617] to-[#020617]"></div>
      <motion.div
        className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"
        animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
        transition={{ duration: 25, ease: "linear", repeat: Infinity }}
      />
      
      <AnimatePresence mode="wait">
        
        {/* SCENE 0: Questioning */}
        {scene === 0 && (
          <motion.div
            key="scene0"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 1.5 }}
            className="flex flex-col items-center justify-center space-y-8 absolute w-full px-8 text-center"
          >
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-widest leading-relaxed"
            >
              هل تعرف إلى أين تذهب أموالك؟
            </motion.h1>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3, duration: 1 }}
              className="text-xl md:text-2xl font-bold text-indigo-500 dark:text-indigo-300 leading-relaxed"
            >
              وهل تعرف إلى أين ستقودك قراراتك المالية؟
            </motion.h2>
          </motion.div>
        )}

        {/* SCENE 1: FinX Intro */}
        {scene === 1 && (
          <motion.div
            key="scene1"
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 1.5 }}
            className="flex flex-col items-center justify-center space-y-12 absolute w-full"
          >
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-700 flex items-center justify-center shadow-[0_0_60px_rgba(79,70,229,0.5)]">
              <span className="text-slate-900 dark:text-white text-4xl font-black font-sans tracking-tight">FX</span>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-200"
            >
              FinX... مساعدك الذكي لفهم مستقبلك المالي.
            </motion.p>
          </motion.div>
        )}

        {/* SCENE 2: The UI / Capabilities */}
        {scene === 2 && (
          <motion.div
            key="scene2"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 1.5 }}
            className="flex flex-col items-center justify-center space-y-10 absolute w-full"
          >
            <div className="flex gap-4 items-center justify-center w-full px-6">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl p-4 w-32 shadow-2xl backdrop-blur-md"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2 text-xs">85</div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full w-3/4 mx-auto mb-1"></div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full w-1/2 mx-auto"></div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 }}
                className="bg-indigo-900/40 border border-indigo-500/30 rounded-xl p-4 w-36 shadow-[0_0_30px_rgba(99,102,241,0.2)] backdrop-blur-md z-10 scale-110"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-indigo-500 dark:text-indigo-300">AI</span>
                </div>
                <div className="h-2 bg-indigo-500/30 rounded-full w-full mb-1.5"></div>
                <div className="h-2 bg-indigo-500/30 rounded-full w-5/6 mx-auto"></div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.5 }}
                className="bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl p-4 w-32 shadow-2xl backdrop-blur-md flex flex-col items-end"
              >
                <div className="w-full flex justify-between items-end h-10 mb-2 gap-1 opacity-60">
                   <div className="w-1/4 bg-slate-200 dark:bg-slate-700 h-1/2 rounded-t-sm"></div>
                   <div className="w-1/4 bg-rose-500/50 h-3/4 rounded-t-sm"></div>
                   <div className="w-1/4 bg-emerald-500/50 h-full rounded-t-sm"></div>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full w-3/4 mb-1"></div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full w-1/2"></div>
              </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.2 }}
              className="flex gap-8 text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-l from-slate-900 to-indigo-600 dark:from-white dark:to-indigo-400 tracking-wider"
            >
              <span>حلّل</span>
              <span className="opacity-50">•</span>
              <span>توقّع</span>
              <span className="opacity-50">•</span>
              <span>طوّر</span>
            </motion.div>
          </motion.div>
        )}

        {/* SCENE 3: Simulation */}
        {scene === 3 && (
          <motion.div
            key="scene3"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 1.5 }}
            className="flex flex-col items-center justify-center space-y-8 absolute w-full px-6 text-center"
          >
            <div className="relative w-48 h-48 flex items-center justify-center">
               <motion.div 
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-t-2 border-r-2 border-indigo-500/50 opacity-40"
               ></motion.div>
               <motion.div 
                  initial={{ rotate: 360 }}
                  animate={{ rotate: 0 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-4 rounded-full border-b-2 border-l-2 border-emerald-500/50 opacity-40"
               ></motion.div>
               
               <motion.div className="flex flex-col items-center">
                  <span className="text-3xl font-mono text-slate-900 dark:text-white mb-1">2029</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">+45,000 د.أ</span>
               </motion.div>
            </div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white"
            >
              جرّب قراراتك قبل اتخاذها
            </motion.h2>
            
            <motion.p
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 1.5 }}
               className="text-lg text-indigo-500 dark:text-indigo-300 font-medium max-w-sm"
            >
              اعرف أثر كل قرار قبل أن تتخذه.
            </motion.p>
          </motion.div>
        )}

        {/* SCENE 4: AI Recommendations */}
        {scene === 4 && (
          <motion.div
            key="scene4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 1.5 }}
            className="flex flex-col items-center justify-center space-y-8 absolute w-full px-6"
          >
            <div className="flex flex-col space-y-4 w-full max-w-[280px]">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-indigo-900/40 border border-indigo-500/30 p-4 rounded-2xl flex items-center gap-3 backdrop-blur-md"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">1</div>
                <span className="text-slate-900 dark:text-white font-bold text-sm">تحسين الإنفاق</span>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 }}
                className="bg-indigo-900/40 border border-indigo-500/30 p-4 rounded-2xl flex items-center gap-3 backdrop-blur-md"
              >
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">2</div>
                <span className="text-slate-900 dark:text-white font-bold text-sm">زيادة الادخار</span>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5 }}
                className="bg-indigo-900/40 border border-indigo-500/30 p-4 rounded-2xl flex items-center gap-3 backdrop-blur-md"
              >
                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">3</div>
                <span className="text-slate-900 dark:text-white font-bold text-sm">تحقيق الأهداف المالية</span>
              </motion.div>
            </div>
            
            <motion.p
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 2.2 }}
               className="text-xl md:text-2xl text-center font-extrabold text-transparent bg-clip-text bg-gradient-to-l from-slate-900 to-indigo-600 dark:from-white dark:to-indigo-400 tracking-wider"
            >
              ذكاء اصطناعي يحول البيانات إلى قرارات.
            </motion.p>
          </motion.div>
        )}

        {/* SCENE 5: HERO LAUNCH */}
        {scene === 5 && (
          <motion.div
            key="scene5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="flex flex-col items-center justify-center space-y-12 absolute w-full h-full bg-[radial-gradient(circle_at_center,_#1e1b4b_0%,_#020617_60%)]"
          >
            <div className="relative flex items-center justify-center">
               <motion.div 
                 initial={{ opacity: 0, scale: 0 }}
                 animate={{ opacity: 0.6, scale: 1.5 }}
                 transition={{ delay: 0.5, duration: 2 }}
                 className="absolute w-40 h-40 bg-indigo-500 rounded-full blur-[80px]"
               ></motion.div>
               
               <motion.div 
                 initial={{ y: 30, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 transition={{ delay: 1, duration: 1.5, type: "spring" }}
                 className="w-28 h-28 rounded-[2rem] bg-gradient-to-tr from-indigo-600 to-blue-700 flex items-center justify-center shadow-[0_0_80px_rgba(79,70,229,0.5)] z-10 border border-white/10"
               >
                 <span className="text-slate-900 dark:text-white text-5xl font-black font-sans tracking-tight">FX</span>
               </motion.div>
            </div>
            
            <div className="flex flex-col items-center space-y-4">
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2 }}
                className="text-4xl text-slate-900 dark:text-white font-extrabold tracking-widest break-words"
              >
                FinX
              </motion.h1>
              <motion.h2 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 2.5 }}
                 className="text-xl md:text-2xl text-transparent bg-clip-text bg-gradient-to-l from-slate-900 to-indigo-600 dark:from-white dark:to-indigo-400 font-bold"
              >
                من تتبع المال... إلى صناعة القرار
              </motion.h2>
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3 }}
                className="text-lg text-slate-700 dark:text-slate-400 font-medium tracking-wide mt-2"
              >
                ذكاء مالي للمستقبل
              </motion.h3>
            </div>
            
            {/* Skip Button showing just before ends */}
            <motion.button
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 4 }}
               onClick={onComplete}
               className="absolute bottom-8 px-6 py-2 rounded-full border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-sm font-medium z-50 focus:outline-none"
            >
               الدخول للتطبيق
            </motion.button>
          </motion.div>
        )}
        
      </AnimatePresence>
      
      {/* Background skip overlay (allows skipping the video anytime) - optional */}
      {scene < 5 && (
        <button 
          onClick={onComplete}
          className="absolute top-6 right-6 text-slate-700 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-700 dark:text-slate-300 text-xs font-mono z-50 transition-colors"
        >
          {scene === 0 ? "" : "SKIP >>"}
        </button>
      )}
    </div>
  );
}
