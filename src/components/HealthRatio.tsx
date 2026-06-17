import React, { useState } from "react";
import { 
  TrendingUp, 
  Scale, 
  Flame, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Coins, 
  BadgeHelp,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { translations } from "../translations";
import { FinancialAnalysis } from "../types";

interface HealthRatioProps {
  lang: "ar" | "en";
  analysis: FinancialAnalysis;
}

export default function HealthRatio({ lang, analysis }: HealthRatioProps) {
  const t = translations[lang];
  const isRtl = lang === "ar";
  const score = analysis.healthScore;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getScoreColor = (val: number) => {
    if (val >= 80) return "text-emerald-400";
    if (val >= 60) return "text-amber-400";
    return "text-rose-400";
  };

  const getScoreLabel = (val: number) => {
    if (val >= 85) return t.excellentState;
    if (val >= 70) return t.goodState;
    if (val >= 50) return t.fairState;
    return t.cautionState;
  };

  // Matrix categories
  const breakdownElements = [
    {
      id: "savings",
      title: t.componentSavingsTitle,
      desc: t.componentSavingsDesc,
      icon: <TrendingUp className="w-4.5 h-4.5 text-indigo-400" />,
      rating: score >= 85 ? "95%" : score >= 50 ? "75%" : "25%",
      stateColor: score >= 85 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : score >= 50 ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20",
      statusText: score >= 85 ? (isRtl ? "مستدام" : "Excellent") : score >= 50 ? (isRtl ? "جيد" : "Moderate") : (isRtl ? "منخفض" : "Critical"),
    },
    {
      id: "debt",
      title: t.componentDebtTitle,
      desc: t.componentDebtDesc,
      icon: <Scale className="w-4.5 h-4.5 text-indigo-400" />,
      rating: score >= 85 ? "0-10%" : score >= 50 ? "15-25%" : "35%+",
      stateColor: score >= 85 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : score >= 50 ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20",
      statusText: score >= 85 ? (isRtl ? "آمن تماماً" : "Fully Secure") : score >= 50 ? (isRtl ? "معتدل" : "Average") : (isRtl ? "مرتفع الديون" : "High Burden"),
    },
    {
      id: "discipline",
      title: t.componentDisciplineTitle,
      desc: t.componentDisciplineDesc,
      icon: <Flame className="w-4.5 h-4.5 text-rose-400" />,
      rating: score >= 85 ? (isRtl ? "ممتاز" : "High") : score >= 50 ? (isRtl ? "متوسط" : "Medium") : (isRtl ? "ضعيف" : "Low"),
      stateColor: score >= 85 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : score >= 50 ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20",
      statusText: score >= 85 ? (isRtl ? "منضبط" : "Disciplined") : score >= 50 ? (isRtl ? "شبه منفلت" : "Emotional") : (isRtl ? "استهلاك مفرط" : "Overspending"),
    },
    {
      id: "emergency",
      title: t.componentEmergencyTitle,
      desc: t.componentEmergencyDesc,
      icon: <ShieldCheck className="w-4.5 h-4.5 text-indigo-400" />,
      rating: score >= 85 ? (isRtl ? "6 أشهر" : "6 Months") : score >= 50 ? (isRtl ? "3 أشهر" : "3 Months") : (isRtl ? "أسبوع واحد" : "Insufficient"),
      stateColor: score >= 85 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : score >= 50 ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20",
      statusText: score >= 85 ? (isRtl ? "مكتمل" : "Covered") : score >= 50 ? (isRtl ? "كافٍ" : "Adequate") : (isRtl ? "قريب للصفر" : "None"),
    },
  ];

  return (
    <div 
      className="flex-1 overflow-y-auto px-4 py-5 space-y-5"
      style={{ direction: isRtl ? "rtl" : "ltr" }}
    >
      {/* Title bar */}
      <div>
        <p className="text-[10px] tracking-wider text-slate-400 uppercase font-mono">
          {isRtl ? "تفاصيل وتصنيف النتيجة" : "FINANCIAL SCORE DECODED"}
        </p>
        <h2 className={`text-xl font-bold text-zinc-100 ${isRtl ? 'font-arabic' : 'font-sans'}`}>
          {t.detailedAnalysis}
        </h2>
      </div>

      {/* Big Interactive Arc score Dial */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/50 p-6 border border-slate-800 text-center flex flex-col items-center">
        <div className="absolute top-0 left-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>

        {/* Large Score Indicator Circle */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 128 128">
            <circle
              cx="64"
              cy="64"
              r="52"
              className="text-slate-800/60"
              strokeWidth="7"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="64"
              cy="64"
              r="52"
              className={score >= 80 ? "text-indigo-500" : score >= 60 ? "text-amber-400" : "text-rose-400"}
              strokeWidth="8"
              strokeDasharray={326}
              strokeDashoffset={326 - (326 * score) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          
          {/* Text labels inside Circle */}
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-0.5 mt-1">
            <span className="text-3xl font-black font-mono text-white leading-none">
              {score}
            </span>
            <span className="text-[10px] text-zinc-400 tracking-wider font-mono">
              / 100
            </span>
          </div>
        </div>

        {/* Breakdown detail feedback */}
        <div className="mt-4 space-y-1">
          <h3 className={`text-base font-bold ${getScoreColor(score)}`}>
            {getScoreLabel(score)}
          </h3>
          <p className="text-[11px] text-slate-300 leading-relaxed max-w-xs">
            {analysis.scoreExplanation}
          </p>
        </div>
      </div>

      {/* Health Evaluation Matrix (Detailed Grid) */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          {t.analysisCategoryTitle}
        </h3>
        <div className="space-y-2">
          {breakdownElements.map((el) => {
            const isExpanded = expandedId === el.id;
            return (
              <div 
                key={el.id}
                onClick={() => setExpandedId(isExpanded ? null : el.id)}
                className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden cursor-pointer hover:border-indigo-500/20 transition-all duration-300"
              >
                {/* Header Line */}
                <div className="p-3.5 flex items-center justify-between gap-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center border border-slate-850">
                      {el.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">{el.title}</h4>
                      <p className="text-[9px] text-slate-500 font-mono">
                        {isRtl ? `القيمة: ${el.rating}` : `Value: ${el.rating}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${el.stateColor}`}>
                      {el.statusText}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </div>
                </div>

                {/* Expanded Description panel */}
                {isExpanded && (
                  <div className="px-3.5 pb-4.5 pt-1.5 border-t border-slate-950 bg-slate-950/45 text-[11px] text-slate-400 leading-relaxed font-sans">
                    {el.desc}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actionable recommendations checklist section */}
      <div className="rounded-2xl p-4.5 bg-gradient-to-r from-indigo-950/25 to-slate-900 border border-slate-800 space-y-3.5">
        <h3 className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-4.5 h-4.5 text-indigo-400" />
          {t.tipsImproveTitle}
        </h3>
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-850 text-[11.5px] leading-relaxed text-slate-300">
            {t.tipsImprove1}
          </div>
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-850 text-[11.5px] leading-relaxed text-slate-300">
            {t.tipsImprove2}
          </div>
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-850 text-[11.5px] leading-relaxed text-slate-300">
            {t.tipsImprove3}
          </div>
        </div>
      </div>
    </div>
  );
}
