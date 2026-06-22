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
  ChevronUp,
  Target,
  Car
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
    if (val >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (val >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-rose-600 dark:text-rose-400";
  };

  const getScoreLabel = (val: number) => {
    if (val >= 85) return t.excellentState;
    if (val >= 70) return t.goodState;
    if (val >= 50) return t.fairState;
    return t.cautionState;
  };

  // Calculate dynamic metrics
  const savingsRate = Math.round(analysis.savingsRate);
  
  // Estimate debt ratio (assuming Housing & Bills or fixed expenses)
  const debtExpense = analysis.categories.find(c => c.name.includes("السكن") || c.name.toLowerCase().includes("housing"))?.value || (analysis.monthlyExpenses * 0.3);
  const debtRatio = analysis.monthlyIncome > 0 ? Math.round((debtExpense / analysis.monthlyIncome) * 100) : 0;
  
  // Goal Progress logic (Based on savings target)
  const goalTarget = analysis.monthlyIncome * 0.2; // 20% target
  const goalProgress = goalTarget > 0 ? Math.min(100, Math.round(((analysis.monthlyIncome - analysis.monthlyExpenses) / goalTarget) * 100)) : 0;
  
  // Spending profile
  const discretionaryExpense = analysis.categories.find(c => c.name.includes("التسوق") || c.name.toLowerCase().includes("shopping"))?.value || (analysis.monthlyExpenses * 0.2);
  const spendingRatio = analysis.monthlyIncome > 0 ? Math.round((discretionaryExpense / analysis.monthlyIncome) * 100) : 0;

  // Matrix categories
  const breakdownElements = [
    {
      id: "savings",
      title: isRtl ? "مؤشر الادخار" : "Savings Score",
      desc: isRtl ? "يقيس مدى قدرتك على الاحتفاظ بجزء من دخلك كمدخرات شهرية مستدامة." : "Measures your ability to retain a portion of your income as sustainable monthly savings.",
      icon: <TrendingUp className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />,
      rating: `${savingsRate}%`,
      progress: Math.min(100, savingsRate * 3), // Visual scale multiplier
      stateColor: savingsRate >= 20 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : savingsRate >= 10 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      statusText: savingsRate >= 20 ? (isRtl ? "مستدام" : "Excellent") : savingsRate >= 10 ? (isRtl ? "جيد" : "Moderate") : (isRtl ? "منخفض" : "Critical"),
    },
    {
      id: "debt",
      title: isRtl ? "مؤشر الديون" : "Debt Score",
      desc: isRtl ? "يعكس التزاماتك المالية الشهرية كنسبة مئوية من إجمالي الدخل." : "Reflects your fixed monthly financial commitments as a percentage of gross income.",
      icon: <Scale className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />,
      rating: `${debtRatio}%`,
      progress: Math.max(0, 100 - debtRatio), // Inverse visualization
      stateColor: debtRatio <= 25 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : debtRatio <= 40 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      statusText: debtRatio <= 25 ? (isRtl ? "آمن تماماً" : "Fully Secure") : debtRatio <= 40 ? (isRtl ? "معتدل" : "Average") : (isRtl ? "مرتفع الديون" : "High Burden"),
    },
    {
      id: "discipline",
      title: isRtl ? "مؤشر الإنفاق" : "Spending Score",
      desc: isRtl ? "يقيم حجم نفقاتك الكمالية مقابل نفقاتك الأساسية ومدخراتك." : "Evaluates discretionary spending against baseline essential expenses and savings.",
      icon: <Flame className="w-4.5 h-4.5 text-rose-600 dark:text-rose-400" />,
      rating: `${spendingRatio}%`,
      progress: Math.max(0, 100 - (spendingRatio * 2)),
      stateColor: spendingRatio <= 15 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : spendingRatio <= 30 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      statusText: spendingRatio <= 15 ? (isRtl ? "منضبط" : "Disciplined") : spendingRatio <= 30 ? (isRtl ? "شبه منفلت" : "Emotional") : (isRtl ? "استهلاك مفرط" : "Overspending"),
    },
    {
      id: "goal",
      title: isRtl ? "تقدم الأهداف" : "Goal Progress Score",
      desc: isRtl ? "مدى التزامك بتحقيق هدف الادخار الشهري الأمثل (20%)." : "Adherence to achieving the optimal baseline monthly savings target (20%).",
      icon: <CheckCircle2 className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />,
      rating: `${goalProgress}%`,
      progress: goalProgress,
      stateColor: goalProgress >= 100 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : goalProgress >= 50 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      statusText: goalProgress >= 100 ? (isRtl ? "مكتمل" : "Covered") : goalProgress >= 50 ? (isRtl ? "كافٍ" : "Adequate") : (isRtl ? "متأخر" : "Falling behind"),
    },
  ];

  return (
    <div 
      className={`flex-1 overflow-y-auto px-4 py-5 space-y-5 ${isRtl ? 'text-right' : 'text-left'}`}
    >
      {/* Title bar */}
      <div>
        <p className="text-[10px] tracking-wider text-slate-700 dark:text-slate-400 uppercase font-mono">
          {isRtl ? "تفاصيل وتصنيف النتيجة" : "FINANCIAL SCORE DECODED"}
        </p>
        <h2 className={`text-xl font-bold text-slate-900 dark:text-zinc-100 ${isRtl ? 'font-arabic' : 'font-sans'}`}>
          {t.detailedAnalysis}
        </h2>
      </div>

      {/* Big Interactive Arc score Dial */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900/50 p-6 border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center">
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
              className={score >= 80 ? "text-indigo-500" : score >= 60 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"}
              strokeWidth="8"
              strokeDasharray={326}
              strokeDashoffset={326 - (326 * score) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          
          {/* Text labels inside Circle */}
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-0.5 mt-1">
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-white leading-none">
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
          <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed max-w-xs">
            {analysis.scoreExplanation}
          </p>
        </div>
      </div>

      {/* Health Evaluation Matrix (Detailed Grid) */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          {t.analysisCategoryTitle}
        </h3>
        <div className="space-y-2">
          {breakdownElements.map((el) => {
            const isExpanded = expandedId === el.id;
            return (
              <div 
                key={el.id}
                onClick={() => setExpandedId(isExpanded ? null : el.id)}
                className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden cursor-pointer hover:border-indigo-500/20 transition-all duration-300"
              >
                {/* Header Line */}
                <div className="p-3.5 flex items-center justify-between gap-3.5 relative">
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-950 flex items-center justify-center border border-slate-850 shrink-0">
                      {el.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center w-full mb-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{el.title}</h4>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${el.stateColor}`}>
                          {el.statusText}
                        </span>
                      </div>
                      
                      {/* Metric & Progress Bar */}
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] text-slate-700 dark:text-slate-400 font-mono font-bold w-8 text-right shrink-0">
                          {el.rating}
                        </p>
                        <div className="h-1.5 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${el.progress >= 80 ? 'bg-emerald-500' : el.progress >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                            style={{ width: `${Math.min(100, Math.max(0, el.progress))}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center shrink-0 ml-2">
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-700 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-700 dark:text-slate-300" /> : <ChevronDown className="w-4 h-4 text-slate-700 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-700 dark:text-slate-300" />}
                  </div>
                </div>

                {/* Expanded Description panel */}
                {isExpanded && (
                  <div className="px-3.5 pb-4.5 pt-1.5 border-t border-slate-950 bg-slate-950/45 text-[11px] text-slate-700 dark:text-slate-400 leading-relaxed font-sans">
                    {el.desc}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Goals Section */}
      <div className="space-y-2.5 mt-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            {isRtl ? "الأهداف المرئية" : "Visual Goals"}
          </h3>
          <span className="bg-indigo-500/20 text-indigo-500 dark:text-indigo-300 text-[9px] px-2 py-0.5 rounded-full border border-indigo-500/30 uppercase tracking-wider font-mono">Pro</span>
        </div>
        
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[30px] rounded-full pointer-events-none transition-all group-hover:bg-indigo-500/10"></div>
          
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center border border-slate-600 shadow-sm">
                <Car className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{isRtl ? "شراء سيارة" : "Buy a Car"}</h4>
                <p className="text-[10px] text-slate-700 dark:text-slate-400 font-mono">1,500 / 10,000 JOD</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400">15%</span>
              <p className="text-[9px] text-slate-700 dark:text-slate-400 uppercase">{isRtl ? "تم إنجازه" : "Completed"}</p>
            </div>
          </div>

          <div className="relative z-10">
            <div className="flex gap-1 h-3 mt-4">
              {[...Array(10)].map((_, i) => (
                <div 
                  key={i} 
                  className={`flex-1 rounded-sm ${i < 2 ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : i === 2 ? 'bg-indigo-900 border border-indigo-500/30' : 'bg-slate-100 dark:bg-slate-800'}`}
                />
              ))}
            </div>
          </div>
          <p className="text-[10px] text-slate-700 dark:text-slate-400 mt-4 leading-relaxed relative z-10">
            {isRtl ? "مؤشرات الذكاء الاصطناعي: بمعدل ادخارك الحالي (20%)، ستصل إلى هدفك خلال 14 شهر." : "AI Insights: At your current savings rate (20%), you will reach this goal in 14 months."}
          </p>
        </div>
      </div>

      {/* Actionable recommendations checklist section */}
      <div className="rounded-2xl p-4.5 bg-gradient-to-r from-indigo-950/25 to-slate-50 dark:to-slate-900 border border-slate-200 dark:border-slate-800 space-y-3.5">
        <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
          {t.tipsImproveTitle}
        </h3>
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-850 text-[11.5px] leading-relaxed text-slate-700 dark:text-slate-300">
            {t.tipsImprove1}
          </div>
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-850 text-[11.5px] leading-relaxed text-slate-700 dark:text-slate-300">
            {t.tipsImprove2}
          </div>
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-850 text-[11.5px] leading-relaxed text-slate-700 dark:text-slate-300">
            {t.tipsImprove3}
          </div>
        </div>
      </div>
    </div>
  );
}
