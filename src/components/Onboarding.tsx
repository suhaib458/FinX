import React, { useState } from "react";
import { Sparkles, TrendingUp, Bot, ArrowRight, ArrowLeft, Lock } from "lucide-react";
import { translations } from "../translations";

interface OnboardingProps {
  lang: "ar" | "en";
  onComplete: () => void;
}

export default function Onboarding({ lang, onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const t = translations[lang];

  const steps = [
    {
      title: t.onboardingStep1Title,
      desc: t.onboardingStep1Desc,
      icon: <Sparkles className="w-12 h-12 text-indigo-400" />,
      gradient: "from-indigo-600/15 via-slate-900/50 to-slate-950",
    },
    {
      title: t.onboardingStep2Title,
      desc: t.onboardingStep2Desc,
      icon: <TrendingUp className="w-12 h-12 text-indigo-400" />,
      gradient: "from-blue-600/15 via-slate-900/50 to-slate-950",
    },
    {
      title: t.onboardingStep3Title,
      desc: t.onboardingStep3Desc,
      icon: <Bot className="w-12 h-12 text-indigo-400" />,
      gradient: "from-purple-600/15 via-slate-900/50 to-slate-950",
    },
  ];

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const isRtl = lang === "ar";

  return (
    <div 
      className={`flex-1 flex flex-col justify-between p-6 bg-gradient-to-b ${steps[step].gradient} text-white transition-all duration-500`}
      style={{ direction: isRtl ? "rtl" : "ltr" }}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-700 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-indigo-500/20">
            <span className="font-extrabold text-white text-base font-sans">FX</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              {t.appName}
            </h1>
          </div>
        </div>
        <button 
          onClick={onComplete}
          className="text-xs font-semibold text-slate-400 hover:text-indigo-400 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 transition-colors"
        >
          {t.skip}
        </button>
      </div>

      {/* Slide Illustration Block & Description */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 my-6">
        {/* Glowing Central Graphic */}
        <div className="relative mb-10 group">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/10 to-blue-500/10 blur-2xl group-hover:scale-110 transition-transform duration-300"></div>
          <div className="relative w-28 h-28 rounded-3xl bg-slate-900/90 border-2 border-slate-800 flex items-center justify-center shadow-2xl backdrop-blur-md">
            {steps[step].icon}
            {/* Tiny accent ring */}
            <div className="absolute w-22 h-22 rounded-full border border-indigo-500/10 animate-spin" style={{ animationDuration: '10s' }}></div>
          </div>
          <span className="absolute -bottom-2 -right-2 bg-slate-800 text-indigo-400 border border-slate-700 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold font-mono shadow-md">
            {step + 1}
          </span>
        </div>

        {/* Dynamic Typography Header */}
        <h2 className={`text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300 tracking-tight leading-snug mb-4 ${isRtl ? 'font-arabic' : ''}`}>
          {steps[step].title}
        </h2>

        {/* Dynamic Description Paragraph */}
        <p className={`text-sm text-slate-400 text-center leading-relaxed max-w-xs ${isRtl ? 'font-arabic' : ''}`}>
          {steps[step].desc}
        </p>
      </div>

      {/* Footer Controls */}
      <div className="space-y-6 pb-4">
        {/* Slide Indicator Dots */}
        <div className="flex justify-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? "w-6 bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" : "w-1.5 bg-slate-800"
              }`}
            />
          ))}
        </div>

        {/* Buttons Controls */}
        <div className="flex items-center gap-4">
          {/* Back Button */}
          {step > 0 && (
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition-all"
            >
              {isRtl ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
            </button>
          )}

          {/* Core Multi Language Action Button */}
          <button
            onClick={handleNext}
            className={`flex-1 h-12 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-700 text-white font-semibold text-sm tracking-wide shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2 transition-all cursor-pointer ${isRtl ? 'font-arabic' : ''}`}
          >
            <span>{step === 2 ? t.getStarted : t.next}</span>
            {step < 2 && (isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />)}
          </button>
        </div>

        {/* Micro Security Notice */}
        <div className="flex items-start gap-1.5 px-2 justify-center">
          <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-slate-500 leading-snug max-w-[280px]">
            {t.privacyNotice}
          </p>
        </div>
      </div>
    </div>
  );
}
