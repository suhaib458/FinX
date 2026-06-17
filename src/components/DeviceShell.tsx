import React, { useState, useEffect } from "react";
import { Wifi, Battery, Signal } from "lucide-react";

interface DeviceShellProps {
  children: React.ReactNode;
  lang: "ar" | "en";
}

export default function DeviceShell({ children, lang }: DeviceShellProps) {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000 * 60);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-slate-900 to-indigo-950/60 flex flex-col items-center justify-center p-0 md:p-6 select-none font-sans overflow-x-hidden">
      {/* Decorative desktop glows - matching Sophisticated Dark design */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-500/5 blur-[130px] pointer-events-none glow-overlay"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-600/5 blur-[130px] pointer-events-none glow-overlay"></div>

      {/* Main Container */}
      <div className="relative w-full md:max-w-[420px] h-screen md:h-[860px] bg-[#020617] md:rounded-[48px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] border-0 md:border-8 border-slate-800 flex flex-col overflow-hidden transition-all duration-300">
        
        {/* Physical Camera Notch / Dynamic Island for Presentation */}
        <div className="hidden md:flex absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-black rounded-b-2xl z-50 items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-zinc-900/40 mr-1.5 border border-zinc-800"></div>
          <div className="w-12 h-1 rounded-full bg-slate-900"></div>
        </div>

        {/* Dynamic Status Bar (Bilingual labels) */}
        <div 
          className="bg-[#020617]/95 text-xs text-zinc-100 flex items-center justify-between px-6 pt-3 md:pt-4 pb-2 z-40 shrink-0 font-medium tracking-wide select-none border-b border-slate-800/60"
          style={{ direction: lang === "ar" ? "rtl" : "ltr" }}
        >
          {/* Network Carrier */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-slate-400">
              {lang === "ar" ? "فنيكس LTE" : "FinX LTE"}
            </span>
          </div>

          {/* Clock */}
          <div className="font-semibold text-slate-200 ml-1">
            {currentTime || "12:00 PM"}
          </div>

          {/* Battery and Wifi status indicators */}
          <div className="flex items-center gap-1.5">
            <Signal className="w-3 h-3 text-slate-300" />
            <Wifi className="w-3 h-3 text-slate-300" />
            <div className="flex items-center gap-0.5">
              <span className="text-[9px] text-slate-400">98%</span>
              <Battery className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
            </div>
          </div>
        </div>

        {/* Physical screen window */}
        <div className="flex-1 w-full flex flex-col overflow-hidden relative bg-[#020617] text-slate-200">
          {children}
        </div>

        {/* Simulated iOS Home Bar for Mobile design style (on Desktop only) */}
        <div className="hidden md:flex justify-center bg-[#020617] py-2.5 z-40 border-t border-slate-800/40">
          <div className="w-32 h-1 bg-slate-700 rounded-full"></div>
        </div>
      </div>
      
      {/* Short instructions on how to toggle on desktop */}
      <p className="hidden md:block text-xs mt-4 text-center text-slate-400 max-w-sm leading-relaxed">
        {lang === "ar" 
          ? "💡 هذا نموذج معاينة للهواتف المحمولة. يدعم المظهر الحركي فنيكس بنسبة 100% والتصميم تفاعلي بالكامل."
          : "💡 This is a mobile app simulator. Interaction elements are 100% responsive and ready for hackathon presentation."}
      </p>
    </div>
  );
}
